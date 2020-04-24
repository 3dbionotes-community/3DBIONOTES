class Cv19Controller < ApplicationController
  def index

    @alt_names = loadAltNames
    # @names = @alt_names.keys
    @names = ["P0DTC1", "P0DTD1", "P0DTC2", "P0DTC3", "P0DTC4", "P0DTC5", "P0DTC6", "P0DTC7", "P0DTD8", "P0DTC8", "P0DTC9", "P0DTD3", "P0DTD2", "A0A663DJA2"]
    @uniprot_entries=["P0DTC1","P0DTD1","P0DTC2","P0DTC3","P0DTC4","P0DTC5","P0DTC6","P0DTC7","P0DTD8","P0DTC8","P0DTC9","P0DTD2","P0DTD3","A0A663DJA2"]

    @raw_data = loadRawData
    # @proteins = @raw_data.keys
    @proteins = ["hypothetical_protein_sars7a", "nsp12-nsp7-nsp8", "surface_glycoprotein", "protein_e", "exonuclease", "nsp3", "endornase", "nsp10", "rna_polymerase", "3c_like_proteinase", "nsp13", "leader_protein", "e2_glycoprotein_precursor", "nucleocapsid_protein", "nsp7", "methyltransferase", "nsp16-nsp10", "nsp9", "nsp8-nsp7"]

    @e = {"SARS-CoV-2"=>{}, "SARS-CoV"=>{"5xer"=>{"emdbs"=>[]}, "5x29"=>{"emdbs"=>[]}, "5xes"=>{"emdbs"=>[]}, "2mm4"=>{"emdbs"=>[]}}, "OtherRelated"=>[], "ComputationalModels"=>{}} 
    @e_names = ["P0DTC4", "Envelope small membrane protein", "E", "VEMP_WCPV"]
    @nsp3_names=["PL-Pro","Papain-like proteinase"]

    @pdb_img_path_pre = 'https://www.ebi.ac.uk/pdbe/static/entry/'
    @pdb_img_path_sub = '_deposited_chain_front_image-200x200.png'
    @map_img_path_pre = 'https://www.ebi.ac.uk/pdbe/static/entry/'
    @map_img_path_sub1 = '/400_'
    @map_img_path_sub2 = '.gif'
    @bionotes_qry_pre = '/?queryId='
    @bionotes_qry_sub = '&viewer_type=ngl&button=#query'

    @items = [:P0DTC2]
    @title = 'surface_glycoprotein'

    @s_names = ["P0DTC2","S","Spike glycoprotein","SPIKE_WCPV","surface_glycoprotein"]
    @s_models = ["6lzg","6lvn","6vsj","6vw1","6m17","6vyb","6w41","6lxt","6vsb","6vxx","6m0j"]
    @s_maps = ["EMD-21375","EMD-21377","EMD-30039","EMD-21452","EMD-21457"]
    @interactions = []

    @nsp3_models = ["6vxs","6w02","6w6y","6w9c"]

  end

  
  def loadAltNames()
    file = File.read('data/cv19/alt_names.json')
    data = JSON.parse(file)
  end

  def loadRawData()
    file = File.read('data/cv19/sars_covid_2_raw_entries.json')
    data = JSON.parse(file)
  end

end
