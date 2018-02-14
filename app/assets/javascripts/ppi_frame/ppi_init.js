var $j = jQuery.noConflict();
var cytoscape_graph;

$j( document ).ready(function(){
  cytoscape_graph = new graph_class({'elements':elements,'element_id':'graph_div'});
  cytoscape_graph.drawGraph();
});
