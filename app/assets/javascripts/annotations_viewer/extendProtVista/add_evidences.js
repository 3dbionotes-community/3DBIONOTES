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
