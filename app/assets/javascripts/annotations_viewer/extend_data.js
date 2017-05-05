var feature_viewer;
var my_variant_viewer;
var n_model = 1;
var diseases_table = {'none':[]};
var features_extended = false;
var variants_extended = false;
var $EXTERNAL_DATA = null;

if(top.$EXTERNAL_DATA){
  $EXTERNAL_DATA = top.$EXTERNAL_DATA;
}else{
  $EXTERNAL_DATA = {'PDBchain':{},'acc':{}};
}

function upgrade_fv(fv){
	max_zoom(fv);
	setup_highlight(fv);
        feature_viewer = fv;
}

function max_zoom(fv){
	fv.maxZoomSize = 59;
}

function extend_features(features){
        features_extended = true;
	add_pfam(features);
	add_smart(features);
	add_interpro(features);
	add_iedb(features);
	add_mobi(features);
	add_elmdb(features);
	add_coverage(features);
	add_phosphosite(features);
	add_dbptm(features);
	rebuild_ptm(features);
        add_binding_residues(features);
        add_asa_residues(features);
	add_highlight(features);
}

function extend_variants(features){
	add_biomuta(features);
	add_dsysmap(features);
        add_disease_menu(features);
}

function wait_message(message){
  if($j(".jsonp_info").length){
    $j('.jsonp_info').html("<div>"+message+"<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div>");
  }else{
    $j('body').append("<div class=\"filter_screen\"></div><div class=\"jsonp_info\" ><div>"+message+"<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div></div>");
  }
}

function clear_wm(){
  $j(".filter_screen").remove();
  $j(".jsonp_info").remove();
}


function get_all_external_soruces(){
  var acc = __accession;
  var key = __alignment.pdb+":"+__alignment.chain;
  if( $EXTERNAL_DATA && key in $EXTERNAL_DATA['PDBchain'] ){
    __external_data = $EXTERNAL_DATA['PDBchain'][ key ]
    clear_wm();
    build_ProtVista();
  }else{
    var __allURL = allURL.slice(0);
    get_external_data(__allURL, __external_data);
  }
}

function get_external_data( URL, d){
  var query = URL.shift();
  var url = query[1];
  var key = query[0];
  var save_flag = query[2];
  wait_message( "COLLECTING <span style=\"color:black\">"+key.toUpperCase()+"</span> "+(allURL.length-URL.length)+" / "+allURL.length );
  if( $EXTERNAL_DATA && key in $EXTERNAL_DATA['acc'] && __alignment.uniprot in $EXTERNAL_DATA['acc'][key] ){
    d[key] = $EXTERNAL_DATA['acc'][key][__alignment.uniprot];
    if(URL.length > 0){
      get_external_data( URL, d );
      return;
    }else{
      clear_wm();
      $EXTERNAL_DATA['PDBchain'][ __alignment.pdb+":"+__alignment.chain ] = d;
      build_ProtVista();
      return;
    }
  }else{
    $j.ajax({
      url: url,
      dataType: 'json',
      timeout:30000,
      success: function(data){
        d[key] = data;
        if( save_flag ){
          if(!$EXTERNAL_DATA['acc'][key])$EXTERNAL_DATA['acc'][key] = {};
          $EXTERNAL_DATA['acc'][key][__alignment.uniprot] = data;
        }
      },
      error: function(e){
        console.log("ajax error");
        console.log(e);
      }
    }).always(function(){
      if(URL.length > 0){
        get_external_data( URL, d );
        return;
      }else{
        clear_wm();
        $EXTERNAL_DATA['PDBchain'][ __alignment.pdb+":"+__alignment.chain ] = d;
        build_ProtVista();
        return;
      }
    });
  }
}

