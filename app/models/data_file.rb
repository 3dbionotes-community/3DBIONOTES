class DataFile < ActiveRecord::Base
    attr_accessor :upload
    attr_accessor :name
    attr_accessor :rand_path
  def self.save(upload,name,rand_path)
    directory = '/home/joan/apps/bionotes/public/upload/'+rand_path
    Dir.mkdir(directory) unless File.exists?(directory)
    Dir.mkdir(directory+'/MODELS') unless File.exists?(directory+'/MODELS')
    # create the file path
    path = File.join(directory,name)
    # write the file
    File.open(path, "w") { |f| f.write(upload.read.gsub(/\.\./,".") ) }
  end
end
