"use strict";

var add_mobi =  function(_data, dom_sites){
  var data = _data['disorder'];
  var n = 1;
  var _disorder = [];
  var _lips = []
  var _flag = false;
  for(var i in data){
  	var _type = i.toUpperCase();
  	data[i].forEach(function(j){
                var _des = "";
                if(j['method']!="full")_des = " - Inferred from "+j['method'];
  		_disorder.push({type:_type,begin:j['start'],end:j['end'],description:'Disordered region'+_des,internalId:'mobi_'+n,evidences:
  			{
  				"Imported information":[{url:'http://mobidb.bio.unipd.it/entries/'+__accession, id:__accession, name:'Imported from MobyDB'}]
  			}
  		});
  		n++;
                  _flag = true;
  	});
  }
  var data = _data['lips'];
  for(var i in data){
    var sub_type = i.toUpperCase();
    data[i].forEach(function(j){
      var new_flag = true;
      /*dom_sites.forEach(function(d){
        if( d['type']=="LINEAR_MOTIF" && parseInt(d["begin"]) == j["start"] && parseInt(d["end"]) == j["end"]){
          new_flag = false;
        }
      });*/
      if(new_flag){
        _lips.push({type:"LINEAR_INTERACTING_PEPTIDE",begin:j['start'],end:j['end'],description:'Interacting peptide region',internalId:'mobi_'+n, evidences:
        	{
        	  "Imported information":[{url:'http://mobidb.bio.unipd.it/entries/'+__accession, id:__accession, name:'Imported from MobyDB'}]
        	}
        });
        n++;
        _flag = true;
      }
    });
  }
  var data = _data['lips'];
  return [_disorder,_lips];
};

module.exports = add_mobi;