function variant_menu(){
  $j('.up_pftv_icon-location').remove();
  $j('.up_pftv_inner-icon-container a').css('cursor','pointer');
  $j('.up_pftv_inner-icon-container a').click(function(i){
    $j('.active_disease').each(function(i){
      $j(this).removeClass("active_disease");
      $j(this).addClass("unactive_disease");
      var k = $j(this).attr("title");
      $j(this).html("&#9675; "+k);
      my_variant_viewer.reset();
    });
  });
  $j('.up_pftv_inner-icon-container a').before("<a class=\"up_pftv_icon-button up_pftv_icon-location variant_std_menu\" style=\"cursor:pointer;\" title=\"Change filter: disease/cosequence\"></a>");
  $j(".variant_std_menu").click(function(i){
    if( $j(this).hasClass("variant_std_menu") ){
      $j(this).removeClass("variant_std_menu");
      $j(this).addClass("variant_disease_menu");
      $j(".up_pftv_diseases").css("display","inline-block");
    }else if( $j(this).hasClass("variant_disease_menu") ){
      $j(this).removeClass("variant_disease_menu");
      $j(this).addClass("variant_std_menu");
      $j('.active_disease').each(function(i){
        $j(this).removeClass("active_disease");
        $j(this).addClass("unactive_disease");
        var k = $j(this).attr("title");
        $j(this).html("&#9675; "+k);
      });
      my_variant_viewer.reset();
      $j(".up_pftv_diseases").css("display","none");
    }
  });
  $j('.up_pftv_track-header').css('position','relative')
  $j('.up_pftv_track-header').append("<div class=\"up_pftv_diseases\"><h4>Diseases</h4><div></div></div>");
  Object.keys(diseases_table).sort().forEach(function(k){
    if(k!="none")$j('.up_pftv_diseases div').append("<span class=\"disease_item unactive_disease\" title=\""+k+"\">&#9675; "+k+"</span><br/>");
  });
  $j('.disease_item').click(function(){show_diseases(this)});
}

function update_diseases(){
  var D = [];
  $j('.active_disease').each(function(){
    D.push( $j(this).attr('title') );
  }); 
  if( D.length == 0 ) return;
  var keep_variants = {}
  D.forEach( function(i){
    diseases_table[i].forEach(function(j){
      keep_variants[ j.internalId ] = true;
    });
  });
  $j('.up_pftv_variant').each(function(i){
    if(!keep_variants[ $j(this).attr("name") ])$j(this).remove();
  });
}

function show_diseases(d){
  if(d){
    var k = $j(d).attr("title");
    if( $j(d).hasClass("unactive_disease") ){
      $j(d).removeClass("unactive_disease");
      $j(d).addClass("active_disease");
      $j(d).html("&#9679; "+k);
    }else if( $j(d).hasClass("active_disease") ){
      $j(d).removeClass("active_disease");
      $j(d).addClass("unactive_disease");
      $j(d).html("&#9675; "+k);
    }
  }
  
  var D = [];
  $j('.active_disease').each(function(){
    D.push( $j(this).attr('title') );
  });
  filter_by_disease( D );

}

function add_disease_menu(__d){
  var d = __d[0][1]; 
  d.forEach(function(i){
    i.variants.forEach(function(j){
      if(j.association){
        j.association.forEach(function(k){
          if(!diseases_table[k.name]) diseases_table[k.name]=[];
          diseases_table[k.name].push(j);
        });
      }else{
        diseases_table['none'].push(j);
      }
    });
  });
}

function filter_by_disease( D ){
  my_variant_viewer.reset();
  if( D.length == 0 ) return;
  var keep_variants = {}
  D.forEach( function(i){
    diseases_table[i].forEach(function(j){
      keep_variants[ j.internalId ] = true;
    });
  });
  $j('.up_pftv_variant').each(function(i){
    if(!keep_variants[ $j(this).attr("name") ])$j(this).remove();
  });
}

function add_procheck(d){
  if( top.procheck ){
    var  procheck_scores = ["PROCHECK",[]]; 
    var n = 1;
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      procheck_scores[1].push(__f);
      n++;     
    }
    var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
    var n = 0;
    top.procheck[0][chain].forEach(function(i){
      if(i[1] && i[1].z_scores && i[1].z_scores.max){
        console.log(i[1].z_scores.max);
        var z_score = i[1].z_scores.max;
        if(z_score > 5 )z_score=5;
        var color = 'rgb(0,255,0)';
        if(z_score<=1){
          color = 'rgb(0,255,0)';
        }else if( z_score<=2){
          color = 'rgb(255,255,0)';
        }else if( z_score<=3){
          color = 'rgb(255,165,0)';
        }else if( z_score<=4){
          color = 'rgb(255,69,0)';
        }else{
          color = 'rgb(255,0,0)';
        }
        procheck_scores[1][ parseInt(i[0]) ].variants = [{ color:color, alternativeSequence:'', type:'measure', begin: i[0], end: i[0], score:z_score, internalId:'procheck_'+n, description:'TODO'}];
        n++;
      }
    });
    d.push( procheck_scores );
  }
}

