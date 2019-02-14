module AnnotationPpiManager
  module SourceProteinData
    module SourceTools

      def get_variants(annotations)
        out = {}
        annotations.each do |ann|
          next unless ann["visualization_type"] == "variants"
          if ann.key? "acc" then
            key = ann['acc']
          elsif ann.key? "ch" then
            key = ann['ch']
          elsif ann.key? "chain" then
            key = ann['chain']
          end
          out[key] = []
          ann['data'].each do |var_|
            var = var_
            var['start'] = var['begin']
            var['end'] = var['begin']
            out[key].push var
          end
        end
        return out
      end

      def check_annotations(ann_,alignment)
        annotations = ann_
        annotations.each do |ann|
          ann['data'].each do |var|
            if ann.key? 'chain' then
              acc = alignment[ann['chain']].keys[0]
              x = var['begin'].to_s
              y = var['end'].to_s
              if alignment[ann['chain']][acc]['inverse'].key? x then
                x = alignment[ann['chain']][acc]['inverse'][x]
                var['start'] = x
                var['begin'] = x
              end
              if alignment[ann['chain']][acc]['inverse'].key? y then
                y = alignment[ann['chain']][acc]['inverse'][y]
                var['end'] = y
              end
            else
              var['start'] = var['begin']
            end
          end
        end
        return annotations
      end

    end
  end
end
