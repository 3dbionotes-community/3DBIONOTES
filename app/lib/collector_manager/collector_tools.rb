module CollectorManager
  module CollectorTools

    def rename_ptm(ptm)
      out = ptm
      if ptm =~ /phospho/i then
        out = "phosphorylation"
      elsif ptm =~ /o*glcnac/i then
        out = "o-glcnac"
      elsif ptm =~ /glcnac/i then
        out = "glcnac"
      elsif ptm =~ /sumo/i then
        out = "sumoylation"
      elsif ptm =~ /ubiq/i then
        out = "ubiquitination"
      elsif ptm =~ /methyl/i then
        out = "methylation"
      elsif ptm =~ /acetyl/i then
        out = "acetylation"
      elsif ptm =~ /crotonyl/i then
        out = "crotonylation"
      elsif ptm =~ /citrul/i then
        out = "citrullination"
      elsif ptm =~ /disulfid/i then
        out = "disulfid"
      elsif ptm =~ /ribosyl/i then
        out = "ribosylation"
      end
      return out
    end

  end
end
