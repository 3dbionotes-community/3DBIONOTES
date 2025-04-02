class RunMolprobityController < ApplicationController

  include ComputingTools::Molprobity::MolprobityTools

  LocalPath = Settings.GS_LocalUpload
  LocalScripts = Settings.GS_LocalScripts
  LocalMolProobity_tmp = Settings.GS_LocalMolProobity_tmp

  def run(command)
    pid = spawn(command)
    Process.detach(pid)
  end

  def get
    suffix = params[:name]
    data = nil
    if suffix =~ /^\d{1}\w{3}$/ and suffix !~ /^\d{4}$/
      data = Molprobityentry.find_by(pdbId: suffix)
      directory = LocalMolProobity_tmp+'/'+suffix+'/MOLPROBITY'
      pdbData = JSON.parse(PdbDatum.find_by(pdbId: suffix).data)
    elsif suffix =~ /interactome3d:/ then
      i3d_pdb = suffix.gsub "interactome3d:",""
      i3d_pdb.gsub! "__","."
      data = Molprobityentry.find_by(pdbId: i3d_pdb)
      pdbData = JSON.parse(Interactome3dDatum.find_by(pdbId: i3d_pdb).data)
      directory = LocalMolProobity_tmp+'/'+i3d_pdb+'/MOLPROBITY'
    else
      directory = LocalPath+'/'+suffix+'/MOLPROBITY'
      pdbData = JSON.parse( File.open(LocalPath+'/'+suffix+'/alignment.json').read )
      pdbData = pdbData[pdbData.keys[0]]
    end

    if data.nil?
      out = {'status'=>'running', 'id'=>suffix}
      if not File.exist?(directory)
        if suffix =~ /^\d{1}\w{3}$/ and suffix !~ /^\d{4}$/ then
          run( LocalScripts+"/python3_run_molprobity "+suffix)
        elsif suffix =~ /interactome3d:/ then
          FileUtils.mkdir_p directory
          run( LocalScripts+"/run_molprobity "+i3d_pdb+" interactome3d >"+directory+"/stdout &>"+directory+"/stderr")
        else
          Dir.mkdir(directory)
          run( LocalScripts+"/run_molprobity "+suffix+" local >"+directory+"/stdout &>"+directory+"/stderr")
        end
      else
        if File.exist?(directory+'/done') then
          out['status'] = 'complete'
          out['rama'] = get_rama(directory,pdbData)
          out['omega'] = get_omega(directory,pdbData)
          out['rota'] = get_rota(directory,pdbData)
          if suffix =~ /^\d{1}\w{3}$/ and suffix !~ /^\d{4}$/
            Molprobityentry.create(pdbId: suffix, data: out.to_json)
            FileUtils.rm_rf( LocalMolProobity_tmp+'/'+suffix )
          elsif suffix =~ /interactome3d:/ then
            Molprobityentry.create(pdbId: i3d_pdb, data: out.to_json)
            FileUtils.rm_rf( LocalMolProobity_tmp+'/'+i3d_pdb )
          end
        elsif File.exist?(directory+'/stderr') then
          err = File.read(directory+'/stderr')
          out = {'status'=>'error', 'error'=>err}if(err.length > 0)
        end
      end
    else
      out = JSON.parse(data.data)
    end

    myStatus = :ok
    return render json: out, status: myStatus
  end

end
