module AnnotationManager
  module SourceProteinData
    module SourceIedb 
      def sourceIedbFromUniprot(uniprotAc)
        client = Mysql2::Client.new(
          host:     ENV['DB_HOST'],
          username: ENV['DB_USER'],
          database: ENV['DB_NAME'],
          password: ENV['DB_PASSWD']
        )
        out = []
        query = "select distinct e.epitope_id, ee.linear_peptide_seq, o.starting_position, o.ending_position from epitope ee, epitope_object e, object o where ee.epitope_id=e.epitope_id and  e.object_id=o.object_id and e.source_antigen_accession in (\""+uniprotAc+"\",\""+uniprotAc+".1\") and o.object_type = \"Fragment of a Natural Sequence Molecule\";"
        client.query(query).each do |row|
          out.push({ 'start':row['starting_position'],'end':row['ending_position'],'type':'epitope','description':row['linear_peptide_seq'],'evidence':row['epitope_id'] })
        end
        return out
      end
    end 
  end
end
