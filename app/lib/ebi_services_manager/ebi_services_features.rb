module EbiServicesManager
  module EbiServicesFeatures

    include GlobalTools::FetchParserTools
    def getFeaturesFromEBI(uniprotAc,type)
      info = Ebifeaturesentry.find_by(proteinId: uniprotAc, features_type: type)
      out = nil
      if info.nil?
        features_url = Settings.GS_UniProtServer+"/"+type+"/"+uniprotAc
        out = getUrl(features_url)
        features = JSON.parse(out)
        if not features.key? 'errorMessage'
          Ebifeaturesentry.create(proteinId: uniprotAc, data: out, features_type: type) 
        end
      else
        out = info.data
      end
      return JSON.parse(out)
    end

  end
end
