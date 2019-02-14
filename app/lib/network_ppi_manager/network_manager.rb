module NetworkPpiManager
  module NetworkManager

    include GlobalTools::FetchParserTools
    include ProteinManager::FetchSequenceInfo
    include Interactome3dManager::FetchInteractome3d
    include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools 

    def getNetwrokFromAcc(accs,organism,has_structure_flag=true,job=nil)
      query_acc = {}
      _nodes = {}
      accs.split(",").each do |a|
        query_acc[a] = true
      end
      if query_acc.length == 1 then
        has_structure_flag=true
      end
      url = Settings.GS_Interactome3D+"&dataset="+organism+"&ids="+accs
      html = getUrl(url)
      pairs = html.split("textarea")[1].split(">")[1].chop.chop.chop.split("\n")

      job.init_status(2*pairs.length,step=1) if(job)
      edges = []
      aux_update = 0
      pairs.each do |p|
        x = p.split(/\s/)
        if query_acc.key? x[0] and query_acc.key? x[1] then
          e = Interactome3dInteraction.where("(accA=\"#{x[0]}\" and accB=\"#{x[1]}\") or (accB=\"#{x[0]}\" and accA=\"#{x[1]}\")")[0]
          if not e.nil? then
            _nodes[x[0]]=true
            _nodes[x[1]]=true
          else
            edges.push({accA:x[0],accB:x[1],type:nil,file:nil})
            _nodes[x[0]]=true
            _nodes[x[1]]=true
          end
        elsif (query_acc.key? x[0] or query_acc.key? x[1]) and has_structure_flag then
          e = Interactome3dInteraction.where("(accA=\"#{x[0]}\" and accB=\"#{x[1]}\") or (accB=\"#{x[0]}\" and accA=\"#{x[1]}\")")[0]
          if not e.nil? then
            _nodes[x[0]]=true
            _nodes[x[1]]=true
          end
        end
        aux_update += 1 
        job.update_status(dn=5) if(job and aux_update % 5 == 0)
      end
     
      pairs.each do |p|
        x = p.split(/\s/)
        if _nodes.key? x[0] and _nodes.key? x[1] then
          e = Interactome3dInteraction.where("(accA=\"#{x[0]}\" and accB=\"#{x[1]}\") or (accB=\"#{x[0]}\" and accA=\"#{x[1]}\")")[0]
          if not e.nil? then
            getPDBstructre(e[:file],"interaction")
            edges.push({accA:e[:accA],accB:e[:accB],type:e[:model_type],file:e[:file]})
          else
            edges.push({accA:x[0],accB:x[1],type:nil,file:nil})
          end
        end
        aux_update += 1 
        job.update_status(dn=5) if(job and aux_update % 5 == 0)
      end
      _nodes = _nodes.keys()
      nodes = []
      _nodes.each do |x|
        e = Interactome3dProtein.order('coverage DESC').find_by(acc:x)
        if e.nil? then
          nodes.push({acc:x,type:nil,file:nil})
        else
          getPDBstructre(e[:file],"protein")
          nodes.push({acc:x,type:e[:model_type],file:e[:file]})
        end
      end
      return nodes,edges
    end

    def optionSelectorArray(network_graph,uniprot)
      accs = [] 
      selector_array = {}
      network_graph[:nodes].each do |n|
        accs.push(n['acc'])
      end
      network_graph[:nodes].each do |n|
        selector_array[n['acc']] = optionNode(n,uniprot[n['acc']])
      end
      network_graph[:edges].each do |e|
        unless e['file'].nil? then
          selector_array[e['accA']+":"+e['accB']] = optionEdge(e,uniprot[e['accA']],uniprot[e['accB']]) 
        end
      end
      return selector_array
    end

    def optionEdge(edge,accA,accB)
      options = []
      file_val = edge['file'].gsub '.','__'
      v = accA
      key = 'accA'
      ch = "A"
      options.push(["#{v['gene_symbol']},  #{v['definition']} / #{edge[key]}", {'uniprot'=>edge[key],'acc'=>edge[key],'file'=>edge['file'],'pdb'=>edge['file'],'pdbList'=>'/interactome_pdb/'+edge['file'].to_s,'chain'=>ch, 'uniprotLength'=>v['sequence'].length, 'uniprotTitle'=>v['definition'], 'organism'=>v['organism'], 'origin'=>'interactome3d', 'gene_symbol'=>v['gene_symbol'], 'path'=>'interactome3d:'+file_val}.to_json]) 
      v = accB
      key = 'accB'
      ch = "B"
      options.push(["#{v['gene_symbol']},  #{v['definition']} / #{edge[key]}", {'acc'=>edge[key],'file'=>edge['file'],'pdb'=>edge['file'],'pdbList'=>'/interactome_pdb/'+edge['file'].to_s,'chain'=>ch,'uniprot'=>edge[key], 'uniprotLength'=>v['sequence'].length, 'uniprotTitle'=>v['definition'], 'organism'=>v['organism'], 'origin'=>'interactome3d', 'gene_symbol'=>v['gene_symbol'], 'path'=>'interactome3d:'+file_val}.to_json]) 
      return options
    end

    def optionNode(node,uniprot)
      n = node
      v = uniprot
      ch = nil
      unless n['file'].nil? then
        r = n['file'].split("-")
        if r[1] == "MDL" then
          ch = "A"
        elsif r[1] == "EXP" then
          ch = r[2].split("_")[1].split(".")[0]
        else
          raise "INTERACTOME3D FORMAT ERROR "+r[1]
        end
      end
      file_val = "null"
      unless n['file'].nil? then
        file_val = n['file'].gsub '.','__'
      end
      return [["#{v['gene_symbol']},  #{v['definition']} / #{n['acc']}", {'acc'=>n['acc'],'file'=>n['file'],'pdb'=>n['file'],'pdbList'=>'/interactome_pdb/'+n['file'].to_s,'chain'=>ch,'uniprot'=>n['acc'], 'uniprotLength'=>v['sequence'].length, 'uniprotTitle'=>v['definition'], 'organism'=>v['organism'], 'origin'=>'interactome3d', 'gene_symbol'=>v['gene_symbol'], 'path'=>'interactome3d:'+file_val}.to_json]]
    end

    def getAlignments(nodes,edges,sequences,job=nil)
      alignment = {}
      n_status = nodes.length + edges.length
      job.init_status(n_status,step=2) if(job)
      nodes.each do |n|
        begin
          unless n[:file].nil? then
            r = n[:file].split("-")
            if r[1] == "MDL" then
              ch = "A"
            elsif r[1] == "EXP" then
              ch = r[2].split("_")[1].split(".")[0]
            else
              raise "INTERACTOME3D FORMAT ERROR "+r[1]
            end
            if sequences.key? r[0] then
              _align = alignPDBstructre(n[:file],{ch=>sequences[r[0]]['sequence']},{ch=>r[0]})
              _null = runBiopythonInterface(n[:file],"interactome3d")
              alignment[ n[:file] ] = _align
            end
            job.update_info(n[:file]) if(job)
          end
          job.update_status() if(job)
        rescue Exception => e  
          raise "Interactome3D file: "+n[:file]+"\nMessage: "+e.message+"\nTrace: "+JSON.parse(e.backtrace.inspect).join("\n")
        end
      end
      edges.each do |n|
        unless n[:file].nil? then
          r = n[:file].split("-")
          begin
            if sequences.key? r[0] and sequences.key? r[1] then
              _align = alignPDBstructre(n[:file],{"A"=>sequences[r[0]]['sequence'],"B"=>sequences[r[1]]['sequence']},{"A"=>r[0],"B"=>r[1]})
              _null = runBiopythonInterface(n[:file],"interactome3d")
              alignment[ n[:file] ] = _align
            end
          rescue Exception => e
            raise "Interactome3D file: "+n[:file]+"\nMessage: "+e.message+"\nTrace: "+JSON.parse(e.backtrace.inspect).join("\n")
          end
          job.update_info(n[:file]) if(job)
        end       
        job.update_status() if(job)
      end
      return alignment
    end

  end
end

