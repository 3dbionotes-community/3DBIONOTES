class RunMolprobityController < ApplicationController

  LocalPath =  "/home/joan/apps/bionotes/public/upload/"

  def run
    suffix = params[:name]
    out = {'status'=>'running', 'id'=>suffix}
    directory =  '/home/joan/apps/bionotes/data/upload/'+suffix
    if !File.exists?(directory)
      out['error'] = 'DIRECTORY '+directory+' NOT FOUND'
    else
      Dir.mkdir(directory+'/MOLPROBITY') unless File.exists?(directory+'/MOLPROBITY')
      system("/home/joan/apps/bionotes/scripts/run_molprobity "+suffix+" >"+directory+"/MOLPROBITY/stdout 2>"+directory+"/MOLPROBITY/stderr &")
    end
    myStatus = :ok
    return render json: out, status: myStatus
  end

  def check
    suffix = params[:name]
    out = {'status'=>'not_computed', 'id'=>suffix}
    directory =  '/home/joan/apps/bionotes/data/upload/'+suffix
    if !File.exists?(directory)
      out['error'] = 'DIRECTORY '+directory+' NOT FOUND'
    else
      if File.exists?(directory+'/MOLPROBITY')
        out['status'] = 'running'
        if File.exists?(directory+'/MOLPROBITY/done')
          out['status'] = 'complete'
        end
      end
    end
    myStatus = :ok
    return render json: out, status: myStatus
  end  

  def get
    suffix = params[:name]
    ch_id = params[:chain]
    directory =  '/home/joan/apps/bionotes/data/upload/'+suffix
    out = {'status'=>'running', 'id'=>suffix}
    if File.exists?(directory+'/MOLPROBITY/done')
      out['status'] = 'complete'
      if !File.exists?(directory+'/molprobity.json')
        out = JSON.parse(`/home/joan/apps/bionotes/scripts/parse_molprobity #{suffix} #{ch_id}`)
      end
    end
    myStatus = :ok
    return render json: out, status: myStatus
  end

end
