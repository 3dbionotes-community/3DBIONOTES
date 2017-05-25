require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var add_asa_residues = function (d){
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
        asa_res[1][ parseInt(i[0]) ].variants = [{ color:color, 
                                                   alternativeSequence:'', 
                                                   type:'measure', 
                                                   begin: i[0], 
                                                   end: i[0], 
                                                   score:i[1], 
                                                   internalId:'asa_'+n, 
                                                   description:'<b style=\"color:grey;\">Accessible surface area</b><br/>Residue accesibility '+i[1]+'&#197<sup>2</sup>' 
        }];
        n++;
      });
      d.push( asa_res );
    }
  }
};

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

module.exports = add_asa_residues;

},{}],2:[function(require,module,exports){
"use strict";

var n_model = 1;

var add_binding_residues = function(d){
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
};

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

module.exports = add_binding_residues;

},{}],3:[function(require,module,exports){
"use strict";

var add_biomuta  =  function(__d){
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
};

module.exports = add_biomuta;

},{}],4:[function(require,module,exports){
"use strict";

var add_coverage = function(d){
	var n = 1;
	if(__external_data['coverage'] && __external_data['coverage']['Structure coverage']){
		var __coverage = ["STRUCTURE_COVERAGE",[]]
		__external_data['coverage']['Structure coverage'].forEach(function(i){
			__coverage[1].push({begin:i['start'],end:i['end'],description:'Sequence segment covered by the structure',internalId:'coverage_'+n,type:'region'});
			n++;
		});
		d.push( __coverage );
	}
};

module.exports = add_coverage;

},{}],5:[function(require,module,exports){
"use strict";

var add_dbptm  =  function(d){
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
};

module.exports = add_dbptm;


},{}],6:[function(require,module,exports){
"use strict";

var add_dsysmap = function (__d){
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
};

module.exports = add_dsysmap;

},{}],7:[function(require,module,exports){
"use strict;"

var add_elmdb = function(d){
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
					"Imported information":[{url:'http://elm.eu.org/elms/'+i['ELMIdentifier'],id:i['ELMIdentifier'],name:'Imported from ELM'}]
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
};

module.exports = add_elmdb;

},{}],8:[function(require,module,exports){
"use strict";

var uniprot_link = {
  'DOMAINS_AND_SITES':'family_and_domains',
  'MOLECULE_PROCESSING':'ptm_processing',
  'DOMAIN':'domainsAnno_section',
  'REGION':'Region_section',
  'BINDING':'sitesAnno_section',
  'CHAIN':'peptides_section',
  'CARBOHYD':'aaMod_section',
  'DISULFID':'aaMod_section',
  'CONFLICT':'Sequence_conflict_section'
};

var add_evidences = function(d){
  d.forEach(function(i){
    i[1].forEach(function(j){
      if( !('evidences' in j) ){
        j['evidences'] =  {"Imported information":[{url:'http://www.uniprot.org/uniprot/'+__accession+'#'+uniprot_link[ j['type'] ],id:__accession,name:'Imported from UniProt'}]};
      }else{
        for(var k in j['evidences']){
          j['evidences'][k].forEach(function(l){
             if( l == undefined ){
               console.log(j['type']);
               j['evidences'][k] = [{url:'http://www.uniprot.org/uniprot/'+__accession+'#'+uniprot_link[ j['type'] ],id:__accession,name:'Imported from UniProt'}];
             }
          });
        }
      }
    });
  });
};

module.exports = add_evidences;

},{}],9:[function(require,module,exports){
"use strict";

var add_iedb = function(d){
	var n = 1;
	if(__external_data['iedb']){
		var __epitopes = ["EPITOPES",[]];
		__external_data['iedb'].forEach(function(i){
			__epitopes[1].push({type:'LINEAR_EPITOPE',begin:i['start'],end:i['end'],description:'Linear epitope',internalId:'iedb_'+n,evidences:
				{
					"Imported information":[{url:'http://www.iedb.org/epitope/'+i['evidence'],id:i['evidence'],name:'Imported from IEDB'}]
				}
			});
			n++;
		});
		d.push( __epitopes );
	}
};

module.exports =  add_iedb;


},{}],10:[function(require,module,exports){
"use strict";

var add_interpro = function (d){
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
					"Imported information":[{url:'https://www.ebi.ac.uk/interpro/protein/'+__accession,id:__accession,name:'Imported from InterPro'}]
				}
			}
			__interpro[1].push(__f);
			n++;
		});
		if( __interpro_flag ) d.push( __interpro );
	}
};


