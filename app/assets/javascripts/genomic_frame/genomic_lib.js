//= require jquery
var $j = jQuery.noConflict();
var ft;
var start_flag=true;

function update_genomic_display(e_name,e){
	__selected_transcript = $j("#ensembl_transcripts").children(":selected").text();
        var __url_query = "/api/alignments/ENSEMBL/"+$(e).val();
	document.getElementById('transcript_loading').style.display = "block";
	document.getElementById('gfv').style.display = "none";
	document.getElementById('gfv_buttons').style.display = "none";
	$.ajax({
          dataType: "json",
          url: __url_query,
          success: function(d){
		__genomic_alignment = d;
                $(e_name).empty();
          	build_genomic_display(e_name);
		document.getElementById('transcript_loading').style.display = "none";
		document.getElementById('gfv').style.display = "block";
		document.getElementById('gfv_buttons').style.display = "block";
	  }
        });
}

function build_genomic_display(e_name){
        if(!__genomic_alignment)return;
        var FeatureViewer = require("feature-viewer");
        ft = new FeatureViewer(__genomic_alignment['gene']['pos_seq'],e_name,{
                showAxis: true,
                showSequence: true,
                brushActive: true, //zoom
                toolbar:true, //current zoom & mouse position
                bubbleHelp:true, 
                zoomMax:1, //define the maximum range of the zoom
                index_shift:(parseInt(__genomic_alignment['gene']['start'])-1)
        });

        ft.addFeature({
                data:__genomic_alignment['gene']['neg_seq'],
                className: "neg",
                id:'neg_seq',
                name: "NEG STRAND",
                type: "text"
        });

        ft.addFeature({
                data:__genomic_alignment['aa_seq'],
                className: "pep",
                id:'protein_seq',
                name: "PROTEIN SEQ",
                type: "text"
        });
        
        ft.addFeature({
                data: __genomic_alignment['transcript']['alignment']['gene_exon_intervals'],
                name: __selected_transcript,
                className: "transcript_segments",
                color: "#1E90FF",
                type: "rect",
        });
        
        ft.addFeature({
                data: __genomic_alignment['transcript']['alignment']['gene_uniprot_intervals'],
                name: "UNIPROT ALIGN",
                className: "uniprot_coverage",
                color: "#87CEFA",
                type: "rect",
        });

	add_transcripts(ft);
	add_variations(ft,start_flag);
	start_flag = false;
	//add_annotations(ft);

	ft.onFeatureSelected(function (d) {
		ft.highlighted = [d.detail['start'],d.detail['end']];
		triggerGeneCoordinates( d.detail['start'],d.detail['end'] );
	});
	svg_div();
}

function add_transcripts(ft){
	if( $j('#pct_cb').is(':checked') ){
		__add_pct(ft);
	}
	if( $j('#nct_cb').is(':checked') ){
		__add_nct(ft);
	}
}

function __add_nct(ft){
	for( var i in __genomic_annotations['transcripts']['non_coding'] ){
		var transcript = [];
		__genomic_annotations['transcripts']['non_coding'][i].forEach(function(j){
			transcript.push({'x':j['x']-ft.index_shift,'y':j['y']-ft.index_shift});
			
		});
		ft.addFeature({
	              	data: transcript,
        	      	name: i,
               		className: i,
                	color: "#A0FF97",
                	type: "rect",
        	});
	}
}
function __add_pct(ft){
	for( var i in __genomic_annotations['transcripts']['coding'] ){
		if( i === __selected_transcript ) continue;
		var transcript = [];
		__genomic_annotations['transcripts']['coding'][i].forEach(function(j){
			transcript.push({'x':j['x']-ft.index_shift,'y':j['y']-ft.index_shift});
			
		});
		ft.addFeature({
	              	data: transcript,
        	      	name: i,
               		className: i,
                	color: "#1E90FF",
                	type: "rect",
        	});
	}
}

