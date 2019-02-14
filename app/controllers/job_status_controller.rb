class JobStatusController < ApplicationController

  def check_status
    job_id = params[:job_id]
    job = JobStatus.select("status, info, step").find_by(jobId:job_id)
    out = {status:nil, info:nil, step:nil}
    if not job.nil? and job.status == 100 then
      job = JobStatus.select("status, info, step, outputs").find_by(jobId:job_id)
      out[:status] = job.status
      out[:info] = job.info
      out[:step] = job.step
      out[:outputs] = JSON.parse(job.outputs)if(job.outputs)
    elsif not job.nil? then
      job = JobStatus.select("status, info, step").find_by(jobId:job_id)
      out[:status] = job.status
      out[:info] = job.info
      out[:step] = job.step
    end
    return render json: out, status: :ok
  end

end
