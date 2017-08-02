class DataFile < ActiveRecord::Base
    attr_accessor :upload
    attr_accessor :name
    attr_accessor :rand_path
  def self.save(upload,name,rand_path,post_info=nil)
    directory = '/home/joan/apps/bionotes/public/upload/'+rand_path
    Dir.mkdir(directory) unless File.exists?(directory)
    Dir.mkdir(directory+'/MODELS') unless File.exists?(directory+'/MODELS')
    # create the file path
    path = File.join(directory,name)
    # write the file
    File.open(path, "w") do |f| 
      f.write( upload.read.gsub(/\.\./,".") )
    end
    if !post_info.nil?
      path = File.join(directory,"post_info.json")
      File.open(path, "w")  do |f| 
        f.write( post_info.to_json ) 
      end
    end
  end

  def self.save_string(content,name,rand_path,post_info=nil)
    directory = '/home/joan/apps/bionotes/public/upload/'+rand_path
    Dir.mkdir(directory) unless File.exists?(directory)
    Dir.mkdir(directory+'/MODELS') unless File.exists?(directory+'/MODELS')
    # create the file path
    path = File.join(directory,name)
    # write the file
    File.open(path, "w") do |f| 
      f.write( content.gsub(/\.\./,".") )
    end
    if !post_info.nil?
      path = File.join(directory,"post_info.json")
      File.open(path, "w")  do |f| 
        f.write( post_info.to_json ) 
      end
    end
  end
end
