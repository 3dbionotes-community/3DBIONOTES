function graph_class(args){
  var self = this;
  self.args = args;
  self.element_id = self.args.element_id;
  self.elements = self.args.elements;
  self.positions = false;
  self.annotations = {};
  self.drawGraph = function(){
    if(self.elements){
      if( $j("#graph_div").css("display") == "block" ){
        self.cy = cytoscape({
          container: document.getElementById(self.element_id),
          style: cytoscape.stylesheet()
            .selector('node').css({
              'shape': 'ellipse',
              'height': 50,
              'width': 50,
              'content': 'data(name)',
              'text-valign': 'bottom',
              'color': '#11111',
              'font-family': '"Helvetica neue", helvetica, arial, sans-serif',
              'font-size': '10px',
              'background-color': '#FFFFFF',
              'border-color': '#aaa',
              'border-width': 2,
              'ann-size': 4,
              'text-outline-color': '#555',
              'text-outline-width': '1px',
              'color': '#fff'
            })
            .selector('node:selected').css({
              "border-color": "#ffcc00",
            })
            .selector('edge').css({
              'line-color': '#aaa',
              'line-style': 'solid',
              'width': 2,
              'ann-size': 4
            }),
          layout: {
            animate: false,
            name: 'spread',
            fit: true,
            padding: 20,
            minDist: 80,
            stop: function() {
              $j( "#"+self.element_id ).css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0}, 500);
            }
          },
          showOverlay: false,
          userZoomingEnabled: true,
          selectionType: "single",
          elements: self.elements
        });

        if(top.global_infoAlignment){
          var ch_ = top.global_infoAlignment.chain;
          self.cy.$('#'+ch_).select();
          self.selected = '#'+ch_;
        }
        self.cy.$('node').unselectify();
        self.cy.nodes().on("click", function(n){
          display_active_data(n);
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

  self.load_variants = function(){
    var pdb;
    if(top.global_infoAlignment.pdb){
      pdb = top.global_infoAlignment.pdb;
    }else{
      return;
    }
    $j.ajax({
      url:"/api/annotations/ppi/variants/"+pdb,
      success:function(data){
        self.annotations['variants']={'data':data,'active':true};
        self.display_variants(data);
      },
      error:function(e){
        console.log(e);
      }
    });
  }

  self.display_variants = function(_data){
    self.cy.nodes(function(i,node){
      if(_data.graph.nodes[node.id()]){
        node.data('nodeAnnotations',_data.graph.nodes[node.id()]);
      }
    });
  }

}
