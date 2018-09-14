class JobStatusController < ApplicationController
  def check_status
    job_id = params[:job_id]
    job = JobStatus.find_by(jobId:job_id)
    out = {status:nil, inputs:nil, outputs:nil}
    unless job.nil? then
      out[:status] = job.status
      out[:info] = job.info
      out[:step] = job.step
      out[:inputs] = JSON.parse(job.inputs)if(job.inputs)
      out[:outputs] = JSON.parse(job.outputs)if(job.outputs)
    end
    return render json: out, status: :ok
  end
end
