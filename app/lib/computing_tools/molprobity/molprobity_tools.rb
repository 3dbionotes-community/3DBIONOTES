module ComputingTools
  module Molprobity
    module MolprobityTools

      def get_rama(directory,pdbData)
        rama = []
        n = 1
        while File.file?(directory+"/"+"model."+n.to_s+".ramalyze")
          _rama = {}
          File.open(directory+"/"+"model."+n.to_s+".ramalyze").each_line do  |l|
            _ch = l[1]
            _res = l[2..5]
            if not _rama.key?(_ch)
              _rama[_ch]=[]
            end
            _res.gsub! "\s", ""
            a = l[7..-1].split(":")
            if pdbData.key?( _ch )
              acc = pdbData[_ch].keys[0]
              if pdbData[_ch][acc]['inverse'].key?( _res )
                _begin = pdbData[_ch][acc]['inverse'][_res]
                _end = _begin
                if a[4] == "Allowed"
                _rama[_ch].push({'begin'=>_begin, 'end'=>_end, 'color'=>'#FFAAAA', 'type'=>'rama', 'description'=>a[4]+' ('+a[1]+'%) Type: '+a[5]+ '<br/>Structure residue: '+_res+'<br/>&#966; = '+a[2]+'&deg; &#968; = '+a[3]+'&deg;'})
                else
                  _rama[_ch].push({'begin'=>_begin, 'end'=>_end, 'type'=>'rama', 'description'=>a[4]+' ('+a[1]+'%) Type: '+a[5]+ '<br/>Structure residue: '+_res+'<br/>&#966; = '+a[2]+'&deg; &#968; = '+a[3]+'&deg;'})
                end
              end
            end
          end
          rama.push(_rama)
          n += 1
        end
        return rama
      end

      def get_omega(directory,pdbData)
        omega = []
        n = 1
        while File.file?(directory+"/"+"model."+n.to_s+".omegalyze")
          _omega = {}
          File.open(directory+"/"+"model."+n.to_s+".omegalyze").each_line do  |l|
            _ch = l[1]
            _begin = l[2..5]
            _begin.gsub! "\s", ""
            _end = l[17..20]
            _end.gsub! "\s", ""

            if not _omega.key?(_ch)
              _omega[_ch]=[]
            end
            
            if pdbData.key?( _ch )
              acc = pdbData[_ch].keys[0]
              if pdbData[_ch][acc]['inverse'].key?( _begin ) and pdbData[_ch][acc]['inverse'].key?( _end )
                _descript = 'Type: '+l[45..52]+', '+l[28..34]+'<br/>Structure residue: '+_end+'<br/>&omega; = '+l[37..43]+'&deg;'
                _begin = pdbData[_ch][acc]['inverse'][_begin]
                _end = pdbData[_ch][acc]['inverse'][_end]
                _omega[_ch].push({'begin'=>_end, 'end'=>_end, 'type'=>'omega', 'description'=>_descript})
              end
            end
          end
          omega.push( _omega )
          n += 1
        end
        return omega
      end

      def get_rota(directory,pdbData)
        rota = []
        n = 1
        while File.file?(directory+"/"+"model."+n.to_s+".rotalyze")
          _rota = {}
          File.open(directory+"/"+"model."+n.to_s+".rotalyze").each_line do  |l|
            _ch = l[1]
            _res = l[2..5]
            if not _rota.key?(_ch)
              _rota[_ch]=[]
            end
            _res.gsub! "\s", ""
            a = l[8..-1].split(":")
            if pdbData.key?( _ch )
              acc = pdbData[_ch].keys[0]
              if pdbData[_ch][acc]['inverse'].key?( _res )
                _begin = pdbData[_ch][acc]['inverse'][_res]
                _end = _begin
                _descript = ""
                (3..6).each do |i|
                  _descript += a[i]+"&deg;, " if(a[i].length > 0)
                end
                _descript.chop!.chop!
                _rota[_ch].push({'begin'=>_begin, 'end'=>_end, 'type'=>'rota', 'description'=>a[7]+' ('+a[2]+'%)<br/>Structure residue: '+_res+'<br/>&chi; = '+_descript})
              end
            end
          end
          rota.push(_rota)
          n += 1
        end
        return rota
      end

    end
  end
end
