class AnnotationsPpiController < ApplicationController

  LocalPath = Settings.GS_LocalUpload

  include MappingsManager::FetchMappings
  include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools
  include AnnotationManager::FetchProteinData
  
  def getComplexVariants
    pdbId = params[:name]
    path = params[:path]
    rri_key = :rri
    asa_key = :asa
    if path then
      pdbId.sub! "__", "."
      rri_key = 'rri'
      asa_key = 'asa'
    end
    asa_rri = runBiopythonInterface(pdbId, path)
    interface = {}
    asa_rri[rri_key][0].each do |chi,vi|
      vi.each do |chj,vj|
        vj.each do |vk|
          resi = vk[0]
          resj = vk[1]
          if not interface.key? chi then
            interface[chi]={}
          end
          if not interface[chi].key? resi then
            interface[chi][resi]={}
          end
          if not interface.key? chj then
            interface[chj]={}
          end
          if not interface[chj].key? resj then
            interface[chj][resj]={}
          end
          interface[chi][resi][chj]=true
          interface[chj][resj][chi]=true
        end
      end
    end

    buried = {}
    asa_rri[asa_key][0].each do |ch,v|
      buried[ch] = {}
      v.each do |j|
        if j[1] < 0.1 then
          buried[ch][j[0]] = 'buried'
        else
           buried[ch][j[0]] = 'surface'
        end
      end
    end

    mapping = {}
    if path.nil? then
      mapping = fetchUniprotfromPDB(pdbId) 
    else
      mapping = JSON.parse( File.read(LocalPath+"/"+path+"/alignment.json") )[pdbId]
    end 
    variants = {}
    location = {}
    mapping.each do |k,v|
     v.each do |ki,vi_|
       x = fetchBiomutaFromUniprot(ki)
       if path.nil? then
         vi = vi_
       else
         vi = [k]
       end
       vi.each do |ch|
         unless variants.key? ch
           variants[ch] = {'buried'=>false, 'surface'=>false, 'interface'=> {}}
           location[ch] = { 'all'=>{},'bs'=>{} }
         end
         x.each do |k|
           if interface.key? ch and interface[ch].key? k['start'].to_i then
             interface[ch][k['start'].to_i].each do |i,vi|
               variants[ch]['interface'][i]=true
               location[ch]['all'][k['start'].to_i]=true
               unless location[ch]['bs'].key? i then
                 location[ch]['bs'][i]={}
               end
               location[ch]['bs'][i][k['start'].to_i] = true
             end
           elsif buried[ch].key? k['start'].to_i then
             variants[ch][ buried[ch][k['start'].to_i] ] = true
             location[ch]['all'][k['start'].to_i]=true
           else
             variants[ch]['unknown'] = true
             location[ch]['all'][k['start'].to_i]=true
           end
         end
       end
     end
    end

    location.each do |ch,v|
      location[ch]['all'] = v['all'].keys.sort
    end

    out = {'nodes'=>{},'edges'=>{}}
    variants.each do |ch,v|
      out['nodes'][ch] = []
      if v['surface'] then
        out['nodes'][ch].push({shape:'circle', color:'#CF0000', type:'surface'}) 
      end
      if v['buried'] then
        out['nodes'][ch].push({shape:'circle', color:'#CF0000', type:'core'})
      end
      if v['unknown'] then
        out['nodes'][ch].push({shape:'square', color:'#CF0000', type:'unknown'})
      end
      if v['interface'].keys.length > 0 then
        v['interface'].each do |chj,vj|
          unless out['edges'].key? ch+chj then
            out['edges'][ch+chj]=[]
          end
          out['edges'][ch+chj].push({shape:'circle', color:'#CF0000'})
        end
      end
    end

    return render json: {graph:out,location:location, color:'#CF0000'}, status: :ok
  end

end
