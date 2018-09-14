window.addEventListener("ppiFrame_vissible",function(evt){
  cytoscape_graph.drawGraph(); 
});

window.addEventListener("ppiFrame_selectChain",function(evt){
  cytoscape_graph.selectChain(); 
});

window.addEventListener("ppiFrame_display_active_data",function(evt){
  var data = evt.detail;
  if(data.node) display_active_data(data.node); 
  if(data.edge) display_active_data_edge(data.edge); 
});