function add_annotations(ft){
	var __annotations = {};
	var __strand = {'1':'Positive','-1':'Negative','0':'Both'};

	__genomic_annotations['repeat'].forEach(function(i){
		if(!('repeat' in __annotations)) __annotations['repeat']=[];
		var __description = i['description'];
		__annotations[ 'repeat' ].push({'x':i['x']-ft.index_shift,'y':i['y']-ft.index_shift,'description':__description})
	});

	__genomic_annotations['simple'].forEach(function(i){
		if(!('simple' in __annotations)) __annotations['simple']=[];
		var __description = i['description'];
		__annotations[ 'simple' ].push({'x':i['x']-ft.index_shift,'y':i['y']-ft.index_shift,'description':__description})
	});

	__genomic_annotations['constrained'].forEach(function(i){
		if(!('constrained' in __annotations)) __annotations['constrained']=[];
		var __description = i['description'];
		__annotations[ 'constrained' ].push({'x':i['x']-ft.index_shift,'y':i['y']-ft.index_shift,'description':__description})
	});

	if('repeat' in __annotations) ft.addFeature({
                data: __annotations['repeat'],
                name: "REPEATS",
                className: "repeat",
                color: "#BF8CA7",
                type: "rect",
        });

	if('simple' in __annotations) ft.addFeature({
                data: __annotations['simple'],
                name: "SIMPLE",
                className: "simple",
                color: "#BF00F7",
                type: "rect",
        });

	if('constrained' in __annotations) ft.addFeature({
                data: __annotations['constrained'],
                name: "CONSTRAINED",
                className: "constrained",
                color: "#FFA097",
                type: "rect",
        });

	var name = 'motif';
	__genomic_annotations[ name ].forEach(function(i){
		if(!(name in __annotations)) __annotations[name]=[];
		var __description = i['description'];
		__annotations[ name ].push({'x':i['x']-ft.index_shift,'y':i['y']-ft.index_shift,'description':__description})
	});

	if( name in __annotations) ft.addFeature({
                data: __annotations[name],
                name: name.toUpperCase(),
                className: name,
                color: "#FFA097",
                type: "rect",
        });
}