function add_asa_residues(d){
  if( top.asa_residues ){
    n_model = top.n_model_main_frame-1;
    var  asa_res = ["RESIDUE_ASA",[]]; 
    var n = 1;
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      asa_res[1].push(__f);
      n++;     
    }
    var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
    if(top.asa_residues[n_model][chain]){
      var n = 0;
      top.asa_residues[n_model][chain].forEach(function(i){
        var r = parseInt(255/120*i[1]);
        if(r>255)r=255;
        var b = 255-r;
        if(b<0)b = 0;
        var color = 'rgb('+r+',0,'+b+')';
        asa_res[1][ parseInt(i[0]) ].variants = [{ color:color, alternativeSequence:'', type:'measure', begin: i[0], end: i[0], score:i[1], internalId:'asa_'+n, description:'<b style=\"color:grey;\">Accessible surface area</b><br/>Residue accesibility '+i[1]+'&#197<sup>2</sup>' }];
        n++;
      });
      d.push( asa_res );
    }
  }
}

function add_binding_residues(d){
  if( top.binding_residues && top.binding_residues[0] > 0 ){
    n_model = top.n_model_main_frame;
    var  b_res = ["INTERACTING_RESIDUES",[]]; 
    var n = 1;
    for(var i = 0;i<top.binding_residues[0];i++){
      var __f = {begin:(-100-1*i),end:(-100-1*i),internalId:'bs_'+n,type:'INTERACTING_RESIDUES',description:'<b style=\"color:grey;\">Binding Site</b><br/>Region that interacts with other proteins in the complex'};
      b_res[1].push(__f)
      n++;     
    }
    var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
    var n = 0;
    top.binding_residues[n_model][chain].forEach(function(i){
      b_res[1][n].begin = i.begin;
      b_res[1][n].end = i.end;
      n++;
    });
    d.push( b_res );
  }
}

function add_interpro(d){
	var n = 1;
	if( __external_data['interpro'] && __external_data['interpro'].length >  0){
		var __interpro = ["DOMAIN_FAMILIES",[]];
		var __interpro_flag = 1;
		d.forEach(function(i){
			if(i[0]=="Domain families"){
				__interpro = i;
				__interpro_flag = 0;
			}
		});

		__external_data['interpro'].forEach(function(i){
			var k = i['description']['name'];
			var __description = '<b>'+k+'</b>';
			var __ext = '';
			if( i['description']['go'] ){
				__ext = '<b style="color:grey;">GO terms</b><br/>'
				i['description']['go'].forEach(function(j){
					var r = j.split(' ; ');
					var go = r[0].replace("GO:","");
					go = go[0].toUpperCase() + go.slice(1);
					__ext += "<a href=\"http://amigo.geneontology.org/amigo/term/"+r[1]+"\" target=\"_blank\">"+go+"</a><br/>";
				});
			}
			if( __ext.length > 0 ) __description += '<br/>'+__ext;
			var __f = {begin:i['start'],end:i['end'],description:__description,internalId:'interpro_'+n,type:'INTERPRO_DOMAIN',evidences:
				{
					'ECO:0000311':[{url:'https://www.ebi.ac.uk/interpro/protein/'+__accession,id:__accession,name:'InterPro'}]
				}
			}
			__interpro[1].push(__f);
			n++;
		});
		if( __interpro_flag ) d.push( __interpro );
	}
}

function add_smart(d){
	var n = 1;
	if( __external_data['smart'] && __external_data['smart'].length >  0){
		var __smart = ["DOMAIN_FAMILIES",[]];
		var __smart_flag = 1;
		d.forEach(function(i){
			if(i[0]=="Domain families"){
				__smart = i;
				__smart_flag = 0;
			}
		});

		__external_data['smart'].forEach(function(i){
			var k = i['domain'].replace("_"," ");
			k = k[0].toUpperCase() + k.slice(1);
			var __description = '<b>'+k+'</b>';
			var __ext = '<b style="color:grey;">Type</b>: '+i['type'][0]+i['type'].slice(1).toLowerCase();

			if( __ext.length > 0 ) __description += '<br/>'+__ext;
			var __f = {begin:i['start'],end:i['end'],description:__description,internalId:'smart_'+n,type:'SMART_DOMAIN',evidences:
				{
					'ECO:0000311':[{url:'http://smart.embl.de/smart/batch.pl?INCLUDE_SIGNALP=1&IDS='+__accession,id:__accession,name:'SMART'}]
				}
			}
			__smart[1].push(__f);
			n++;
		});
		if( __smart_flag ) d.push( __smart );
	}
}

