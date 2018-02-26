//= require jquery

function display_active_data(node){
  var ch = node.cyTarget.id();
  var selection = {};
  selection[ch]=[];
  for(var key in cytoscape_graph.annotations){
    var v = cytoscape_graph.annotations[key];
    if(v.active && ch in v.data.location){
      v.data.location[ch].forEach(function(i){
        selection[ch].push({begin:i,end:i,color:v.data.color});
      });
    }
  }
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("global_highlight",true,true,selection);
  top.window.dispatchEvent(evt);
}

