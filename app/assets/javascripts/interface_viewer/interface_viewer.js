"use strict";

var d3 = require("d3");

var interface_viewer = function(args){

  var self = this;

  self.ticks = 4;
  self.height_width = 750;
  self.dl = 25;
  self.dr = 5; 
  self.ann_w = 10;

  self.dom_id = args.dom_id;
  self.seq_N = args.seq_N;
  self.seq_M =  args.seq_M;
  self.ch_x = args.ch_x;
  self.ch_y = args.ch_y;

  self.x_color = args.x_color;
  self.y_color = args.y_color;

  if(args.seq_N < args.seq_M){
    self.seq_M = args.seq_N;
    self.seq_N = args.seq_M;
    self.ch_x = args.ch_y;
    self.ch_y = args.ch_x;
    self.x_color = args.y_color;
    self.y_color = args.x_color;
  }

  self.ticks_N = self.ticks;
  self.ticks_M = self.ticks;

  self.width = self.height_width;
  self.height = self.width * (self.seq_M/self.seq_N);
  if(self.height<250) self.height = 250;

  if(self.seq_N<200){
    self.ticks_N = 2;
  }
  
  if(self.seq_M<200){
    self.ticks_M = 2
  }

  d3.select("svg#"+self.dom_id).attr("width",self.width).attr("height",self.height);

  self.svg = d3.select("svg");
  self.G = self.svg.append("g").attr("name","G").attr("transform", "translate("+self.dl+","+self.dl+")");

  self.x = d3.scaleLinear()
    .domain([0, self.seq_N+10])
    .range([self.dl,self.width-self.dl]);

  self.y = d3.scaleLinear()
    .domain([0, self.seq_M+10])
    .range([self.dl,self.height-self.dl]);

  self.zoom = d3.zoom()
    .scaleExtent([1,100])
    .translateExtent([ [0,0], [self.width, self.height] ])
    .on("zoom",function(){
      self.zoomed();
    });

  self.xAxis = d3.axisBottom(self.x)
    .ticks(self.ticks_N)
    .tickPadding(-30);

  self.yAxis = d3.axisRight(self.y)
    .ticks(self.ticks_M)
    .tickPadding(-30);

  self.main_g = self.G.append("g")
    .attr("name","annotations")

  var rri_rect = self.main_g.append("rect")
    .attr("name","rri")
    .attr("x",self.x(0))
    .attr("y",self.y(0))
    .attr("width", ( self.x(self.seq_N)-self.x(0)) )
    .attr("height", ( self.y(self.seq_M)-self.y(0)) )
    .style("fill","#FFF")
    .style("stroke","#666")
    .style("stroke-dasharray","1,1")

  self.rri = rri_rect.node().getBBox()

  self.G.append("rect")
    .attr("x",-self.dl)
    .attr("y",-self.dl)
    .attr("width", self.width )
    .attr("height", 2*self.dl-1-self.ann_w )
    .style("fill","#FFF")

  self.G.append("rect")
    .attr("x",-self.dl)
    .attr("y",-self.dl)
    .attr("width", 2*self.dl-1-self.ann_w )
    .attr("height", self.height )
    .style("fill","#FFF")

  self.gX = self.G.append("g")
    .attr("class", "axis")
    .call(self.xAxis);

  self.gX.selectAll("line")
    .style("stroke",self.x_color);

  self.gX.selectAll("path")
    .style("stroke",self.x_color);

  self.gY = self.G.append("g")
    .attr("class", "axis")
    .call(self.yAxis);

  self.gY.selectAll("line")
    .style("stroke",self.y_color);

  self.gY.selectAll("path")
    .style("stroke",self.y_color);


  self.G.call(self.zoom);

  self.zoomed = function () {

    var scale = d3.event.transform.k;
    if(scale>1){
      d3.event.transform.x = Math.min(d3.event.transform.x, (1-scale)*self.dl);
      d3.event.transform.y = Math.min(d3.event.transform.y, (1-scale)*self.dl);

      d3.event.transform.x = Math.max(d3.event.transform.x, self.width-( self.rri.width*scale + 2*self.dl*scale + (1-scale)*self.dl )-10 );
      d3.event.transform.y = Math.max(d3.event.transform.y, self.height-( self.rri.height*scale + 2*self.dl*scale + (1-scale)*self.dl )-10 );
    }

    self.main_g.attr("transform", d3.event.transform);

    self.main_g.selectAll("circle")
      .attr("r", self.dr/scale )
      .style("stroke-width", 1/scale );

    self.main_g.selectAll("rect").style("stroke-width", 1/scale );
    self.main_g.selectAll("rect.annotation_M").attr("x", self.x(0)-self.ann_w/scale).attr("width", self.ann_w/scale);
    self.main_g.selectAll("rect.annotation_N").attr("y", self.y(0)-self.ann_w/scale).attr("height", self.ann_w/scale);

    self.gX.call( self.xAxis.scale(d3.event.transform.rescaleX(self.x) ));
    self.gY.call( self.yAxis.scale(d3.event.transform.rescaleY(self.y) ));

    self.gX.selectAll("line")
      .style("stroke",self.x_color);

    self.gX.selectAll("path")
      .style("stroke",self.x_color);

    self.gY.selectAll("line")
      .style("stroke",self.y_color);

    self.gY.selectAll("path")
      .style("stroke",self.y_color);
  }

  self.add_annotation = function(a){
    var x = self.x(a.start-0.5);
    var y = self.y(0)-self.ann_w;
    var dx = self.x(a.end+1)-self.x(a.start);
    var dy = self.ann_w;
    var class_ = "annotation_N";
    var color = "#666";
    if(a.color) color = a.color;

    var p_x = x;
    var p_y = self.y(0);
    var p_dx = dx;
    var p_dy = self.y(self.seq_M)-p_y;
    var p_class_ = "projection_N";
    
    if(a.seq == "M"){
      x = self.x(0)-self.ann_w;
      y = self.y(a.start-0.5);
      dx = self.ann_w;
      dy = self.y(a.end+1)-self.y(a.start)
      class_ = "annotation_M";

      p_x = self.x(0);
      p_y = y;
      p_dx = self.x(self.seq_N)-p_x;
      p_dy = dy;
      p_class_ = "projection_M";
    }

    self.main_g.append("rect")
      .attr("class", class_)
      .attr("x", x)
      .attr("y", y)
      .attr("width", dx)
      .attr("height", dy)
      .style("fill",color)
      .style("stroke",color)
      .style("fill-opacity",".3")
      .style("cursor", "pointer")
      .on("mouseover", function(d) {
        d3.select(this).style("fill-opacity", .6);
      })
      .on("mouseout", function(d) {
        d3.select(this).style("fill-opacity", .3);
      })
      .on("click", function(){
        console.log(a);
      });

    self.main_g.append("rect")
      .attr("class", p_class_)
      .attr("x", p_x)
      .attr("y", p_y)
      .attr("width", p_dx)
      .attr("height", p_dy)
      .style("fill",color)
      .style("stroke",color)
      .style("fill-opacity",".1")
      .style("stroke-dasharray","1,1")
  }

  self.add_multiple_annotations = function(A){
    A.forEach(function(a){
      self.add_annotation(a);
    });
  }

  self.add_pair = function(a){
    var x = self.x(a[0]);
    var y = self.y(a[1]);
    self.main_g.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .style("fill","#e5c100")
      .style("stroke","#000")
      .style("stroke-width",1)
      .attr("r", self.dr)
      .on("mouseover", function(d) {
        d3.select(this).style("fill", "#ffff00");
      })
      .on("mouseout", function(d) {
        d3.select(this).style("fill", "#e5c100");
      })
      .style("cursor", "pointer")
      .on("click", function(){
        highlight_rri([self.ch_x,self.ch_y],a);
      });
  }

  self.add_multiple_pairs = function(A){
    A.forEach(function(a){
      self.add_pair(a);
    });
  }

}

module.exports = {
  interface_viewer:interface_viewer
};
