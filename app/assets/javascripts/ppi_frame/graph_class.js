function graph_class(args){
  var self = this;
  self.args = args;
  self.element_id = self.args.element_id;
  self.elements = self.args.elements;
  self.style = [
    {
      selector: 'node',
      style: {
        'label': 'data(name)',
        'font-size': '6px',
        'text-valign': 'center',
        'text-halign': "center",
        'background-color': '#aaa',
        'text-outline-color': '#555',
        'text-outline-width': '1px',
        'color': '#fff',
      }
    }, {
      selector: "node:selected",
      style: {
        "border-width": "6px",
        "border-color": "#AAD8FF",
        "border-opacity": "0.5",
        "background-color": "#77828C",
        "text-outline-color": "#77828C"
      }
    }, {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
      }
    }
  ];
  self.layout = {
    name: 'cose'
  };
  self.drawGraph = function(){
    if(self.elements){
      if( $j("#graph_div").css("display") == "block" ){
        self.cy = cytoscape({
          container: document.getElementById(self.element_id),
          elements: self.elements,
          style: self.style,
          layout: self.layout
        });
        var ch_ = top.global_infoAlignment.chain;
        self.cy.$('#'+ch_).select();
        self.selected = '#'+ch_;
        self.cy.$('node').unselectify();
        self.cy.nodes().on("click", function(n){
          console.log(n);
        });
      }
    }else{
      console.log("elements NOT FOUND");
    }
  }
  self.selectChain = function(){
    var ch_ = top.global_infoAlignment.chain;
    self.cy.$('node').selectify();
    self.cy.$(self.selected).unselect();
    self.cy.$('#'+ch_).select();
    self.selected = '#'+ch_;
    self.cy.$('node').unselectify();
  }
}
