class FramesAnnotationsController < ApplicationController

  include ProteinManager::FetchSequenceInfo
  include FramesAnnotationsManager::FramesAnnotationsTools

  def annotationsIFrame
    alignment = params[:alignment]
    @imported_flag = false 
    if !alignment.nil?
      @alignment = JSON.parse(alignment)
      @annotsData = Hash.new
      @generalData = Hash.new
      @log = ""
      if !@alignment["uniprot"].nil?
        @uniprotACC = @alignment["uniprot"]
        @allURL = []
        @allURL.push(["iedb","/api/annotations/IEDB/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["phosphosite", "/api/annotations/Phosphosite/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["dbptm", "/api/annotations/dbptm/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["biomuta", "/api/annotations/biomuta/Uniprot/"+@alignment["uniprot"],true])
        if @alignment["pdb"] and not @alignment["path"]
	      @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["pdb"].downcase+@alignment["chain"],false])
          # Adding resolution data
          @allURL.push(["emlr", "/ws/lrs/pdbAnnotFromMap/all/"+@alignment["pdb"].downcase+"/"+@alignment["chain"]+"/?format=json",false])
          # @allURL.push(["emlr", "https://my-json-server.typicode.com/pconesa/demo/emres",false])
        elsif @alignment["pdb"] and @alignment["path"]
          @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["path"]+"::"+@alignment["pdb"].gsub!('.', '_dot_')+"::"+@alignment["chain"],false])
        end

        @asyncURL = []
        @asyncURL.push(["dsysmap", "/api/annotations/dsysmap/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["elmdb", "/api/annotations/elmdb/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["Pfam", "/api/annotations/Pfam/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["smart", "/api/annotations/SMART/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["interpro", "/api/annotations/interpro/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["mobi", "/api/annotations/mobi/Uniprot/"+@alignment["uniprot"],true])
        if not @alignment["pdb"].nil? then
          @asyncURL.push(["pdb_redo", "/api/annotations/PDB_REDO/"+@alignment["pdb"],false])
        end
      end
    end
    @allURL = @allURL.to_json
  end

  def imported_annotationsIFrame
    import_acc = params[:imported_acc]
    alignment = params[:alignment]
    puts(alignment)
    @imported_flag = true
    if !alignment.nil?
      @alignment = JSON.parse(alignment)
      @annotsData = Hash.new
      @generalData = Hash.new
      @log = ""

      if !@alignment["uniprot"].nil?
        sequences = fetchUniprotMultipleSequences(@alignment["uniprot"]+","+import_acc, fasta_obj_flag=nil, dict_flag=true)
        @imported_alignment = align_sequences_fat(sequences[ @alignment['uniprot'] ]['sequence'],sequences[ import_acc ]['sequence'])
        @imported_alignment['imported_acc'] = import_acc
        @uniprotACC = import_acc
        @uniprotTitle = sequences[import_acc]['definition']
        @organism = sequences[import_acc]['organism']
        @gene_symbol = sequences[import_acc]['gene_symbol']

        @alignment['organism'] = @organism
        @alignment['original_uniprot'] = @alignment['uniprot']
        @alignment['uniprot'] = import_acc
        @alignment['uniprotTitle'] = @uniprotTitle
        @alignment['uniprotLength'] = sequences[ import_acc ]['sequence'].length
        @alignment['gene_symbol'] = @gene_symbol

        @allURL = []
        @allURL.push(["iedb","/api/annotations/IEDB/Uniprot/"+import_acc,true])
        @allURL.push(["phosphosite", "/api/annotations/Phosphosite/Uniprot/"+import_acc,true])
        @allURL.push(["dbptm", "/api/annotations/dbptm/Uniprot/"+import_acc,true])
        @allURL.push(["biomuta", "/api/annotations/biomuta/Uniprot/"+import_acc,true])

        @asyncURL = []
        @asyncURL.push(["dsysmap", "/api/annotations/dsysmap/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["elmdb", "/api/annotations/elmdb/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["Pfam", "/api/annotations/Pfam/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["smart", "/api/annotations/SMART/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["interpro", "/api/annotations/interpro/Uniprot/"+@alignment["uniprot"],true])
        @asyncURL.push(["mobi", "/api/annotations/mobi/Uniprot/"+@alignment["uniprot"],true])
      end
    end
    @allURL = @allURL.to_json
    @asyncURL = @asyncURL.to_json
  end

  def analysisIFrame
    alignment = params[:alignment]
    @imported_flag = false 
    @feature_analysis_url = [];
    unless alignment.nil? then
      @alignment = JSON.parse(alignment)
      @uniprotACC = @alignment["uniprot"]
      @log = ""
      if(@alignment['origin']=="Uniprot") then
        @feature_analysis_url.push([@alignment["uniprot"],"/compute/contingency/uniprot/"+@alignment["uniprot"],"contingency","acc"])
      elsif @alignment.key? "path" then
        @feature_analysis_url.push([@alignment["pdb"], "/compute/contingency/pdb/"+@alignment["path"]+"?file="+@alignment["pdb"],"contingency","pdb"])
      else
        @feature_analysis_url.push([@alignment["pdb"], "/compute/contingency/pdb/"+@alignment["pdb"],"contingency","pdb"])
      end
    end
  end

end