module.exports = add_interpro;

},{}],11:[function(require,module,exports){
"use strict";

var add_mobi =  function(d){
	var n = 1;
	if( __external_data['mobi'] ){
		var __disorder = ["DISORDERED_REGIONS",[]];
                var __flag = false;
		for(var i in __external_data['mobi']){
			var __type = i.toUpperCase();
			__external_data['mobi'][i].forEach(function(j){
				__disorder[1].push({type:__type,begin:j['start'],end:j['end'],description:'Disordered region',internalId:'mobi_'+n,evidences:
					{
						"Imported information":[{url:'http://mobidb.bio.unipd.it/entries/'+__accession, id:__accession, name:'Imported from MobyDB'}]
					}
				});
				n++;
                                __flag = true;
			});
		}
		if(__flag) d.push( __disorder );
	}
};

module.exports = add_mobi;

},{}],12:[function(require,module,exports){
"use strict";

var add_pfam = function(d){
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
					"Imported information":[{url:'http://pfam.xfam.org/protein/'+__accession,id:__accession,name:'Imported from Pfam'}]
				}
			}
			__pfam[1].push(__f);
			n++;
		});
		d.push( __pfam );
	}
};

module.exports = add_pfam;

},{}],13:[function(require,module,exports){
"use strict";

var add_phosphosite = function(d){
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
						"Imported information":[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}]
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
						if( ! __flag['evidences']["Imported information"] ) __flag['evidences']["Imported information"]=[];
						__flag['evidences']["Imported information"].push(
								{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}
							);
					}else{
						__ptm[1].push({begin:i['start'],end:i['end'],description:i['subtype'],internalId:'ppsp_'+n,type:'MOD_RES',evidences:
							{
								"Imported information":[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}]
							}
						});
						n++;
					}
				}else{
					__ptm[1].push({begin:i['start'],end:i['end'],description:i['subtype'],internalId:'ppsp_'+n,type:'MOD_RES',evidences:
						{
							"Imported information":[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}]
						}
					});
					n++;
				}
			}
		});
		if(__ptm_flag)d.push( __ptm );
		if(__sites_flag)d.push( __sites );
	}
};

module.exports = add_phosphosite;

},{}],14:[function(require,module,exports){
"use strict";

var add_smart = function(d){
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
					"Imported information":[{url:'http://smart.embl.de/smart/batch.pl?INCLUDE_SIGNALP=1&IDS='+__accession,id:__accession,name:'Imported from SMART'}]
				}
			}
			__smart[1].push(__f);
			n++;
		});
		if( __smart_flag ) d.push( __smart );
	}
};

