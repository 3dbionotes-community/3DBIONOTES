class SetComplexFeatureJob < ActiveJob::Base
  queue_as :default

  include AnnotationPpiManager::SourceProteinData::SourceComplexFeature
  attr_accessor :n_status
  attr_accessor :n_

  def perform(pdbId, feature_call, config, path=nil)
    inputs = { pdbId:pdbId, feature_call:feature_call, config:config }.to_json
    JobStatus.find_by(jobId:self.job_id).update(inputs:inputs)

    out = sourceComplexFeature(pdbId, feature_call, config, path=path, job=self)
    JobStatus.find_by(jobId:self.job_id).update(outputs:out.to_json)
  end

  def init_status(n,step=nil,info=nil)
    self.n_status = n
    self.n_ = 0
    if step then 
      JobStatus.find_by(jobId:self.job_id).update(status:0,step:step)
    else
      JobStatus.find_by(jobId:self.job_id).update(status:0)
    end
    if info then
      JobStatus.find_by(jobId:self.job_id).update(info:info)
    end
  end

  def update_status(info=nil)
    self.n_ += 1
    n = (100*self.n_/self.n_status).to_i
    JobStatus.find_by(jobId:self.job_id).update(status:n)
    if info then
      JobStatus.find_by(jobId:self.job_id).update(info:info)
    end
  end

  def update_info(info)
    JobStatus.find_by(jobId:self.job_id).update(info:info)
  end

  def max_attempts
    1
  end
  
  before_enqueue do
    JobStatus.create(jobId:self.job_id, status:0, step:0, info:nil, inputs:nil, outputs:nil)
  end

  after_perform do
    JobStatus.find_by(jobId:self.job_id).update(status:100)
  end

end
