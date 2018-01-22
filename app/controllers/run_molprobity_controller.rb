class RunMolprobityController < ApplicationController

  include ComputingTools::Molprobity::MolprobityTools

  LocalPath = Settings.GS_LocalUpload
  LocalScripts = Settings.GS_LocalScripts
  LocalMolProobity_tmp = Settings.GS_LocalMolProobity_tmp

  def get
    suffix = params[:name]
    data = nil
    if suffix =~ /^\d{1}\w{3}$/ and suffix !~ /^\d{4}$/
      data = Molprobityentry.find_by(pdbId: suffix)
      directory = LocalMolProobity_tmp+'/'+suffix+'/MOLPROBITY'
      pdbData = JSON.parse(PdbDatum.find_by(pdbId: suffix).data)
    else
      directory = LocalPath+'/'+suffix+'/MOLPROBITY'
      pdbData = JSON.parse( File.open(LocalPath+'/'+suffix+'/alignment.json').read )
      pdbData = pdbData[pdbData.keys[0]]
    end

    if data.nil?
      out = {'status'=>'running', 'id'=>suffix}
      if not File.exists?(directory)
        if suffix =~ /^\d{1}\w{3}$/ and suffix !~ /^\d{4}$/
          system( LocalScripts+"/python3_run_molprobity "+suffix+" &" )
        else
          Dir.mkdir(directory)
          system( LocalScripts+"/run_molprobity "+suffix+" local >"+directory+"/stdout 2>"+directory+"/stderr &")
        end
      else
        if File.exists?(directory+'/done')
          out['status'] = 'complete'
          out['rama'] = get_rama(directory,pdbData)
          out['omega'] = get_omega(directory,pdbData)
          out['rota'] = get_rota(directory,pdbData)
          if suffix =~ /^\d{1}\w{3}$/ and suffix !~ /^\d{4}$/
            Molprobityentry.create(pdbId: suffix, data: out.to_json)
            FileUtils.rm_rf( LocalMolProobity_tmp+'/'+suffix )
          end
        end
      end
    else
      out = JSON.parse(data.data)
    end

    myStatus = :ok
    return render json: out, status: myStatus
  end

end