module.exports = add_smart;

},{}],15:[function(require,module,exports){
"use strict";

var continuous_data = require("./continuous_data");

var uploaded_data = null;
if(top.upload_flag && !imported_flag){
  uploaded_data = true;
}

var add_uploaded_data = function(d){
  if(uploaded_data){
    prepare_uploaded_data();
    $j.each(uploaded_data,function( track_name, data ) {
      d.push( [track_name,data] );
    });
  }
};

function prepare_uploaded_data(){
  var PDBchain = __alignment.pdb+":"+__alignment.chain;
  PDBchain = PDBchain.replace("_dot_",".");
  var uniprot = __alignment.uniprot;
  uploaded_data = {};

  var aux = [ ["PDBchain",PDBchain], ["acc",uniprot]  ];

  aux.forEach(function( i ){
    if( top.$UPLOADED_DATA[ i[0] ][ i[1] ] ){
      $j.each( top.$UPLOADED_DATA[ i[0] ][ i[1] ], function( track_name, info ) {
        if(info.visualization_type=="continuous"){
          uploaded_data[ track_name ] = continuous_data(info.data);
        }else{
          if(!uploaded_data[track_name]){
            uploaded_data[track_name] = info.data;
          }else{
            uploaded_data[track_name] = uploaded_data[track_name].concat( info.data );
          }
        }
      });
    }
  });
} 

module.exports = { add_uploaded_data:add_uploaded_data, uploaded_data:uploaded_data };

},{"./continuous_data":17}],16:[function(require,module,exports){
"use strict";

var variant_menu = function (){
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
};

var update_diseases = function(){
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
};

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

var add_disease_menu = function(__d){
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
};

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

module.exports = { variant_menu:variant_menu, update_diseases:update_diseases, add_disease_menu:add_disease_menu };

},{}],17:[function(require,module,exports){
"use strict";

var continuous_data = function (d){
    var out = [];
    var n = 1;
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      out.push(__f);
      n++;     
    }
    var n = 0;
    d.forEach(function(i){
      var r = i.value;
      if(r>255)r=255;
      var b = 255-r;
      if(b<0)b = 0;
      var color = 'rgb('+r+',0,'+b+')';
      out[ i.begin ].variants = [{color:color, alternativeSequence:'', type:'measure', begin: i.begin, end:i.begin, score:i.value, internalId:'test_'+n, description:'' }];
      n++;
    });
    return out;
};

module.exports = continuous_data;

},{}],18:[function(require,module,exports){
"use strict";

var extend_categories = function(categories){
  var PDBchain = __alignment.pdb+":"+__alignment.chain;
  PDBchain = PDBchain.replace("_dot_",".");
  var uniprot = __alignment.uniprot;
   if(uploaded_data){
     var aux = [ ["PDBchain",PDBchain], ["acc",uniprot]  ];
     aux.forEach(function( i ){
       if( top.$UPLOADED_DATA[ i[0] ][ i[1] ] ){
         $j.each( top.$UPLOADED_DATA[ i[0] ][ i[1] ], function( track_name, info ) {
           if(info.visualization_type=="continuous") categories.unshift({name:track_name, label:track_name, visualizationType:"continuous"});
         });
       }
     });
  } 
};

module.exports = extend_categories;

},{}],19:[function(require,module,exports){
"use strict";

var $EXTERNAL_DATA = null;

if(top.$EXTERNAL_DATA && !imported_flag){
  $EXTERNAL_DATA = top.$EXTERNAL_DATA;
}else if(top.$IMPORTED_DATA && imported_flag){
  $EXTERNAL_DATA = top.$IMPORTED_DATA;
}else{
  $EXTERNAL_DATA = {'PDBchain':{},'acc':{}};
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

function get_external_data( URL, d ){
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
      var key = __alignment.pdb+":"+__alignment.chain;
      if(imported_flag)key += ":"+__accession;
      $EXTERNAL_DATA['PDBchain'][ key ] = d;
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
        var key = __alignment.pdb+":"+__alignment.chain;
        if(imported_flag)key += ":"+__accession;
        $EXTERNAL_DATA['PDBchain'][ key ] = d;
        build_ProtVista();
        return;
      }
    });
  }
}

var get_all_external_soruces = function(){
  var acc = __accession;
  var key = __alignment.pdb+":"+__alignment.chain;
  if(imported_flag)key += ":"+acc
  if( $EXTERNAL_DATA && key in $EXTERNAL_DATA['PDBchain'] ){
    __external_data = $EXTERNAL_DATA['PDBchain'][ key ];
    clear_wm();
    build_ProtVista();
  }else{
    var __allURL = allURL.slice(0);
    get_external_data(__allURL, __external_data);
  }
};

