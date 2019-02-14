module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexVariants

      include SourceComplexFeature
      def sourceComplexVariants(pdbId,path=nil,annotations=nil)
        unless annotations.nil? then
          annotations = JSON.parse(annotations)
        end
        config = { 
                    'colors'=>{
                      'default' => nil,
                    },
                    'type_key' => 'disease'
        }
        config['annotations'] = annotations unless annotations.nil?
        job = SetComplexFeatureJob.perform_later(pdbId, "collectVariantDataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

      def parse_variants(_ann)
        annotations = _ann
        unless annotations.kind_of?(Array) then
          annotations = [annotations]
        end
        out = []
        annotations.each do |i|
          if i.key? "visualization_type" and i["visualization_type"] == "variants" then
            out.push(i)
          end
        end
        return out
      end

    end
  end
end