function add_pfam(d){
	var n = 1;
	if( __external_data['Pfam'] && __external_data['Pfam'].length >  0){
		var __pfam = ["DOMAIN_FAMILIES",[]];

		__external_data['Pfam'].forEach(function(i){
			var __description = '<b>'+i['info']['description']+'</b>';
			var __ext = '';
			for(var k in i['info']['go']){
				__ext += '<b style="color:grey;">'+k[0].toUpperCase() + k.slice(1)+'</b>: ';
				i['info']['go'][k].forEach(function(j){
					__ext += j+', '; 
				});
				__ext = __ext.slice(0, -2)+'<br/>';
			}
			if( __ext.length > 0 ) __description += '<br/>'+__ext;
			var __f = {begin:i['start'],end:i['end'],description:__description,internalId:'pfam_'+n,type:'PFAM_DOMAIN',evidences:
				{
					'ECO:0000311':[{url:'http://pfam.xfam.org/protein/'+__accession,id:__accession,name:'Pfam'}]
				}
			}
			__pfam[1].push(__f);
			n++;
		});
		d.push( __pfam );
	}
}

function add_elmdb(d){
	var n = 1;
	if( __external_data['elmdb'] && __external_data['elmdb'].length >  0){
		var __elm = ["DOMAINS_AND_SITES",[]];
		var __elm_flag = 1;
		d.forEach(function(i){
			if(i[0]=="DOMAINS_AND_SITES"){
				__elm = i;
				__elm_flag = 0;
			}
		});
		__external_data['elmdb'].forEach(function(i){
			var __description = 'Short linear motif ('+i['description'][0]['Regex']+')';
			var __ext_des = {};
			i['interactions'].forEach(function(j){
				var key = '<b>Interactor:</b> '+j['interactorDomain']+' <b>Domain:</b> '+j['Domain'];
				if(j['StartDomain'] != 'None' && j['StopDomain'] != 'None'){
					key += ' <b>Start:</b> '+j['StartDomain']+' <b>End:</b> '+j['StopDomain']+'<br/>';
				}else{
					key += '<br/>'
				}
				__ext_des[key] = true;
			});
			var __ext = Object.keys(__ext_des);
			if(__ext.length>0)__description = __description+'<br/>'+__ext.join("");
			
			var __f = {begin:i['Start'],end:i['End'],description:__description,internalId:'elm_'+n,type:'region',evidences:
				{
					'ECO:0000311':[{url:'http://elm.eu.org/elms/'+i['ELMIdentifier'],id:i['ELMIdentifier'],name:'ELM DB'}]
				}
			}
			__f['evidences']['ECO:0000269'] = [];
			i['References'].split(" ").forEach(function(j){
				__f['evidences']['ECO:0000269'].push({
					id:j,
					name:'PubMed',url:'http://www.ncbi.nlm.nih.gov/pubmed/'+j,
					alternativeUrl:'http://europepmc.org/abstract/MED/'+j
				});
			});
			__f['type'] = 'LINEAR_MOTIF'
			__elm[1].push(__f);
			n++;
		});
		if( __elm_flag ) d.push( __elm );
	}
}


function add_coverage(d){
	var n = 1;
	if(__external_data['coverage'] && __external_data['coverage']['Structure coverage']){
		var __coverage = ["STRUCTURE_COVERAGE",[]]
		__external_data['coverage']['Structure coverage'].forEach(function(i){
			__coverage[1].push({begin:i['start'],end:i['end'],description:'Sequence segment covered by the structure',internalId:'coverage_'+n,type:'region'});
			n++;
		});
		d.push( __coverage );
	}
}

function add_dsysmap(__d){
	var d = __d[0][1];
	var n = 1;
	if(__external_data['dsysmap']){
		__external_data['dsysmap'].forEach(function(i){
			if( !d[ i['start'] ] ) return;
			var __aux = jQuery.grep(d[ i['start']] ['variants'],function(j){ return(j['alternativeSequence']==i['variation']) });
			var __mut = __aux[0];
			if( __mut ){
                                if(__mut.sourceType=="large_scale_study") __mut["color"] = "#FF0000";
				if(!__mut['association'])__mut['association']=[];
				var __src = __mut['association'];
				var __name = i['disease']['text'];
				__src.push({
					disease:true,
					name:__name,
					xrefs:[{id:__accession,name:'dSysMap DB',url:'http://dsysmap.irbbarcelona.org/results.php?type=proteins&neigh=0&value='+__accession}]
				});
			}
		});
	}
}