module.exports = get_all_external_soruces;

},{}],20:[function(require,module,exports){
"use strict";

var add_highlight = function(d){
	var __fake= ['__fake',[{
				'begin':1,
				'end':1,
				'internalId':'fake_0',
				'type': 'region'
		}]];
	d.push(__fake);
};

var setup_highlight  =  function(fv){
        fv.ready_flag = true;

	fv.__highlight = function(e){
		var fake_click = new MouseEvent("click");
		if (fv.selectedFeature && fv.selectedFeature.internalId == "fake_0"){
			if( document.getElementsByName("fake_0").lentgh>0){
				document.getElementsByName("fake_0")[0].dispatchEvent(fake_click);
			}else if( jQuery("[name=fake_0]").get(0) ){
				jQuery("[name=fake_0]").get(0).dispatchEvent(fake_click);
			}
		}
		fv.data.forEach(function(i){
			if(i[0]=="__fake"){
				i[1][0]['begin']=e['begin'];
				i[1][0]['end']=e['end'];
			}
		});
		if( document.getElementsByName("fake_0").lentgh>0){
			document.getElementsByName("fake_0")[0].dispatchEvent(fake_click);
                        document.getElementsByName("fake_0")[0].style.fill = e['color'];
		}else if( jQuery("[name=fake_0]").get(0) ){
                        $j("[name=fake_0]").css("fill",e['color']);
			$j("[name=fake_0]").get(0).dispatchEvent(fake_click);
		}

	}

	fv.getDispatcher().on("ready", function(o) {
		__hide_fake();
		__add_tooltip_yoverflow();
                $j(".up_pftv_icon-reset").click(function(){
                  trigger_aa_cleared();
                });
                fv.data.forEach(function(i){
                  if(i[0]=="INTERACTING_RESIDUES"){
                    IRD = i[1];
                  }else if(i[0]=="RESIDUE_ASA"){
                    ASA = i[1];
                  }
                });
                $j('#loading').css('display','none');
                variant_menu();
                if(fv.n_source == 4 && fv.ready_flag){
                  fv.ready_flag = false;
		  setTimeout(function(){ check_global_selection(); }, 300);
                }
	});
};

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

module.exports = {add_highlight:add_highlight, setup_highlight:setup_highlight};

},{}],21:[function(require,module,exports){
"use strict";

var max_zoom = function (fv){
	fv.maxZoomSize = 59;
};

module.exports = max_zoom;


},{}],22:[function(require,module,exports){
"use strict";

var rebuild_ptm = function(d){
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
};

module.exports = rebuild_ptm;


},{}],23:[function(require,module,exports){
"use strict";

var rename_structural_features = function(d){
	if( "structural" in d){
		d['structural']['label'] = "UniProt Secondary Structure Data";
	}
};

module.exports = rename_structural_features;

},{}],"extendProtVista":[function(require,module,exports){
"use strict";

var max_zoom = require('./max_zoom');
var extend_categories = require('./extend_categories');
var __add_uploaded_data = require('./add_uploaded_data');
var add_uploaded_data = __add_uploaded_data.add_uploaded_data;
var uploaded_data = __add_uploaded_data.uploaded_data;
var get_all_external_soruces = require('./get_all_external_soruces');
var build_variant_menu = require('./build_variant_menu');
var variant_menu = build_variant_menu.variant_menu;
var update_diseases = build_variant_menu.update_diseases;
var add_disease_menu = build_variant_menu.add_disease_menu;
var add_evidences = require('./add_evidences');
var add_asa_residues = require('./add_asa_residues');
var add_binding_residues = require('./add_binding_residues');
var add_interpro = require('./add_interpro');
var add_smart = require('./add_smart');
var add_pfam = require('./add_pfam');
var add_elmdb = require('./add_elmdb');
var add_coverage = require('./add_coverage');
var add_dsysmap = require('./add_dsysmap');
var add_biomuta = require('./add_biomuta');
var rename_structural_features = require('./rename_structural_features');
var rebuild_ptm = require('./rebuild_ptm');
var add_mobi = require('./add_mobi');
var add_iedb = require('./add_iedb');
var add_phosphosite = require('./add_phosphosite');
var add_dbptm = require('./add_dbptm');
var highlight = require('./highlight');
var add_highlight = highlight.add_highlight;
var setup_highlight = highlight.setup_highlight;

var upgrade_fv = function(fv){
	max_zoom(fv);
	setup_highlight(fv);
        feature_viewer = fv;
};

var extend_features =  function(features){
        features_extended = true;
	add_evidences(features);
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
        add_uploaded_data(features);
	add_highlight(features);
};

var extend_variants = function(features){
	add_biomuta(features);
	add_dsysmap(features);
        add_disease_menu(features);
};

module.exports = { 
                   upgrade_fv:upgrade_fv, 
                   extend_features:extend_features, 
                   extend_variants:extend_variants, 
                   get_all_external_soruces:get_all_external_soruces,
                   variant_menu:variant_menu,
                   update_diseases:update_diseases,
                   extend_categories:extend_categories,
                   add_disease_menu:add_disease_menu,
                   uploaded_data:uploaded_data
};

},{"./add_asa_residues":1,"./add_binding_residues":2,"./add_biomuta":3,"./add_coverage":4,"./add_dbptm":5,"./add_dsysmap":6,"./add_elmdb":7,"./add_evidences":8,"./add_iedb":9,"./add_interpro":10,"./add_mobi":11,"./add_pfam":12,"./add_phosphosite":13,"./add_smart":14,"./add_uploaded_data":15,"./build_variant_menu":16,"./extend_categories":18,"./get_all_external_soruces":19,"./highlight":20,"./max_zoom":21,"./rebuild_ptm":22,"./rename_structural_features":23}]},{},[]);
