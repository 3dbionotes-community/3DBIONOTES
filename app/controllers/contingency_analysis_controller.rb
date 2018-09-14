class ContingencyAnalysisController < ApplicationController

  include CollectorManager::CollectProteinData
  include ProteinManager::FetchSequenceInfo
  include AlignmentsManager::BuildAlignments
  include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools

  require 'rubystats'
  require 'gsl'

  skip_before_filter :verify_authenticity_token, :only => [:analyse_uniprot,:analyse_pdb]

  def analyse_uniprot
    acc = params[:acc]
    annotations = params[:annotations]
    unless annotations.nil? then
      annotations = JSON.parse(annotations)
      annotations = process_annotations(acc,'acc',annotations)
    end
    contingency_table, features = test_uniprot(acc,extra=annotations)
    return render json: {analysis:contingency_table, features:features}, status: :ok
  end

  def process_annotations(id,id_type,annotations)
    data = {}
    unless annotations.kind_of? Array then
      annotations = [annotations]
    end
    annotations.each do |a|
      a['data'].each do |d|
        data[d['type']] = [] unless data.key? d['type']
        data[d['type']].push({'start'=>d['begin'],'end'=>d['end']})
      end
    end
    out = []
    data.each do |k,v|
      out.push({name:k,bs:v})
    end
    return out
  end

  def analyse_pdb
    pdb = params[:pdb]
    path = nil
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
        contingency_table[ch], features[ch] = test_uniprot(acc, extra=bs)
      end
    end
    return render json: {analysis:contingency_table, features:features}, status: :ok
  end

  def test_uniprot(acc,extra=[])
    seq = fetchUniprotSequence(acc)
    n_seq = seq.aalen

    features_table = []
    all_features = {}
    variants_table = []
    extra.each do |e|
      _table, _features = format_features(e[:bs], _type=nil, name="INTERACTING_RESIDUES", no_tracker=false, _key=e[:name])
      features_table.push(_table)
      all_features.merge! _features
    end

    nucleotide_bs = collectNucleotideBindingDataFromUniprot(acc)
    _table, _features = format_features(nucleotide_bs)
    features_table.push( _table )
    all_features.merge! _features

    elm = collectElmDataFromUniprot(acc)
    _table, _features = format_features(elm)
    features_table.push( _table )
    all_features.merge! _features

    metal_bs = collectMetalBindingDataFromUniprot(acc)
    _table, _features = format_features(metal_bs)
    features_table.push( _table )
    all_features.merge! _features

    ptms = collectPTMdataFromUniprot(acc)
    _table, _features = format_features(ptms, _type="type")
    features_table.push( _table )
    all_features.merge! _features

    variants = collectVariantDataFromUniprot(acc)
    _table, _features = format_features(variants, _type="disease", name=nil, no_tracker=true)
    variants_table.push( _table )
    all_features.merge! _features
    
    contingency_table = {}
    features_table.each do |x|
      variants_table.each do |y|
        if request.original_url =~ /contingency/ then
          contingency_table.merge! compute_fisher(x,y,n_seq)
        elsif request.original_url =~ /correlation/ then
          contingency_table.merge! compute_correlation(x,y,n_seq)
        end
      end
    end

    if request.original_url =~ /contingency/ then
      contingency_table = format_table_contingency(contingency_table)
    elsif request.original_url =~ /correlation/ then
      contingency_table = format_table_correlation(contingency_table)
    end

    return contingency_table, all_features
  end

  def format_table_contingency(table)
    contingency_table = {}
    m = table.length
    m_o = 0
    p_val = 0.01
    table.each do |k,v|
      m_o += 1 if(v[:fisher][:right]<p_val)
    end
    alpha = p_val*m_o/m
    table.each do |k,v|
      if v[:fisher][:right]<alpha then
        v[:fisher][:benferroni_corr]=alpha
        v[:fisher][:p_value] = v[:fisher][:right]
        v[:fisher][:m] = m
        v[:fisher][:m_o] = m_o
        r = k.split(":")
        contingency_table[r[0]]={} unless contingency_table.key? r[0]
        contingency_table[r[0]][r[1]]=v
      end
    end
    return contingency_table
  end

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
        contingency_table[fi+":"+fj] = {m_ij:m_ij,m_i:m_i,m_j:m_j,m_o:m_o,m_l:m_l,fisher:fisher,aa:aa, neg_aa:neg_aa} if(m_ij>0) #if(fisher[:right]<1e-2)
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
