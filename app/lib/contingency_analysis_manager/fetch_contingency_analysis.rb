module ContingencyAnalysisManager
  module FetchContingencyAnalysis

    def process_annotations(annotations,alignment=nil)
      data = {}
      variants = {}
      unless annotations.kind_of? Array then
        annotations = [annotations]
      end
      annotations.each do |a|
        if a.key? "visualization_type" and a['visualization_type'] == "variants" then
          acc = nil
          if a.key? 'chain' then
            acc = alignment[a['chain']].keys[0]
          elsif a.key? 'acc' then
            acc = a["acc"]
          else
            next
          end
          variants[acc] = [] unless variants.key? acc
          a['data'].each do |d|
            _d = d
            _d['start'] = _d['begin']
            _d['end'] = _d['begin']
            _d['original'] = "X"
            _d['original'] = _d['wildtype'] if _d.key? "wildtype"
            variants[acc].push _d
          end
        elsif !a.key? "visualization_type" or a['visualization_type'] != "continuous" then 
          chains = nil
          if a.key? 'chain' then
            chains = {a['chain']=>true}
          elsif not alignment.nil? then
            chains = {}
            alignment.each do |ch,v_ch|
              v_ch.each do |acc,v_acc|
                chains[ch]=true if acc == a['acc']
              end
            end
          end
          unless chains.nil? then
            chains.each do |ch,v|
              data[ch] = {} unless data.key? ch
            end
          end
          a['data'].each do |d|
            next unless d.key? "type"
            if a.key? 'chain' then
              acc = alignment[a['chain']].keys[0]    
              start = alignment[a['chain']][acc]["inverse"][d['begin'].to_s]
              end_ = alignment[a['chain']][acc]["inverse"][d['end'].to_s]
            else
              start = d['begin']
              end_ = d['end']
            end

            x = {'start'=>start,'end'=>end_}
            if d.key? 'color' then
              x['color'] = d['color']
            end

            if not alignment.nil? then
              chains.each do |ch,v|
                data[ch][ d['type'] ] = [] unless data[ch].key? d['type']
                data[ch][d['type']].push(x)
              end
            else
              data[ d['type'] ] = [] unless data.key? d['type'] 
              data[d['type']].push(x)
            end

          end
        end
      end
      if alignment.nil? then
        out = []
        data.each do |type,v_type|
          out.push({name:type,external:v_type})
        end       
      else
        out = {}
        data.each do |ch,v_ch|
          out[ch] = []
          v_ch.each do |type,v_type|
            out[ch].push({name:type,external:v_type})
          end
        end
      end
      return out, variants
    end

    def f_analyse_pdb(params)
      pdb = params[:pdb]
      annotations = params[:annotations]
      path = nil
      user_variants = nil
      alignment = nil
      if not params[:file].nil? and params[:pdb] =~ /interactome3d/ then
        path = "interactome3d"
        pdb = params[:file]
        interface_key = :interface
        rri_key = :rri
        alignment = JSON.parse(Interactome3dDatum.find_by(pdbId: pdb).data)
      elsif not params[:file].nil? then
        path = params[:pdb]
        pdb = params[:file]
        alignment = fetchPDBalignment(path)
        alignment = alignment[pdb]
        interface_key = "interface"
        rri_key = "rri"
      else
        interface_key = :interface
        rri_key = :rri
        alignment = fetchPDBalignment(pdb)
      end
      unless annotations.nil? then
        annotations = JSON.parse(annotations) if annotations.instance_of?(String)
        annotations, user_variants = process_annotations(annotations,alignment=alignment)
      end
      rri = runBiopythonInterface(pdb,path)
      contingency_table = {}
      features = {}
      bs = nil
      alignment.each do |ch,v_ch|
        v_ch.each do |acc,v_acc|
          bs = []
          if rri[interface_key].length > 1 then
            bs_rri = rri[rri_key][0]
            if bs_rri.key? ch then
              bs_rri[ch].each do |ch_j,pairs|
                w = {}
                pairs.each do |rr|
                  w[rr[0]]=true
                end
                v = []
                w.keys().each do |k|
                  v.push({'start'=>k,'end'=>k})
                end
                bs.push({name:"INTERFACE "+ch+ch_j,bs:v})
              end
            end
          end
          bs.concat annotations[ch] if not annotations.nil? and annotations.key? ch
          user_var = []
          user_var = user_variants[acc] if not user_variants.nil? and user_variants.key? acc
          contingency_table[ch], features[ch] = test_uniprot(acc, extra={bs:bs,var:user_var}, type=params[:type])
        end
      end
      return {analysis:contingency_table, features:features}
    end

    def test_uniprot(acc,extra={bs:[],var:[]},type="contingency",job=nil)
      seq = fetchUniprotSequence(acc)
      n_seq = seq.aalen

      features_table = []
      all_features = {}
      variants_table = []
      extra[:bs].each do |e|
        if e.key? :bs then
          _table, _features = format_features(e[:bs], _type=nil, name="INTERACTING_RESIDUES", no_tracker=false, _key=e[:name])
        elsif e.key? :external then
          _table, _features = format_features(e[:external], _type=nil, name=e[:name], no_tracker=false, _key=e[:name])
        end
        features_table.push(_table)
        all_features.merge! _features
      end


      job.update_info("collectNucleotideBindingDataFromUniprot "+acc+" begin ") if(job)
      nucleotide_bs = collectNucleotideBindingDataFromUniprot(acc)
      _table, _features = format_features(nucleotide_bs)
      features_table.push( _table )
      all_features.merge! _features

      job.update_info("collectElmDataFromUniprot "+acc+" begin ") if(job)
      elm = collectElmDataFromUniprot(acc)
      _table, _features = format_features(elm)
      features_table.push( _table )
      all_features.merge! _features

      job.update_info("collectMetalBindingDataFromUniprot "+acc+" begin ") if(job)
      metal_bs = collectMetalBindingDataFromUniprot(acc)
      _table, _features = format_features(metal_bs)
      features_table.push( _table )
      all_features.merge! _features

      job.update_info("collectPTMDataFromUniprot "+acc+" begin ") if(job)
      ptms = collectPTMdataFromUniprot(acc)
      _table, _features = format_features(ptms, _type="type")
      features_table.push( _table )
      all_features.merge! _features

      job.update_info("collectVariantDataFromUniprot "+acc+" begin ") if(job)
      variants = collectVariantDataFromUniprot(acc)
      variants.concat extra[:var]
      _table, _features = format_features(variants, _type="disease", name=nil, no_tracker=true)
      variants_table.push( _table )
      all_features.merge! _features
      
      job.update_info("collect "+acc+" end ") if(job)

      contingency_table = {}
      features_table.each do |x|
        variants_table.each do |y|
          if type =~ /contingency/ then
            contingency_table.merge! compute_fisher(x,y,n_seq)
          elsif type =~ /correlation/ then
            contingency_table.merge! compute_correlation(x,y,n_seq)
          end
        end
      end

      if type =~ /contingency/ then
        contingency_table = format_table_contingency(contingency_table)
      elsif type =~ /correlation/ then
        contingency_table = format_table_correlation(contingency_table)
      end

      return contingency_table, all_features
    end

    def format_table_contingency(table)
      contingency_table = {}
      m = table.length
      p_val = 0.01
      tests = table.sort{|a,b|a[1][:fisher][:right]<=>b[1][:fisher][:right]}
      m_o = 0
      tests.each_with_index do |t,i|
        x = (i+1).to_f/m.to_f*p_val
        if t[1][:fisher][:right] < x then
          m_o += 1
        end
      end
      for i in 0..(m_o-1) do
        k = tests[i][0]
        v = tests[i][1]
        v[:fisher][:p_value] = v[:fisher][:right]
        v[:fisher][:m] = m
        v[:fisher][:m_o] = m_o
        r = k.split(":")
        contingency_table[r[0]]={} unless contingency_table.key? r[0]
        contingency_table[r[0]][r[1]]=v
      end
      return contingency_table
    end

    #def __format_table_contingency(table)
    #  contingency_table = {}
    #  m = table.length
    #  m_o = 0
    #  p_val = 0.01
    #  table.each do |k,v|
    #    m_o += 1 if(v[:fisher][:right]<p_val)
    #  end
    #  alpha = p_val*m_o/m
    #  table.each do |k,v|
    #    if v[:fisher][:right]<alpha then
    #      v[:fisher][:benferroni_corr]=alpha
    #      v[:fisher][:p_value] = v[:fisher][:right]
    #      v[:fisher][:m] = m
    #      v[:fisher][:m_o] = m_o
    #      r = k.split(":")
    #      contingency_table[r[0]]={} unless contingency_table.key? r[0]
    #      contingency_table[r[0]][r[1]]=v
    #    end
    #  end
    #  return contingency_table
    #end

    def format_table_correlation(table)
      contingency_table = {}
      table.each do |k,v|
          r = k.split(":")
          contingency_table[r[0]]={} unless contingency_table.key? r[0]
          contingency_table[r[0]][r[1]]=v
      end
      return contingency_table
    end

    def format_features(x,_type="type",name=nil, no_tracker=false,_key=nil)
      _table = {}
      _features = {}
      _tracker = {}
      x.each do |i|
        unless name then
          type = i[_type].upcase
        else
          type = name
        end
        key = type
        unless _key.nil? then
          key = _key
        end
        n = -1
        if i.key? 'start' then
          n = i['start'].to_i 
        elsif i.key? 'begin' then
          n = i['begin'].to_i
        else
          raise "FORMAT ERROR: "+i.to_s
        end
        m = i['end'].to_i
        _features[ key ] = [] unless _features.key? key
        _tracker[ key ] = {} unless _tracker.key? key
        x = {'begin':n,'end':m, 'type':type}
        if i.key? "original" then
          x['original'] = i['original']
          x['variation'] = i['variation']
        end
        if i.key? 'color' then
          x[:color] = i['color']
        end
        _features[ key ].push( x ) if not _tracker[key].key? n or no_tracker
        _tracker[key][ n ] = true
        _table[key] = {} unless _table.key? key
        if i.key? "original" then
          _table[key][n] = {} unless _table[key].key? n
          _table[key][n][ i['variation'] ]=true
        else
          unless key =~ /DISULFID/i then
            (n..m).each do |j|
              _table[key][j] = true
            end
          else
            _table[key][n] = true
            _table[key][m] = true
          end
        end
      end
      return _table, _features
    end

    def compute_fisher(x,y,n_seq)
      contingency_table = {}
      fet = Rubystats::FishersExactTest.new

      x.each do |fi,vi|
        m_l = vi.length
        y.each do |fj,vj|
          aa = {}
          neg_aa = {}
          m_ij = 0
          m_i = 0
          vi.each do |i,v|
            if vj.key? i then
              m_ij += vj[i].length
              aa[i]=true
            end
            m_i += 1 if !vj.key? i
          end
          m_j = 0
          vj.each do |j,v|
            if !vi.key? j then
              m_j += v.length
              neg_aa[j]=true
            end
          end
          m_o = 0
          (1..n_seq).each do |n|
            m_o += 1 if !vi.key? n and !vj.key? n
          end
          fisher = fet.calculate(m_ij,m_i,m_j,m_o)
          contingency_table[fi+":"+fj] = {m_ij:m_ij,m_i:m_i,m_j:m_j,m_o:m_o,m_l:m_l,fisher:fisher,aa:aa,neg_aa:neg_aa} if(m_ij>0) #if(fisher[:right]<1e-2)
        end
      end

      return contingency_table
    end

    def compute_correlation(x,y,n_seq)
      correlated_table = {}
      fet = Rubystats::FishersExactTest.new

      x.each do |fi,vi|
        y.each do |fj,vj|
          v_x = []
          v_y = []
          v_x.fill(0,0..(n_seq-1))
          v_y.fill(0,0..(n_seq-1))
          vi.keys().each do |i|
            v_x[i] = 1
          end
          vj.keys().each do |i|
            v_y[i] = 1
          end
          #(1..n_seq-2).each do |i|
          #  v_x[i] = 0.5*v_x[i]+0.25*(v_x[i-1]+v_x[i+1])
          #end
          #(1..n_seq-2).each do |i|
          #  v_y[i] = 0.5*v_y[i]+0.25*(v_y[i-1]+v_y[i+1])
          #end
          c = GSL::Stats::correlation(GSL::Vector.alloc(v_x),GSL::Vector.alloc(v_y))
          correlated_table[fi+":"+fj] = {corr:c, x:v_x, y:v_y} if(c>0)

        end
      end
      return correlated_table
    end

  end
end