function add_variations (ft,start_flag){
	var __variations = {};
	var __strand = {'1':'Positive','-1':'Negative','0':'Unknown'};
	var __ensembl_colors = {"Pathogenic":"#FF0000","Benign":"#00FF00","Unknown":"#FF00FF","transcript_ablation":"#ff0000","splice_acceptor":"#FF581A","splice_donor":"#FF581A","stop_gained":"#ff0000","frameshift":"#9400D3","stop_lost":"#ff0000","start_lost":"#ffd700","transcript_amplification":"#ff69b4","inframe_insertion":"#ff69b4","inframe_deletion":"#ff69b4","missense":"#ffd700","protein_altering":"#FF0080","splice_region":"#ff7f50","incomplete_terminal_codon":"#ff00ff","stop_retained":"#76ee00","synonymous":"#76ee00","coding_sequence":"#458b00","mature_miRNA":"#458b00","5_prime_UTR":"#7ac5cd","3_prime_UTR":"#7ac5cd","non_coding_transcript_exon":"#32cd32","intron":"#02599c","NMD_transcript":"#ff4500","non_coding_transcript":"#32cd32","upstream_gene":"#a2b5cd","downstream_gene":"#a2b5cd","TFBS_ablation":"#a52a2a","TFBS_amplification":"#a52a2a","TF_binding_site":"#a52a2a","regulatory_region_ablation":"#a52a2a","regulatory_region_amplification":"#a52a2a","feature_elongation":"#7f7f7f","regulatory_region":"#a52a2a","feature_truncation":"#7f7f7f","intergenic":"#636363"};

	__genomic_variations['variation'].forEach(function(i){

		if(!i['clinical_significance'])i['clinical_significance'] = ["Unknown"];
                if(!i['alleles'])i['alleles']=["Unknown"];
                if(!i['consequence_type'])return;

		var __description = '<b>Source:</b> '+i['source']+'/'+i['id']+'<br/><b>Strand:</b> '+__strand[i['strand']]+'<br/><b>Allelles:</b> '+i['alleles'].join(" / ").replace(/_/g," ")+"<br/><b>Clinical Significnace:</b> "+i['clinical_significance'].join(" / ")+"<br/><b>Consequence type:</b> "+i['consequence_type'].replace(/_/g," ");

		//var __consequence = i['consequence_type'].replace("3_prime_","").replace("5_prime_","").replace("_variant","");
                var __consequence;
                if( i['clinical_significance'].join(";").toLowerCase().includes("pathogenic")){
                  __consequence = "Pathogenic";
                }else if( i['clinical_significance'].join(";").toLowerCase().includes("benign") ){
                  __consequence = "Benign";
                }else{
                  __consequence = "Unknown";
                  return;
                }

		if( !(__consequence in __variations) ){
			__variations[ __consequence ] = [];
		}

		__variations[ __consequence ].push({'x':i['x']-ft.index_shift,'y':i['y']-ft.index_shift,'description':__description})
	});

	/*__genomic_variations['somatic_variation'].forEach(function(i){

		if(!i['clinical_significance'])i['clinical_significance'] = "Unknown";

		var __description = '<b>Strand:</b> '+__strand[i['strand']]+'<br/><b>Allelles:</b> '+i['alleles'].join(" / ").replace(/_/g," ")+"<br/><b>Clinical Significnace:</b> "+i['clinical_significance'].join(" / ")+"<br/><b>Consequence type:</b> "+i['consequence_type'].replace(/_/g," ");

		//var __consequence = i['consequence_type'].replace("3_prime_","").replace("5_prime_","").replace("_variant","");
                var __consequence;
                if( i['clinical_significance'].join(";").toLowerCase().includes("pathogenic")){
                  __consequence = "Pathogenic";
                }else if( i['clinical_significance'].join(";").toLowerCase().includes("benign") ){
                  __consequence = "Benign";
                }else{
                  __consequence = "Uncertain";
                  return;
                }

		if( !(__consequence in __variations) ){
			__variations[ __consequence ] = [];
		}

		__variations[ __consequence ].push({'x':i['x']-ft.index_shift,'y':i['y']-ft.index_shift,'description':__description})
	});*/

	if(start_flag)__build_gfv_display_variants( __variations );

	["Pathogenic", "Benign", "Unknown"].forEach(function(i){
		var __name = i.replace(/_/g," ").toUpperCase();
		var __color = "#FF8C00";
		if(i in __ensembl_colors)__color = __ensembl_colors[i];
		if( __name.length > 12) __name = __name.substring(0,13); 
		if( $j('#'+i).is(':checked') )ft.addFeature({
        	        data: __variations[i],
               		name: __name,
                	className: i,
                	color: __color,
                	type: "rect",
        	});
	});
}

function __build_gfv_display_variants( __variations ){
	for(var i in __variations){
		var __name = i.replace(/_/g," ").toUpperCase();
		$j('.gfv_display_variants').append('<input id="'+i+'" class="gfv_cb" type="checkbox" checked="1"/>'+__name+'<br/>');
	}
}

function svg_div(){
	$('.svgHeader').after('<div id="svg_div"></div>');
	$('svg').appendTo('#svg_div');
}

function triggerGeneCoordinates(start,end){

  var i = start;
  var j = end;
  var __p_start;
  var __p_end;
  var p_start;
  var p_end;
  var strand = __genomic_alignment.gene.strand;

  while(i<=j && (!p_start || !p_end)){
    __p_start = __genomic_alignment.transcript.alignment.g2p[i];
    __p_end = __genomic_alignment.transcript.alignment.g2p[j];
    p_start = __genomic_alignment.transcript.alignment.p2u[__p_start];
    p_end = __genomic_alignment.transcript.alignment.p2u[__p_end];
    if(!p_start) i=i+1;
    if(!p_end) j=j-1;
  }
  
  if(strand<0){
    aux = p_start;
    p_start = p_end;
    p_end = aux;
  }

  var selection = {begin:p_start, end:p_end, frame:"genomicFrame"}
  trigger_aa_selection(selection);

}

function clear_selection(){
  ft.__clear();
}

/*function build_table(head,array){
  var out = "<table>";
  var first = true;
  array.forEach(function(r){
    var h = "";
    if(first) h = head;
    out += "<tr><td>"+h+"</td><td>"+r+"</td></tr>";
    first = false;
  });
  out += "</table>";
  return out;
}*/
