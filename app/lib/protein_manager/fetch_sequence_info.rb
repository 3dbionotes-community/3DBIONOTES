module ProteinManager
  module FetchSequenceInfo

    require 'net/http'
    require 'net/https'

    include InfoManager::SourceUniprotInfo::UniprotSites

    def fetchUniprotSequence(uniprotAc)
      begin
        data = `/external/ncbi-blast/bin/blastdbcmd -entry #{uniprotAc} -db /external/db-blast/covidBlastDv/covidBlastDv`        
        if data.length == 0
          data = `/external/ncbi-blast/bin/blastdbcmd -entry #{uniprotAc} -db /external/db-blast/sprot/sprot`
          if data.length == 0
            data = `/external/ncbi-blast/bin/blastdbcmd -entry #{uniprotAc} -db /external/db-blast/trembl/trembl`
          end
        end
        if data.length == 0
          url = Settings.GS_UniServer+"uniprot/"+uniprotAc+".fasta"
          data = Net::HTTP.get_response(URI.parse(url))
          while data.code =~/30\d/ do
            sleep 1
            if data.header['location'].to_s =~ /http/ then
              url = data.header['location'].to_s
            else
              url = Settings.GS_UniServer.chop+data.header['location'].to_s
            end
            data = Net::HTTP.get_response(URI.parse(url))
          end
          data = data.body
        end
      rescue
        puts "Error: #{$!}"
      end
      fasta = Bio::FastaFormat.new(data)
      return fasta
    end

    def fetchUniprotMultipleSequences(uniprotAc,fasta_obj_flag=nil,dict_flag=nil)
      returnValue = {}
      fasta_array = []
      acc_list = []
      begin
        if uniprotAc.split(",").length > 1
          uniprotAc.split(",").each do |acc|
            fasta = fetchUniprotSequence(acc)
            fasta_array.push( fasta )
            acc_list.push(acc)
          end
        else
          fasta = fetchUniprotSequence(uniprotAc)
          fasta_array.push(fasta)
          acc_list.push(uniprotAc)
        end
      rescue
        puts "Error: #{$!}"
      end

      fasta_array.zip(acc_list).each do |entry,acc|
        entry_definition = "Unknown"
        accession = acc
        if !entry.definition.nil? and entry.definition.include? "OS="
          accession = acc
          aux = entry.definition.split("=")
          entry_definition = aux[0].split(" ")[1..aux[0].length].join(" ").chop.chop.chop
          organism_name = aux[1].chop.chop.chop
          gene_symbol = "N/A"
          if aux[2] =~ /GN/
            gene_symbol = aux[3].chop.chop.chop
          end
        else
          gene_symbol = "N/A"
          organism_name = "UNK ORG"
          entry_definition = "obsolete protein?"
        end
        if dict_flag.nil?
          returnValue[accession] = [entry.seq.length,entry_definition,gene_symbol,organism_name]
        else
          returnValue[accession] = {'sequence'=>entry.seq,'definition'=>entry_definition,'organism'=>organism_name, 'gene_symbol'=>gene_symbol}
        end
      end
      return returnValue
    end

    def __fetchUniprotMultipleSequences(uniprotAc,fasta_obj_flag=nil,dict_flag=nil)
      returnValue = {}
      puts(UniprotURL+"?query="+uniprotAc+"&format=fasta")
      begin
        if uniprotAc.split(",").length > 1
          data = Net::HTTP.get_response(URI.parse(UniprotURL+"?query="+uniprotAc+"&format=fasta"))
        else
          data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta"))
        end
      rescue
        puts "Error: #{$!}"
      end
      fasta = nil
      if data.code != "404"
        fasta = Bio::Alignment::MultiFastaFormat.new(data.body)
        if !fasta_obj_flag.nil?
          return fasta
        end
      end
      if !fasta.nil? && !fasta.entries.nil?
        fasta.entries.each do |entry|
          entry_definition = "Unknown"
          if !entry.definition.nil? and entry.definition.include? "|" and entry.definition.include? "OS="
            aux = entry.definition.split(/\|/)[2].split(/\sOS=/)
            entry_definition = aux[0].split(/\s/,2)[1]
            aux = aux[1].split(/ GN=/,2)
            organism_name = aux[0]
            gene_symbol = "N/A"
            if !aux[1].nil?
              gene_symbol = aux[1].split(/ PE=/,2)[0]
            else
              organism_name = organism_name.split(/ PE=/,2)[0]
            end
          end
          if dict_flag.nil?
            returnValue[entry.accession] = [entry.seq.length,entry_definition,gene_symbol,organism_name]
          else
            returnValue[ entry.accession ] = {'sequence'=>entry.seq,'definition'=>entry_definition,'organism'=>organism_name, 'gene_symbol'=>gene_symbol}
          end
        end
      end
      return returnValue
    end

  end
end
