"use strict";

var uniprot_link = {
  'DOMAINS_AND_SITES':'family_and_domains',
  'MOLECULE_PROCESSING':'ptm_processing',
  'DOMAIN':'domainsAnno_section',
  'REGION':'Region_section',
  'BINDING':'sitesAnno_section',
  'PROPEP':'peptides_section',
  'CHAIN':'peptides_section',
  'CARBOHYD':'aaMod_section',
  'DISULFID':'aaMod_section',
  'MOD_RES':'aaMod_section',
  'CROSSLNK':'aaMod_section',
  'LIPID':'aaMod_section',
  'CONFLICT':'Sequence_conflict_section',
  'NP_BIND':'regionAnno_section',
  'MOTIF':'Motif_section',
  'REPEAT':'domainsAnno_section',
  'METAL':'sitesAnno_section',
  'DNA_BIND':'regionAnno_section',
  'SITE':'Site_section',
  'SIGNAL':'sitesAnno_section',
  'ACT_SITE':'sitesAnno_section'
};

var add_evidences = function(d){
  d.forEach(function(i){
    i[1].forEach(function(j){
      if( !('evidences' in j) ){
        //console.log( j['type']+"=>"+uniprot_link[ j['type'] ]);
        j['evidences'] =  {"Imported information":[{url:'http://www.uniprot.org/uniprot/'+__accession+'#'+uniprot_link[ j['type'] ],id:__accession,name:'Imported from UniProt'}]};
      }else{
        for(var k in j['evidences']){
          j['evidences'][k].forEach(function(l){
             //console.log( j['type']+"=>"+uniprot_link[ j['type'] ]);
             if( l == undefined ){
               j['evidences'][k] = [{url:'http://www.uniprot.org/uniprot/'+__accession+'#'+uniprot_link[ j['type'] ],id:__accession,name:'Imported from UniProt'}];
             }
          });
        }
      }
    });
  });
};

module.exports = add_evidences;
