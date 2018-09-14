class CharacterizeNetworkJob < ActiveJob::Base
  queue_as :default

  include ProteinManager::FetchSequenceInfo
  include AlignmentsManager::BuildAlignments 
  include NetworkPpiManager::NetworkManager
  attr_accessor :n_status
  attr_accessor :n_

  def perform(acc_list,organism,viewer_type,annotations=nil,has_structure_flag=true)
    inputs = { acc_list:acc_list, organism:organism, viewer_type:viewer_type, annotations:annotations, has_structure_flag:has_structure_flag }.to_json
    JobStatus.find_by(jobId:self.job_id).update(inputs:inputs)
    acc_list.gsub!(/\r\n?/,",")
    nodes,edges = getNetwrokFromAcc(acc_list,organism,has_structure_flag,job=self)
    accs=[]
    nodes.each do |n|
      accs.push(n[:acc])
    end
    sequences = fetchUniprotMultipleSequences(accs.join(","),fasta_obj_flag=nil,dict_flag=true)
    alignments = getAlignments(nodes,edges,sequences,job=self)
    out = {nodes:nodes,edges:edges,sequences:sequences,alignments:alignments}
    JobStatus.find_by(jobId:self.job_id).update(outputs:out.to_json)
    JobStatus.find_by(jobId:self.job_id).update(status:100)
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
    if n == 100 then
      n = 99
    end
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
  end

end
