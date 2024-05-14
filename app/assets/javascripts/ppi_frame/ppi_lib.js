function display_active_data(node){
  var ch = node.cyTarget.id();
  var ch_ = ch;
  var selection = {};
  if(!top.network_flag){
    selection[ch] = [];
  }else{
    selection[top.global_infoAlignment.chain]=[]
  }

  var values = {};
  $j(".item_clicked").each(function(i,e){
    values[$j(e).attr("value")]=true;
  });
  for(var key in cytoscape_graph.annotations){
    var v = cytoscape_graph.annotations[key];
    if(v.active && ch in v.data.location){
      v.data.location[ch]["all"].forEach(function(i){
        if(i.type in values || $j( "#"+key+"_all" ).hasClass('item_clicked') ){
          if(top.network_flag){
            ch_=i.ch;
            if(!(ch_ in selection))selection[ch_]=[];
          }
          selection[ch_].push({begin:i.start,end:i.end,color:i.color});
        }
      });
    }
  }

  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("global_highlight",true,true,selection);
  top.window.dispatchEvent(evt);

  if(top.global_infoAlignment && top.global_infoAlignment.chain == ch_ ){
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("highlight_all_except_structure",true,true,selection[ch_]);
    top.window.dispatchEvent(evt);   
  }

}

function display_active_data_edge(edge){
  var source = edge.cyTarget.source().id();
  var s_ = source;
  var target = edge.cyTarget.target().id();
  var t_ = target;

  var values = {};
  $j(".item_clicked").each(function(i,e){
    values[$j(e).attr("value")]=true;
  });

  var selection = {};
  if(!top.network_flag){
    selection[source]=[];
    selection[target]=[];
  }else{
    selection["A"]=[];
    selection["B"]=[];
  }
  
  for(var key in cytoscape_graph.annotations){
    var v = cytoscape_graph.annotations[key];
    if(v.active && source in v.data.location && target in v.data.location[source].bs ){
      v.data.location[source].bs[target].forEach(function(i){
        if(i.type in values || $j( "#"+key+"_all" ).hasClass('item_clicked')){
          if(top.network_flag){
            s_=i.ch;
            if(!(s_ in selection))selection[s_]=[];
          }
          selection[s_].push({begin:i.start,end:i.end,color:i.color});
        }
      });
    }
  }

  for(var key in cytoscape_graph.annotations){
    var v = cytoscape_graph.annotations[key];
    if(v.active && target in v.data.location && source in v.data.location[target].bs ){
      v.data.location[target].bs[source].forEach(function(i){
        if(i.type in values || $j( "#"+key+"_all" ).hasClass('item_clicked')){
          if(top.network_flag){
            t_=i.ch;
            if(!(t_ in selection))selection[t_]=[];
          }
          selection[t_].push({begin:i.start,end:i.end,color:i.color});
        }
      });
    }
  }

  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("global_highlight",true,true,selection);
  top.window.dispatchEvent(evt);

  if(top.global_infoAlignment && top.global_infoAlignment.chain == s_ ){
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("highlight_all_except_structure",true,true,selection[s_]);
    top.window.dispatchEvent(evt);   
  }else if(top.global_infoAlignment && top.global_infoAlignment.chain == t_ ){
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("highlight_all_except_structure",true,true,selection[t_]);
    top.window.dispatchEvent(evt);
  }
  return selection;
}

function highlight_rri(CH,RR){
  var selection = {}  
  selection[CH[0]] = [{'begin':RR[0],'end':RR[0],'color':'rgb(255, 233, 153)'}];
  selection[CH[1]] = [{'begin':RR[1],'end':RR[1],'color':'rgb(255, 233, 153)'}];
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("global_highlight",true,true,selection);
  top.window.dispatchEvent(evt);
} 