function add_biomuta(__d){
	var d = __d[0][1];
	var n = 1;
	if(__external_data['biomuta']){
		__external_data['biomuta'].forEach(function(i){
			if( !d[ i['start'] ] ) return;
			var __aux = jQuery.grep(d[ i['start'] ]['variants'],function(j){ return(j['alternativeSequence']==i['variation']) });
			var __mut = __aux[0];
			if( __mut ){
                                if(__mut.sourceType=="large_scale_study") __mut["color"] = "#FF0000";
				if(!__mut['association'])__mut['association']=[];
				var __src = __mut['association'];
				var __pubmed = i['evidence'][0]['references'][0].substr(7);
				var __name = i['disease'];
				if(i['disease'].indexOf("/")>-1){
					__name = i['disease'].substr(i['disease'].indexOf("/")+2).split(" \[")[0]
				}
				__name = __name.charAt(0).toUpperCase() + __name.slice(1);

				var __polyphen = " - Polyphen: "+i['polyphen'].replace("possibly","probably");

				var __aux = jQuery.grep(__src,function(k){return(k['name']==__name)});
				if(__aux.length==0 && __pubmed.indexOf(';')<0 ) __src.push({
					disease:true,
					name:__name,
					xrefs:[{id:__pubmed,name:'BioMuta DB'+__polyphen,url:'http://www.ncbi.nlm.nih.gov/pubmed/'+__pubmed}]
				});
				if(__mut['association'].length == 0) __mut['association'] = null;
			}else{
                                variants_extended = true;
				var __new_mut = {
					internalId:"bm_"+n,
					type: "VARIANT",
					sourceType:"large_scale_study",
					wildType: i['original'],
					alternativeSequence:i['variation'],
					begin:i['start'],
					end:i['start'],
					association:[],
                                        color:"#FF0000"
				};

				var __src = __new_mut['association'];
				var __pubmed = i['evidence'][0]['references'][0].substr(7);
				var __name = i['disease'];

				if(i['disease'].indexOf("/")>-1){
					__name = i['disease'].substr(i['disease'].indexOf("/")+2).split(" \[")[0]
				}
				__name = __name.charAt(0).toUpperCase() + __name.slice(1);

				var __polyphen = " - Polyphen: "+i['polyphen'].replace("possibly","probably");

				var __aux = jQuery.grep(__src,function(k){return(k['name']==__name)});
				if(__aux.length==0 && __pubmed.indexOf(';')<0 ) __src.push({
					disease:true,
					name:__name,
					xrefs:[{id:__pubmed,name:'BioMuta DB'+__polyphen,url:'http://www.ncbi.nlm.nih.gov/pubmed/'+__pubmed}]
				});
				if( __pubmed.indexOf(';')<0 ) d[ i['start'] ]['variants'].push( __new_mut );
				n++;
			}
		});
	}
}

function rename_structural_features(d){
	if( "structural" in d){
		d['structural']['label'] = "UniProt Secondary Structure Data";
	}
}

function rebuild_ptm(d){
	var __ptm = ["",[]];
	d.forEach(function(i){
			if(i[0]=="PTM"){
				__ptm = i;
			}

	});
	__ptm[1].forEach(function(i){
		var i_t = i['description'].toLowerCase();

		if( i_t.indexOf("methyl")>-1 ){
			i['type'] = 'MOD_RES_MET';

		}else if( i_t.indexOf("acetyl")>-1 ){
			i['type'] = 'MOD_RES_ACE';

		}else if( i_t.indexOf("crotonyl")>-1 ){
			i['type'] = 'MOD_RES_CRO';

		}else if( i_t.indexOf("citrul")>-1 ){
			i['type'] = 'MOD_RES_CIT';

		}else if( i_t.indexOf("phospho")>-1 ){
			i['type'] = 'MOD_RES_PHO';

		}else if( i_t.indexOf("ubiq")>-1 ){
			i['type'] = 'MOD_RES_UBI';

		}else if( i_t.indexOf("sumo")>-1 ){
			i['type'] = 'MOD_RES_SUM';
		}else if( i_t.indexOf("glcnac")>-1 ){
			i['type'] = 'CARBOHYD';
		}
	});
}

