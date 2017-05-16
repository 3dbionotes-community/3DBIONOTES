class ImportProteinsController < ApplicationController

  UniprotURL = "http://www.uniprot.org/uniprot/"

  def import
    uniprotAc = params[:name]
    sequence = getUniprotSequence(uniprotAc)
    targets = blast_seqrch(sequence.seq)
    targets = get_annotations_number( targets )
    return render json: targets, status: :ok
  end

  def getUniprotSequence(uniprotAc)
    begin
      data = `ssh  jsegura@campins '~/apps/BLAST/ncbi-blast-2.5.0+/bin/blastdbcmd -entry #{uniprotAc} -db /home/jsegura/databases/UNIPROT/blast/sprot/sprot'`
      if data.length == 0
        data = `ssh  jsegura@campins '~/apps/BLAST/ncbi-blast-2.5.0+/bin/blastdbcmd -entry #{uniprotAc} -db /home/jsegura/databases/UNIPROT/blast/trembl/trembl'`
      end
      if data.length == 0
        data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta")).body
      end
    rescue
      puts "Error: #{$!}"
    end
    fasta = Bio::FastaFormat.new(data)
    return fasta
  end

  def parse_blast(blast,db)
    out = []
    rows = blast.split("\n")
    flag = false
    rows.each do |r|
      c = r.split("\t")
      title = parse_title(c[1])
      if c[3].to_f  > 80 && c[0] != params[:name]
        out.push({ 'acc'=>c[0], 'title'=>title, 'evalue'=>c[2], 'cov'=>c[3], 'start'=>c[4], 'end'=>c[5], 'db'=>db })
        if !flag
          flag  = true
        end
      end
    end
    return out, flag
  end

  def blast_seqrch(seq)
    proteins = []
    #sprot
    blast = `ssh jsegura@campins 'echo #{seq} | sudo nice -n -10 ~/app/BLAST/ncbi-blast-2.5.0+/bin/blastp -num_threads 32 -task blastp-fast -query - -db ~/databases/UNIPROT/blast/sprot/sprot -outfmt "7 sacc stitle evalue pident qstart qend" | grep -v "#"'`
    sprot, flag = parse_blast(blast,'sprot')
    if sprot.length > 0
      proteins = ( sprot.sort_by{ |k| -k['cov'].to_f } )
    end
    #trembl
    if !flag
      blast = `ssh jsegura@campins 'echo #{seq} | sudo nice -n -10 ~/app/BLAST/ncbi-blast-2.5.0+/bin/blastp -num_threads 32 -task blastp-fast -query - -db ~/databases/UNIPROT/blast/trembl/trembl -outfmt "7 sacc stitle evalue pident sstart send" | grep -v "#"'`
      trembl, null = parse_blast(blast,'trembl')
      if trembl.length > 0
        proteins = (proteins+trembl).sort_by{ |k| -k['cov'].to_f }
      end
    end
    return proteins
  end

  def parse_title(title)
    tmp = title.split("=")
    out = {}
    long_name = tmp[0].chop.chop.chop
    short_name = long_name
    if long_name.length > 15
      short_name = long_name[0..11]+" ..."
    end
    out['name'] = {'short'=>short_name,'long'=>long_name}
    if tmp[0].include? " OS"
      long_org = tmp[1].chop.chop.chop
      short_org = long_org
      if short_org.length > 15
        short_org = long_org[0..11]+" ..."
      end
      out['org'] = {'short'=>short_org, 'long'=>long_org} 
    else
      out['org'] = "N/A"
    end
    if tmp[1].include? " GN"
      out['gene'] = tmp[2].chop.chop.chop
    else
      out['gene'] = "N/A"
    end
    return out
  end

  def get_annotations_number(targets)
    uniprot_acc = []
    targets.each do |t|
      uniprot_acc.push(t['acc'])
    end
    data = Net::HTTP.get_response( URI.parse(UniprotURL+"?query="+uniprot_acc.join(",")+"&format=xml") ).body
    begin
      hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
    rescue
      puts "Error downloading and reading xml:\n#{$!}"
    end
    n_annot = {}
    if !hash['uniprot'].nil?
      hash['uniprot']['entry'].each do |e|
        if e['accession'].class == Array
          e['accession'].each do |acc|
            if e['feature'].class == Array
              n_annot[acc] = e['feature'].length
            end
          end
        else
          if e['feature'].class == Array
            n_annot[ e['accession'] ] = e['feature'].length
          end
        end
      end
    end
    out = []
    targets.each do |t|
      x = t
      x['N'] = 0
      if n_annot.key?(t['acc'])
        x['N'] = n_annot[ t['acc'] ]
      end
      out.push(x)
    end
    return out 
  end
end
