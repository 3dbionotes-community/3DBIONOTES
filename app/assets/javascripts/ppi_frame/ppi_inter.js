window.addEventListener("ppiFrame_vissible",function(evt){
  cytoscape_graph.drawGraph(); 
});

window.addEventListener("ppiFrame_selectChain",function(evt){
  cytoscape_graph.selectChain(); 
});
