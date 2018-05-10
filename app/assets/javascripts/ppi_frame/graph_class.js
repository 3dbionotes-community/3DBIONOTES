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
              'shape': 'data(shape)',
              'height': 'data(height)',
              'width': 'data(width)',
              'content': 'data(name)',
              'text-valign': 'bottom',
              'font-family': '"Helvetica neue", helvetica, arial, sans-serif',
              'font-size': '10px',
              'background-color': 'data(backgroundColor)',
              'border-color': 'data(borderColor)',
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
              'line-color': 'data(lineColor)',
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

        self.cy.edges().on("click", function(n){
          display_active_data_edge(n);
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

  self.load_features = function(name){
    var pdb;
    var url;
    
    if(name in self.annotations){
      self.display_filter(null,name);
      return;
    }
    if(top.global_infoAlignment.pdb){
      pdb = top.global_infoAlignment.pdb;
      if(top.global_infoAlignment.path){
        url = "/api/annotations/ppi/"+name+"/"+pdb.replace(".","__")+"?path="+top.global_infoAlignment.path
      }else{
        url = "/api/annotations/ppi/"+name+"/"+pdb
      }
    }else{
      return;
    }
   
    $j.ajax({
      url:url,
      success:function(data){
        self.annotations[name]={'data':data,'active':true};
        self.display_filter(data.graph,name);
      },
      error:function(e){
        console.log(e);
      }
    });
  }

  self.clear_annotations = function(){
    self.cy.nodes(function(i,node){
      node.data('nodeAnnotations',[]);
    });

    self.cy.edges(function(i,edge){
      edge.data('sourceAnnotations',[]);
      edge.data('targetAnnotations',[]);
    });   
  }
  
  self.display_filter = function(graph_data,key){
    $j(".annotaion_filter").css("display","none");
    if( $j("#"+key+"_annotaion_filter").length == 0 ){
      var keys = {};
      for(var ch in graph_data.nodes){
        graph_data.nodes[ch].forEach(function(i){
          keys[i.subtype]=i.color;
        });
      }
      for(var cc in graph_data.edges){
        graph_data.edges[cc].forEach(function(i){
          keys[i.subtype]=i.color;
        });
      }
      $j("#body").append("<div class=\"annotaion_filter\" id=\""+key+"_annotaion_filter\"><div class=\"title_filter\"><span>FILTER "+key.toUpperCase()+"</span></div></div>")
      $j("#"+key+"_annotaion_filter").append("<div id=\""+key+"_all\" class=\"item_filter item_clicked show_all\" value=\""+key+"\"><span>SHOW ALL</span></div>");
      for(var k in keys){
        $j("#"+key+"_annotaion_filter").append("<div class=\"item_filter\" value=\""+k+"\"><span>"+format_name(k,key).toUpperCase()+"</span><span style=\"color:"+keys[k]+";\">&nbsp;&nbsp;&#9899;</span></div>"); 
      }
      $j("#"+key+"_annotaion_filter .item_filter").click(function(e){
        if( $j(this).attr('id')!=key+"_all" ){
          $j( "#"+key+"_all" ).removeClass('item_clicked');
        }else{
          var flag = false;
          if( $j(this).hasClass('item_clicked') )flag=true;
          $j("#"+key+"_all").siblings().removeClass('item_clicked');
          if(flag) $j(this).addClass('item_clicked');
        }
        if( $j(this).hasClass('item_clicked') ){
          $j(this).removeClass('item_clicked');
        }else{
          $j(this).addClass('item_clicked');
        }
        self.filter_annotations();
      });
    }else{
      $j("#"+key+"_annotaion_filter").css("display","block");
    }
    self.filter_annotations();
  }

  self.filter_annotations = function(){
    self.clear_annotations();
    var data = {};
    for(var key in self.annotations){
      var _data = self.__filter_annotations(key);
      for(var ch in _data){
        if(ch in data){
          data[ch].push.apply(data[ch], _data[ch])
        }else{
          data[ch]=_data[ch];
        }
      }
    }
    self.cy.nodes(function(i,node){
      if(data[node.id()]){
        node.data('nodeAnnotations',data[node.id()]);
      }
    });
    self.cy.edges(function(i,edge){
      var source = edge.source().id();
      var target = edge.target().id();
      if(data[source+target]){
        edge.data('sourceAnnotations',data[source+target]);
      }
      if(data[target+source]){
        edge.data('targetAnnotations',data[target+source]);
      }
    });
  }

  self.__filter_annotations = function(key){
    var values = {};
    if($j( "#"+key+"_all" ).hasClass('item_clicked') ){
      values = "ALL";
    }else{
      $j(".item_clicked").each(function(i,e){
        values[$j(e).attr("value")]=true;
      });
    }
    var data = {};
    for(var ch in self.annotations[key].data.graph.nodes){
      data[ch] = []
      self.annotations[key].data.graph.nodes[ch].forEach(function(i){
        if(values == "ALL" || i.subtype in values){
          data[ch].push(i);
        }
      });
    }
    for(var cc in self.annotations[key].data.graph.edges){
      data[cc] = []
      self.annotations[key].data.graph.edges[cc].forEach(function(i){
        if(values == "ALL" || i.subtype in values){
          data[cc].push(i);
        }
      });
    }
    return data;
  }

}

function format_name(name,key){
  var out = name;
  if(key=="variants" && name.match(/doi/i)){
    var x = name.split("/ ");
    var y = x[1].split(" [");
    out = y[0];
  }
  return out;
}