function add_mobi(d){
	var n = 1;
	if( __external_data['mobi'] ){
		var __disorder = ["DISORDERED_REGIONS",[]];
                var __flag = false;
		for(var i in __external_data['mobi']){
			var __type = i.toUpperCase();
			__external_data['mobi'][i].forEach(function(j){
				__disorder[1].push({type:__type,begin:j['start'],end:j['end'],description:'Disordered region',internalId:'mobi_'+n,evidences:
					{
						'ECO:0000311':[{url:'http://mobidb.bio.unipd.it/entries/'+__accession, id:__accession, name:'MobyDB'}]
					}
				});
				n++;
                                __flag = true;
			});
		}
		if(__flag) d.push( __disorder );
	}
}

function add_iedb(d){
	var n = 1;
	if(__external_data['iedb']){
		var __epitopes = ["EPITOPES",[]];
		__external_data['iedb'].forEach(function(i){
			__epitopes[1].push({type:'LINEAR_EPITOPE',begin:i['start'],end:i['end'],description:'Linear epitope',internalId:'iedb_'+n,evidences:
				{
					'ECO:0000311':[{url:'http://www.iedb.org/epitope/'+i['evidence'],id:i['evidence'],name:'Immune Epitope DB'}]
				}
			});
			n++;
		});
		d.push( __epitopes );
	}
}

function add_phosphosite(d){
	var n = 1;
	if(__external_data['phosphosite']){
		var __ptm = ["PTM",[]];
		var __sites = ["DOMAINS_AND_SITES",[]];
		var __ptm_flag = 1;
		var __sites_flag = 1;
		d.forEach(function(i){
			if(i[0]=="PTM"){
				__ptm = i;
				__ptm_flag = 0;
			}
			if(i[0]=="DOMAINS_AND_SITES"){
				__sites = i;
				__sites_flag = 0;
			}
		});
		__external_data['phosphosite'].forEach(function(i){
			if( i['subtype'] == "Regulatory site" || i['subtype'] == "Sustrate-Kinase interaction" || i['subtype'] == "Diseases-associated site" ){
				var __aux = i['description'].split(";;");
				var __description = "<b style=\"color:grey;\">"+i['subtype']+"</b> <br>";
				__aux.forEach(function(k){
					var __r = k.split(":");
					if( __r[1] && __r[1].length>1 )__description += "<b style=\"color:grey;\">"+ __r[0]+"</b>: "+__r[1].replace("("," (")+". <br>";
				});
				__description.substring(0, __description.length - 4);
				var __label = 'site';
				if(i['subtype'] == "Sustrate-Kinase interaction"){
					__label = 'BINDING';
				}
				__sites[1].push({begin:i['start'],end:i['end'],description:__description,internalId:'ppsp_'+n,type:__label,evidences:
					{
						'ECO:0000311':[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'PhosphoSitePlus DB'}]
					}
				});
				n++;
			}else{
				var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
				if( __aux.length > 0 ){
					var __flag = null;
					__aux.forEach(function(j){
					        var i_t = i['subtype'].toLowerCase();
					        var j_t = j['description'].toLowerCase();

						if( (i_t == j_t) ||
                                                    (i_t.indexOf("phospho")>-1 && j_t.indexOf("phospho")>-1)||
                                                    (i_t.indexOf("glcnac")>-1 && j_t.indexOf("glcnac")>-1)||
						    (i_t.indexOf("nitros")>-1 && j_t.indexOf("nitros")>-1)||
						    (i_t.indexOf("palmi")>-1 && j_t.indexOf("palmi")>-1)||
						    (i_t.indexOf("methyl")>-1 && j_t.indexOf("methyl")>-1)||
						    (i_t.indexOf("ubiquit")>-1 && j_t.indexOf("ubiquit")>-1)||
						    (i_t.indexOf("acetyl")>-1 && j_t.indexOf("acetyl")>-1)||
                                                    (i_t.indexOf("glyco")>-1 && j_t.indexOf("glcnac")>-1)||
						    ((i_t.indexOf("prenyl")>-1 || i_t.indexOf("farnesyl")>-1) && (j_t.indexOf("prenyl")>-1 || j_t.indexOf("farnesyl")>-1))

                                                  ){
							__flag = j;
						}
					});
					if(__flag){
						var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
                                                if( ! __flag['evidences']) __flag['evidences'] = {};
						if( ! __flag['evidences']['ECO:0000311'] ) __flag['evidences']['ECO:0000311']=[];
						__flag['evidences']['ECO:0000311'].push(
								{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'PhosphoSitePlus DB'}
							);
					}else{
                                                //if(i['subtype'] == "OGlcNAc")i['subtype']="Glycosylation";
						__ptm[1].push({begin:i['start'],end:i['end'],description:i['subtype'],internalId:'ppsp_'+n,type:'MOD_RES',evidences:
							{
								'ECO:0000311':[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'PhosphoSitePlus DB'}]
							}
						});
						n++;
					}
				}else{
					__ptm[1].push({begin:i['start'],end:i['end'],description:i['subtype'],internalId:'ppsp_'+n,type:'MOD_RES',evidences:
						{
							'ECO:0000311':[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'PhosphoSitePlus DB'}]
						}
					});
					n++;
				}
			}
		});
		if(__ptm_flag)d.push( __ptm );
		if(__sites_flag)d.push( __sites );
	}
}

