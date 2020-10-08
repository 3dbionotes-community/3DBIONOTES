"use strict";

var add_pdb_redo = new function(){
  var self = this;
  self.load = function(data){
    return data;
  };

  self.save = function(data,pdb_chain,global_external_pdb_chain){
    var pdb = pdb_chain.slice(0, -2);
    var ch = pdb_chain.substr(pdb_chain.length - 1);
    if( !(pdb+":"+ch in global_external_pdb_chain) )global_external_pdb_chain[pdb+":"+ch]={};
    global_external_pdb_chain[pdb+":"+ch]['pdb_redo'] = data[ch];
    return global_external_pdb_chain[pdb_chain]['pdb_redo'];
  };

};

module.exports = add_pdb_redo;
