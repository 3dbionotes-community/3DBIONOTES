class AnnotationsPpiController < ApplicationController

  include MappingsManager::FetchMappings
  include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools
  include AnnotationManager::FetchProteinData
  
  def getComplexVariants
    pdbId = params[:name]
    path = params[:path]

    asa_rri = runBiopythonInterface(pdbId, path)
    interface = {}
    asa_rri[:interface][1].each do |ch,v|
      interface[ch] = {}
      v.each do |j|
        (j['begin'].to_i .. j['end'].to_i).each do |n|
          interface[ch][n] = true
        end
      end
    end

    buried = {}
    asa_rri[:asa][0].each do |ch,v|
      buried[ch] = {}
      v.each do |j|
        if j[1] < 0.1 then
          buried[ch][j[0]] = 'buried'
        else
           buried[ch][j[0]] = 'surface'
        end
      end
    end

    mapping = fetchUniprotfromPDB(pdbId) 
    variants = {}
    location = {}
    mapping.each do |k,v|
     v.each do |ki,vi|
       x = fetchBiomutaFromUniprot(ki)
       vi.each do |ch|
         unless variants.key? j
           variants[ch] = {'buried':false, 'surface':false, 'interface': false}
           location[ch] = {}
         end
         x.each do |k|
           if interface[ch].key? k['start'].to_i then
             variants[ch]['interface'] = true
             location[ch][k['start'].to_i]=true
           elsif buried[ch].key? k['start'].to_i then
             variants[ch][ buried[ch][k['start'].to_i] ] = true
             location[ch][k['start'].to_i]=true
           else
             variants[ch]['unknown'] = true
           end
         end
       end
     end
    end

    location.each do |ch,v|
      location[ch] = v.keys.sort
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
    end

    return render json: {graph:out,location:location, color:'#CF0000'}, status: :ok
  end

end
