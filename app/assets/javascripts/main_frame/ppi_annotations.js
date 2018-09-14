function display_variants(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("variants");
}

function display_ptms(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("ptms");
}

function display_pfam(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("pfam");
}

function display_interpro(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("interpro");
}

function display_smart(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("smart");
}

function display_epitopes(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("epitopes");
}

function display_elms(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("elms");
}

function display_ppi_custom_annotations(){
  document.getElementById("ppiFrame").contentWindow.cytoscape_graph.load_features("custom");
}

