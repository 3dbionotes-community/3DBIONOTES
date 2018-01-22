function graph_class(args){
  var self = this;
  self.args = args;
  self.element_id = self.args.element_id;
  self.elements = self.args.elements;
  self.style = [
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(name)'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 3,
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
    graph = cytoscape({
      container: document.getElementById(self.element_id),
      elements: self.elements,
      style: self.style,
      layout: self.layout
    });
  }
}
