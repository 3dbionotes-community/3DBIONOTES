//= require jquery

function display_active_data(node){
  var ch = node.cyTarget.id();
  var selection = {};
  selection[ch]=[];
  for(var key in cytoscape_graph.annotations){
    var v = cytoscape_graph.annotations[key];
    if(v.active && ch in v.data.location){
      v.data.location[ch].all.forEach(function(i){
        selection[ch].push({begin:i,end:i,color:v.data.color});
      });
    }
  }
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("global_highlight",true,true,selection);
  top.window.dispatchEvent(evt);

  if(top.global_infoAlignment && top.global_infoAlignment.chain == ch ){
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("highlight_all",true,true,selection[ch]);
    top.window.dispatchEvent(evt);   
  }
}

function display_active_data_edge(edge){
  var source = edge.cyTarget.source().id();
  var target = edge.cyTarget.target().id();

  var selection = {};
  selection[source]=[];
  selection[target]=[];

  for(var key in cytoscape_graph.annotations){
    var v = cytoscape_graph.annotations[key];
    if(v.active && source in v.data.location && target in v.data.location[source].bs ){
      Object.keys(v.data.location[source].bs[target]).forEach(function(i){
        selection[source].push({begin:i,end:i,color:v.data.color});
      });
    }
  }

  for(var key in cytoscape_graph.annotations){
    var v = cytoscape_graph.annotations[key];
    if(v.active && target in v.data.location && source in v.data.location[target].bs ){
      Object.keys(v.data.location[target].bs[source]).forEach(function(i){
        selection[target].push({begin:i,end:i,color:v.data.color});
      });
    }
  }

  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("global_highlight",true,true,selection);
  top.window.dispatchEvent(evt);

  /*if(top.global_infoAlignment && top.global_infoAlignment.chain == source ){
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("highlight_all",true,true,selection[source]);
    top.window.dispatchEvent(evt);   
  }else if(top.global_infoAlignment && top.global_infoAlignment.chain == target ){
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("highlight_all",true,true,selection[target]);
    top.window.dispatchEvent(evt);
  }*/

}