function add_dbptm(d){
	var n = 1;
	if(__external_data['dbptm']){
		var __ptm = ["PTM",[]];
		var __ptm_flag = 1;
		d.forEach(function(i){
			if(i[0]=="PTM"){
				__ptm = i;
				__ptm_flag = 0;
			}
		});
		__external_data['dbptm'].forEach(function(i){
			var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
			if( __aux.length > 0 ){
				var __flag = null;
				__aux.forEach(function(j){
					var i_t = i['type'].toLowerCase();
					var j_t = j['description'].toLowerCase();
					if( 	
						( i_t == j_t ) || 
						( i_t.indexOf("phospho")>-1 && j_t.indexOf("phospho")>-1 ) || 
						( i_t.indexOf("nitros")>-1 && j_t.indexOf("nitros")>-1 ) ||
						( i_t.indexOf("palmi")>-1 && j_t.indexOf("palmi")>-1 ) ||
						( i_t.indexOf("methyl")>-1 && j_t.indexOf("methyl")>-1 ) ||
						( i_t.indexOf("ubiquit")>-1 && j_t.indexOf("ubiquit")>-1 ) ||
						( i_t.indexOf("acetyl")>-1 && j_t.indexOf("acetyl")>-1 ) ||
                                                ( i_t.indexOf("glyco")>-1 && j_t.indexOf("glcnac")>-1 ) ||
						( (i_t.indexOf("prenyl")>-1 || i_t.indexOf("farnesyl")>-1) && (j_t.indexOf("prenyl")>-1 || j_t.indexOf("farnesyl")>-1) )
					){
						__flag = j;
					}
				});
				if(__flag){
					var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
                                        if( ! __flag['evidences'] ) __flag['evidences']={};
					if( ! __flag['evidences']['ECO:0000269'] ) __flag['evidences']['ECO:0000269']=[];
					var __evs = __flag['evidences']['ECO:0000269'];
					var pubmed_ids = i['evidences'].split(";");
					pubmed_ids.forEach(function(ii){
						var __ids =  jQuery.grep(__evs,function(e){ return ( ii == e['id'] ); });
						if(__ids.length == 0) __evs.push({
							id:ii,
							name:'PubMed',
							url:'http://www.ncbi.nlm.nih.gov/pubmed/'+ii,
							alternativeUrl:'http://europepmc.org/abstract/MED/'+ii
						});
					});
				}else{
					var __d = {
						begin:i['start'],
						end:i['end'],
						description:i['type'],
						internalId:'dbptm_'+n,
						type:'MOD_RES',
						evidences:{
							'ECO:0000269':[]
						}
					};
					var __evs = __d['evidences']['ECO:0000269'];
					var pubmed_ids = i['evidences'].split(";");
					pubmed_ids.forEach(function(ii){
						var __ids =  jQuery.grep(__evs,function(e){ return ( ii == e['id'] ); });
						if(__ids.length == 0) {
                                                  __d['evidences']['ECO:0000269'].push({
								id:i['evidences'],
								name:'PubMed',
								url:'http://www.ncbi.nlm.nih.gov/pubmed/'+i['evidences'],
								alternativeUrl:'http://europepmc.org/abstract/MED/'+i['evidences']
						  });
                                                }
					});
					__ptm[1].push(
						__d
					);
					n++;
				}
			}else{
				var __d = {
					begin:i['start'],
					end:i['end'],
					description:i['type'],
					internalId:'dbptm_'+n,
					type:'MOD_RES',
					evidences:{
						'ECO:0000269':[]
					}
				};
				var __evs = __d['evidences']['ECO:0000269'];
				var pubmed_ids = i['evidences'].split(";");
				pubmed_ids.forEach(function(ii){
					var __ids =  jQuery.grep(__evs,function(e){ return ( ii == e['id'] ); });
					if(__ids.length == 0) __d['evidences']['ECO:0000269'].push({
							id:i['evidences'],
							name:'PubMed',
							url:'http://www.ncbi.nlm.nih.gov/pubmed/'+i['evidences'],
							alternativeUrl:'http://europepmc.org/abstract/MED/'+i['evidences']
					});
				});
				__ptm[1].push(
					__d
				);
				n++;
			}
		});
		if(__ptm_flag)d.push( __ptm );
	}
}

