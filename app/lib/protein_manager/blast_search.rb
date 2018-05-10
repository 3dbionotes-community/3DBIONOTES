module ProteinManager
  module BlastSearch

    def runBlast( seq, name=nil, thr=80 )
      proteins = []
      #sprot
      blast = `echo #{seq} | /external/ncbi-blast/bin/blastp -num_threads 32 -task blastp-fast -query - -db /external/db-blast/sprot/sprot -outfmt "7 sacc stitle evalue pident qstart qend" | grep -v "#"`
      sprot, flag = parse_blast(blast,'sprot', name=name, thr=thr)
      if sprot.length > 0
        proteins = ( sprot.sort_by{ |k| -k['cov'].to_f } )
      end
      #trembl
      if !flag
        blast = `echo #{seq} | /external/ncbi-blast/bin/blastp -num_threads 32 -task blastp-fast -query - -db /external/db-blast/trembl/trembl -outfmt "7 sacc stitle evalue pident sstart send" | grep -v "#"`
        trembl, null = parse_blast(blast,'trembl', name=name, thr=thr)
        if trembl.length > 0
          proteins = (proteins+trembl).sort_by{ |k| -k['cov'].to_f }
        end
      end
      return proteins
    end

    def parse_blast(blast, db, name=nil, thr=80)
      out = []
      rows = blast.split("\n")
      flag = false
      rows.each do |r|
        c = r.split("\t")
        title = parse_title(c[1])
        if c[3].to_f  > thr && c[0] != name
          out.push({ 'acc'=>c[0], 'title'=>title, 'evalue'=>c[2], 'cov'=>c[3], 'start'=>c[4], 'end'=>c[5], 'db'=>db })
          if !flag
            flag  = true
          end
        end
      end
      return out, flag
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
      out['org'] = "N/A"
      #if tmp[0].include? " OS"
      #  long_org = tmp[1].chop.chop.chop
      #  short_org = long_org
      #  if short_org.length > 15
      #    short_org = long_org[0..11]+" ..."
      #  end
      #  out['org'] = {'short'=>short_org, 'long'=>long_org} 
      #end
      flag = false
      tmp.each do |t|
        if flag
          long_org = t.chop.chop.chop
          short_org = long_org
          if short_org.length > 15
            short_org = long_org[0..11]+" ..."
          end
          out['org'] = {'short'=>short_org, 'long'=>long_org}
          flag = false
        end
        if t.include? " OS"
          flag = true
        end
      end
      flag = false
      out['gene'] = "N/A"
      tmp.each do |t|
        if flag
          out['gene'] = t.chop.chop.chop
          flag = false
        end
        if t.include? " GN"
          flag = true
        end
      end
      return out
    end

  end
end
