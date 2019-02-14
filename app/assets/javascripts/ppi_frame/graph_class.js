function graph_class(args){
  var self = this;
  self.args = args;
  self.element_id = self.args.element_id;
  self.elements = self.args.elements;
  self.positions = false;
  self.annotations = {};
  self.default_color = "#80a2ff";
  self.default_color_c = "#00e63d";//"#80ffa2";
  self.name_color = "#bbbbff";
  self.name_color_c = "#bbffbb";//"#80ffa2";
  self.border_color = "#bbb";//"#4db5ff";
  self.selected_color = "#ffd11a";//"#ffdd99";
  self.interface_instance = require("interface_viewer");
  self.network_flag = top.network_flag;
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
              'font-size': '14px',
              'background-color': 'data(backgroundColor)',
              'border-color': 'data(borderColor)',
              'border-width': 2,
              'ann-size': 4,
              'text-outline-color': '#555',
              'text-outline-width': '1px',
              'color': 'data(color)'
            })
            .selector('node:selected').css({
              'font-size': '20px',
              'text-outline-width': '2px'
            })
            .selector('edge').css({
              'line-color': 'data(lineColor)',
              'line-style': 'data(lineStyle)',
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

        if(top.global_infoAlignment && !top.network_selected){
          var ch_ = top.global_infoAlignment.chain;
          self.cy.$('#'+ch_).select();
          self.selected = '#'+ch_;
          self.cy.$('#'+ch_).data("borderColor",self.default_color)
          self.cy.$('#'+ch_).data("color",self.selected_color);
        }else if(top.network_selected){
          var acc = top.network_selected;
          self.cy.$('#'+acc).select();
          self.cy.$('#'+acc).data("color",self.name_color);
        }
        self.cy.$('node').unselectify();

        self.cy.nodes().on("click", function(n){
          if(top.network_flag){
            if(top.global_infoAlignment.file != n.cyTarget.data("file") || (!n.cyTarget.data("file") && top.global_infoAlignment.acc != n.cyTarget.data("acc")) ){
              self.reset_node_color_name();
              var data = {'file':n.cyTarget.data("file"),'acc':n.cyTarget.id(),'node':n};
              var evt = document.createEvent("CustomEvent");
              evt.initCustomEvent("network_selection",true,true,data);
              top.window.dispatchEvent(evt);
              self.cy.$('node').selectify();
              self.cy.$(":selected").unselect();
              n.cyTarget.data("color",self.name_color);
              n.cyTarget.select();
              self.cy.$('node').unselectify();
            }else{
              setTimeout(function(){
                var selection = display_active_data(n);
              },1000);
            }
          }else{
            self.reset_node_color();
            var id = n.cyTarget.id();
            self.cy.$('#'+id).data("borderColor",self.default_color)
            display_active_data(n);
          }
        });

        self.cy.edges().on("click", function(n){
          if(top.network_flag){
            if(!n.cyTarget.data("file"))return;
            self.reset_node_color_name();
            var source = n.cyTarget.source().id();
            var target = n.cyTarget.target().id();
            self.cy.$('#'+source).data("color",self.name_color);
            self.cy.$('#'+target).data("color",self.name_color_c);
            if(top.global_infoAlignment.file != n.cyTarget.data("file")){
              var data = {'file':n.cyTarget.data("file"),'acc':n.cyTarget.id(),'edge':n};
              var evt = document.createEvent("CustomEvent");
              evt.initCustomEvent("network_selection",true,true,data);
              top.window.dispatchEvent(evt);
              self.cy.$('node').selectify();
              self.cy.$(":selected").unselect();
              var source = n.cyTarget.source().id();
              var target = n.cyTarget.target().id();
              self.cy.$('#'+source).select();
              self.cy.$('#'+source).data("color",self.name_color);
              self.cy.$('#'+target).select();
              self.cy.$('#'+target).data("color",self.name_color_c); 
              self.cy.$('node').unselectify();           
            }else{
              setTimeout(function(){
                var selection = display_active_data_edge(n);
              },300);
            }
          }else{
            self.reset_node_color(); 
            var source = n.cyTarget.source().id();
            var target = n.cyTarget.target().id();
            self.cy.$('#'+source).data("borderColor",self.default_color);
            self.cy.$('#'+target).data("borderColor",self.default_color_c);
            var selection = display_active_data_edge(n);
            if( n.originalEvent.shiftKey ){
              self.display_interface(n.cyTarget,selection);
            }
          }
        });
      }
    }else{
      console.log("elements NOT FOUND");
    }
  }

  self.reset_node_color_name = function(){
    if(!self.cy)return;
    self.cy.nodes(function(i,node){
      if( node.data("color") != "#bbb" ){
        node.data("color","#bbb");
      }
    });
  }

  self.reset_node_color = function(){
    self.cy.nodes(function(i,node){
      if( node.data("borderColor") == self.default_color || node.data("borderColor") == self.default_color_c ){
        node.data("borderColor",self.border_color);
      }
    });
  }
  self.selectChain = function(){
    if(!self.cy)return;
    if(top.network_flag){
      self.reset_node_color_name();
      var acc = top.global_infoAlignment.acc;
      self.cy.$('#'+acc).data("color",self.name_color);
    }else{
      var ch_ = top.global_infoAlignment.chain;
      self.cy.$('node').selectify();
      self.cy.$(self.selected).unselect();
      self.cy.$('#'+ch_).select();
      self.selected = '#'+ch_;
      self.reset_node_color();
      self.cy.$('#'+ch_).data("borderColor",self.default_color)
      self.reset_node_color_name();
      self.cy.$('#'+ch_).data("color",self.selected_color);
      self.cy.$('node').unselectify();
    }
  }

  self.load_features = function(name){
    var pdb;
    var url;
    if( $j("#loading_div").length > 0 ){
      swal({
        title: "DOWNLOAD IN PROGRESS",
        text: "PLEASE, WAIT UNTIL THE CURRENT DOWLOAD IS FINISHED",
        timer: 2000,
        type: "warning",
        showConfirmButton: true
      });
      return;
    }
    if(name in self.annotations){
      self.display_filter(null,name);
      return;
    }
    if(self.network_flag){
      self.post_features(name,"network");
    }else if(name == "custom"){
      self.post_features(name,"complex");
    }else if(name == "variants" && top.uploaded_annotations && top.uploaded_annotations.result){
      self.post_features(name,null);
    }else{
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
        success: function(data){
          $j(".annotaion_filter").css("display","none");
          $j("#body").append("<div class=\"annotaion_filter\" id=\"loading_div\"><div class=\"title_filter\"><span>LOADING ...</span></div></div>")
          self.recursive_check(data['job_id'],name);
        },
        error:function(e){
          console.log(e);
        }
      });
    }
  }
  self.recursive_check = function(job_id,name){
    var url = "/api/job/status/"+job_id;
    $j.ajax({
      type: "GET",
      url: url,
      success: function(data){
        console.log(data);
        if(data['outputs']){
          $j("#loading_div").remove();
          self.annotations[name]={'data':data['outputs'],'active':true};
          self.display_filter(data['outputs'].graph,name);
        }else{
          setTimeout(function(){
            $j("#loading_div div.title_filter span").html("LOADING "+data['status']+"%");
            self.recursive_check(job_id,name);
          },1200);
        }
      }
    });
  }; 
  self.post_features = function(name,type){
    var url;
    var data;
    if(type=="network"){
      url = "/api/annotations/ppi/network";
      data = {'network':JSON.stringify(ppi_network),'name':name};
    }else if(type=="complex"){
      url = "/api/annotations/ppi/custom";
      data = { 'pdb': top.global_infoAlignment.pdb, 'path': top.global_infoAlignment.path };
    }else if(name=="variants"){
      var pdb = top.global_infoAlignment.pdb;
      if(top.global_infoAlignment.path){
        url = "/api/annotations/ppi/"+name+"/"+pdb.replace(".","__")+"?path="+top.global_infoAlignment.path
      }else{
        url = "/api/annotations/ppi/"+name+"/"+pdb
      }
      data = {};
    }
    if( (name=="custom" || name=="variants") && top.uploaded_annotations && top.uploaded_annotations.result ) data['annotations'] = top.uploaded_annotations.result;
    $j.ajax({
      type: "POST",
      url: url,
      data: data,
      dataType: 'json',
      success: function(data){
        $j(".annotaion_filter").css("display","none");
        $j("#body").append("<div class=\"annotaion_filter\" id=\"loading_div\"><div class=\"title_filter\"><span>LOADING 0%</span></div></div>")
        self.recursive_check(data['job_id'],name);
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

      var format_keys = []
      var eq_key = {}
      for(var k in keys){
        var i = format_name(k,key).toUpperCase();
        format_keys.push( i );
        if(i in eq_key){
          console.log(k+"\n"+eq_key[i]);
        }
        eq_key[i]=k;
      }
      
      format_keys.sort().forEach( function(i){
        var k = eq_key[i];
        var color_flag = "<span style=\"font-size:12px;color:"+keys[k]+";\">&nbsp;&nbsp;&#9679;</span>";
        if( graph_data.enriched && i in graph_data.enriched ){
          color_flag = "<span style=\"font-size:12px;color:"+keys[k]+";\">&nbsp;&nbsp;&#9673;</span>";
        }
        $j("#"+key+"_annotaion_filter").append("<div class=\"item_filter\" value=\""+k+"\"><span>"+i+"</span>"+color_flag+"</div>"); 
      });
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

  self.display_interface = function(edge,selection){
    var source = edge.source().id();
    var target = edge.target().id();
    $j("#interface_div").remove();
    $j(body).append("<div id=\"interface_div\"><div><div><p id=\"close_interface\">&#10006;</p><svg id=\"interface_svg\"/></div></div></div>");
    $j("#close_interface").click(function(){
      $j("#interface_div").remove();
    });

    
    var $ALIGNMENTS = top.$ALIGNMENTS;
    var pdb = top.global_infoAlignment["pdb"];

    var source_acc = Object.keys($ALIGNMENTS[pdb][source])[0]
    var soruce_len = $ALIGNMENTS[pdb][source][source_acc]["uniprotSeq"].length

    var target_acc = Object.keys($ALIGNMENTS[pdb][target])[0]
    var target_len = $ALIGNMENTS[pdb][target][target_acc]["uniprotSeq"].length

    var g_interface = new self.interface_instance.interface_viewer({ dom_id:"interface_svg", seq_N:soruce_len, seq_M:target_len, ch_x:source, ch_y:target, x_color:self.default_color, y_color:self.default_color_c });

    var ch_x = source;
    var ch_y = target;
    if(soruce_len<target_len){
      ch_x = target;
      ch_y = source;
    }
    var annotations = []
    selection[ch_x].forEach(function(i){
      annotations.push({start:i.begin,end:i.end,color:i.color})
    });
    selection[ch_y].forEach(function(i){
      annotations.push({start:i.begin,end:i.end,color:i.color,seq:"M"})
    });
    g_interface.add_multiple_annotations(annotations);

    var n_model = 0;
    var rri = top.$COMPUTED_FEATURES[pdb]["rri"][n_model][source][target];
    if( target_len>soruce_len){
      rri = top.$COMPUTED_FEATURES[pdb]["rri"][n_model][target][source];
    }
    g_interface.add_multiple_pairs(rri);
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