function add_highlight(d){
	var __fake= ['__fake',[{
				'begin':1,
				'end':1,
				'internalId':'fake_0',
				'type': 'region'
		}]];
	d.push(__fake);
}
function setup_highlight(fv){
	fv.__highlight = function(e){
		if (fv.selectedFeature){
			if(fv.selectedFeature.internalId == "fake_0"){
				var fake_click = new MouseEvent("click");
				if( document.getElementsByName("fake_0").lentgh>0){
					document.getElementsByName("fake_0")[0].dispatchEvent(fake_click);
				}else{
					jQuery("[name=fake_0]").get(0).dispatchEvent(fake_click);
				}
			}
		}
		fv.data.forEach(function(i){
			if(i[0]=="__fake"){
				i[1][0]['begin']=e['begin'];
				i[1][0]['end']=e['end'];
			}
		});
		var fake_click = new MouseEvent("click");
		if( document.getElementsByName("fake_0").lentgh>0){
			document.getElementsByName("fake_0")[0].dispatchEvent(fake_click);
		}else{
			jQuery("[name=fake_0]").get(0).dispatchEvent(fake_click);
		}

	}
	fv.getDispatcher().on("ready", function() {
		__hide_fake();
		__add_tooltip_yoverflow();
                fv.data.forEach(function(i){
                  if(i[0]=="INTERACTING_RESIDUES"){
                    IRD = i[1];
                  }else if(i[0]=="RESIDUE_ASA"){
                    ASA = i[1];
                  }
                });
                $j('#loading').css('display','none');
                variant_menu();
	});
}

function __hide_fake(){
	var aTags = document.getElementsByTagName("a");
	var searchText = "__fake";
	var found;
	for (var i=0;i<aTags.length;i++) {
  		if (aTags[i].title == searchText) {
    			found = aTags[i];
    			break;
  		}
	}
	if( found != undefined ) found.parentNode.style.display = "none";
	var classDOM = document.getElementsByClassName("up_pftv_buttons");
	var observer = new MutationObserver(__hide_eye);
	observer.observe(classDOM[0],{childList:true});
}

function __hide_eye(a,b,c) {
	var aTags = a[0]['target'].getElementsByTagName("label");
	var searchText = "__fake";
	var found;
	for (var i=0;i<aTags.length;i++) {
  		if (aTags[i].innerHTML == searchText) {
    			found = aTags[i];
    			break;
  		}
	}
	if( found != undefined ) found.parentNode.style.display = "none";
}

function __add_tooltip_yoverflow(){
	var classDOM = document.getElementsByClassName("up_pftv_category-viewer");
	var observer = new MutationObserver(__tooltip_yoverflow);
	for(var i=0;i<classDOM.length;i++){
		observer.observe(classDOM[i],{childList:true});
	}
	var classDOM = document.getElementsByClassName("up_pftv_track");
	var observer = new MutationObserver(__tooltip_yoverflow);
	for(var i=0;i<classDOM.length;i++){
		observer.observe(classDOM[i],{childList:true});
	}
}

function __tooltip_yoverflow(){
	var __e = document.getElementsByClassName("up_pftv_tooltip-container");
	if( __e && __e[0]){
		var __left = parseInt(__e[0].style.left.substring(0, __e[0].style.left.length - 2));
		if(__left > 300)__e[0].style.left = 300;
	}
        var h = $j(".up_pftv_tooltip-container").css('top');
        if(typeof h == "undefined")return;
        h = parseInt(h.substring(0, h.length - 2));
        var x = h;
        h += $j(".up_pftv_tooltip-container").parent().offset().top;
        h += $j(".up_pftv_tooltip-container").height();
        var  d = h - $j(window).scrollTop() - $j(window).height() +150;
        if(d>0){
          d += 10;
          x -= d;
          $j(".up_pftv_tooltip-container").css('top',x.toString()+'px');
        }
}

function __test(){
	var __e = document.getElementsByClassName("up_pftv_tooltip-container");
}

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
