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
        @allURL.push(["dsysmap", "/api/annotations/dsysmap/Uniprot/"+@alignment["uniprot"],true])
        if @alignment["pdb"] and not @alignment["path"]
	  @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["pdb"].downcase+@alignment["chain"],false])
        elsif @alignment["pdb"] and @alignment["path"]
          @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["path"]+"::"+@alignment["pdb"].gsub!('.', '_dot_')+"::"+@alignment["chain"],false])
        end
        @allURL.push(["elmdb", "/api/annotations/elmdb/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["Pfam", "/api/annotations/Pfam/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["mobi", "/api/annotations/mobi/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["smart", "/api/annotations/SMART/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["interpro", "/api/annotations/interpro/Uniprot/"+@alignment["uniprot"],true])
      end
    end
    @allURL = @allURL.to_json
  end

  def imported_annotationsIFrame
    import_acc = params[:imported_acc]
    alignment = params[:alignment]
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
        @allURL.push(["dsysmap", "/api/annotations/dsysmap/Uniprot/"+import_acc,true])
        @allURL.push(["elmdb", "/api/annotations/elmdb/Uniprot/"+import_acc,true])
        @allURL.push(["Pfam", "/api/annotations/Pfam/Uniprot/"+import_acc,true])
        @allURL.push(["mobi", "/api/annotations/mobi/Uniprot/"+import_acc,true])
        @allURL.push(["smart", "/api/annotations/SMART/Uniprot/"+import_acc,true])
        @allURL.push(["interpro", "/api/annotations/interpro/Uniprot/"+import_acc,true])
      end
    end
    @allURL = @allURL.to_json
  end

end
