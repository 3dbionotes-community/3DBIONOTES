class Cv19Controller < ApplicationController

  def index
    @pdb_img_path_pre = 'https://www.ebi.ac.uk/pdbe/static/entry/'
    @pdb_img_path_sub = '_deposited_chain_front_image-200x200.png'
    @map_img_path_pre = 'https://www.ebi.ac.uk/pdbe/static/entry/'
    @map_img_path_sub1 = '/400_'
    @map_img_path_sub2 = '.gif'
    @bionotes_qry_pre = '/?queryId='
    @bionotes_qry_sub = '&viewer_type=ngl&button=#query'
    @swissmodel_path_pre = 'https://swissmodel.expasy.org/interactive/'
    @swissmodel_path_sub1 = '/models/'
    @swissmodel_path_sub2 = '.png'
    
    
    @uniprot_entries=["P0DTC1","P0DTD1","P0DTC2","P0DTC3","P0DTC4","P0DTC5","P0DTC6","P0DTC7","P0DTD8","P0DTC8","P0DTC9","P0DTD2","P0DTD3","A0A663DJA2"]
    @alt_names = {"P0DTC1"=>["Replicase polyprotein 1a", "R1a", "R1A_WCPV"], "P0DTD1"=>["Replicase polyprotein 1ab", "R1ab", "R1AB_WCPV"], "P0DTC2"=>["Spike glycoprotein", "S", "SPIKE_WCPV", "surface_glycoprotein"], "P0DTC3"=>["Protein 3a", "AP3A_WCPV"], "P0DTC4"=>["P0DTC4 Envelope small membrane protein", "E", "VEMP_WCPV"], "P0DTC5"=>["Membrane protein", "M", "VME1_WCPV"], "P0DTC6"=>["Non-structural protein 6", "NS6_WCPV"], "P0DTC7"=>["Protein 7a", "NS7A", "NS7A_WCPV"], "P0DTD8"=>["Protein 7b", "NS7B", "NS7B_WCPV"], "P0DTC8"=>["Non-structural protein 8", "NS8", "NS8_WCPV"], "P0DTC9"=>["nucleocapsid protein", "Nucleoprotein", "N", "NCAP_WCPV"], "P0DTD3"=>["Uncharacterized protein 14", "Y14_WCPV"], "P0DTD2"=>["Protein 9b", "P0DTD2"], "A0A663DJA2"=>["Hypothetical ORF10 protein", "A0A663DJA2_9BETC"]}

    # P0DTC1
    # > NSP3
    @nsp3_pdbs = loadPDBData('NSP3')
    @nsp3_models = @nsp3_pdbs["NSP3"]["PDB"].keys
    @nsp3_pdb_redo = ["6w9c","6w02","6w6y","6vxs"]
    @nsp3_c_modelset = '5hYU6g'
    @nsp3_c_models_sm =["13","01","02","03","10","11","12","08","04","06","07"]

    # > NSP4
    @nsp4_models = []
    # > NSP5
    @nsp5_names = ["NSP5","3C-like proteinase:","3CL","3CL proteinase"]
    @nsp5_models = []
    @nsp5_pdbs = loadPDBData('NSP5')
    @nsp5_models = @nsp5_pdbs["NSP5"]["PDB"].keys
    @nsp5_models2 =["6y2e","6m2q","6y84","6yb7"]
    @nsp5_inter_ligands = ["7bqy","6y7m","6y2g","6y2f","6w63","6m2n","6m03","6lu7","5rgs","5rgr","5rgq","5rgp","5rgo","5rgn","5rgm","5rgl","5rgk","5rgj","5rgi","5rgh","5rgg","5rg3","5rg2","5rg1","5rg0","5rfz","5rfy","5rfx","5rfw","5rfv","5rfu","5rft","5rfs","5rfr","5rfq","5rfp","5rfo","5rfn","5rfm","5rfl","5rfk","5rfj","5rfi","5rfh","5rfg","5rff","5rfe","5rfd","5rfc","5rfb","5rfa","5rf9","5rf8","5rf7","5rf6","5rf5","5rf4","5rf3","5rf2","5rf1","5rf0","5rez","5rey","5rex","5rew","5rev","5reu","5ret","5res","5rer","5rep","5reo","5ren","5rem","5rel","5rek","5rej","5rei","5reh","5reg","5ref","5ree","5red","5rec","5reb","5rea","5re9","5re8","5re7","5re6","5re5","5re4","5r8t","5r84","5r83","5r82","5r81","5r80","5r7z","5r7y"]
    @nsp5_pdb_redo = []

    # P0DTD1
    # > NSP12
    @nsp12_names = ["NSP12","RNA-directed RNA polymerase","RNA-dependent RNA polymerase"]
    @nsp12_pdbs = loadPDBData('NSP12')
    @nsp12_models = @nsp12_pdbs["NSP12"]["PDB"].keys
    @nsp12_maps_data = loadEmdbData('NSP12')
    @nsp12_maps = @nsp12_maps_data["NSP12"]["EMDB"].keys
    @nsp12_pdb_redo = []
    @nsp12_isolde = ["6m71", "7bv2", "7bv1", "7btf"]


    # P0DTC2
    # > S
    @s_names = ["P0DTC2","S","Spike glycoprotein","SPIKE_WCPV","surface_glycoprotein"]
    @s_pdbs_data = loadPDBData('S')
    @s_pdbs = @s_pdbs_data["S"]["PDB"].keys
    @s_maps_data = loadEmdbData('S')
    @s_maps = @s_maps_data["S"]["EMDB"].keys
    @s_pdb_redo = ["6lzg","6w41","6vw1","6lvn","6lxt","6m0j"]
    @s_isolde = ["6w41","6vw1","6lvn","6lxt","6m0j"]


    # P0DTC3
    # > NS3A

    # P0DTC4
    # > E

    # P0DTC5
    # > M

    # P0DTC6
    # > NS6

    # P0DTC7
    # > NS7A

    # P0DTD8
    # > NS7B

    # P0DTC8
    # > NS8

    # P0DTC9
    # > N

    # P0DTD3
    # > NS14

    # P0DTD2
    # > NSP9B

    # A0A663DJA2
    # > NS10

  end
  
  def loadAltNames()
    file = File.read('data/cv19/alt_names.json')
    data = JSON.parse(file)
  end

  def loadRawData()
    file = File.read('data/cv19/sars_covid_2_raw_entries.json')
    data = JSON.parse(file)
  end

  def loadPDBData(prot)
    file = File.read('data/cv19/parts/pdbs/'+prot.downcase+'.json')
    data = JSON.parse(file)
  end

  def loadEmdbData(prot)
    file = File.read('data/cv19/parts/emdbs/'+prot.downcase+'.json')
    data = JSON.parse(file)
  end


end
