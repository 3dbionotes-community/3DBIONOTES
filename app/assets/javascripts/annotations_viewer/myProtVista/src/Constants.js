/*jslint node: true */
/*jshint laxbreak: true */
"use strict";

var _ = require('underscore');
var Config = require('./config.json');

var visualizationTypes = {
    basic: 'basic',
    variant: 'variant',
    continuous: 'continuous'
};
var uniprotSource = 'uniprot';
var uniprotSources = [
    {
        url: '/api/annotations/EBI/features/',
        source: uniprotSource,
        category: 'FEATURES'
    },
    {
        url: '/api/annotations/EBI/proteomics/',
        source: uniprotSource,
        category: 'PROTEOMICS'
    },
    {
        url: '/api/annotations/EBI/variation/',
        source: uniprotSource,
        category: 'VARIATION'
    },
    {
        url: '/api/annotations/EBI/antigen/',
        source: uniprotSource,
        category: 'ANTIGEN'
    }
];
var otherSources = [
    {
        url: '/ws/lrs/features/variants/Genomic_Variants_CNCB/{ID}/',
        source:'CNCB',
        category: 'VARIATION',
        replace: true
    }
];
var allSources = [].concat(uniprotSources, otherSources);
var externalSource;
var allCategories = Config.categories;
var allTrackNames = Config.trackNames;
var downloadFormats = [{text: 'JSON', type: 'json', all: true}, {text: 'XML', type: 'xml', all: false},
    {text: 'GFF', type: 'gff', all: false}];
var consequenceTypes = [];

var Constants = function() {
  return {
    extend_categories: function(){
      extend_categories( allCategories );
    },
    getBlastURL: function() {
        return 'http://www.uniprot.org/blast/?about=';
    },
    getNoBlastTypes: function() {
      return ['helix', 'strand', 'turn', 'disulfid', 'crosslnk', 'variant'];
    },
    getVisualizationTypes: function() {
        return visualizationTypes;
    },
    getDownloadFormats: function() {
        return downloadFormats;
    },
    getDataSources: function() {
      return allSources;
    },
    getUniProtDataSources: function() {
      return uniprotSources;
    },
    getExternalDataSource: function() {
      return externalSource;
    },
    getUniProtSource: function() {
      return uniprotSource;
    },
    addSource: function(source) {
        allSources.push(source);
        externalSource = source;
    },
    addConsequenceType: function(consequence) {
        consequenceTypes.push(consequence);
    },
    getConsequenceTypes: function() {
        return _.uniq(consequenceTypes);
    },
    clearDataSources: function() {
        allSources = [];
    },
    getCategoryNamesInOrder: function() {
        return allCategories;
    },
    setCategoryNamesInOrder: function(categories) {
        allCategories = categories;
    },
    setOrderForCategoryNames: function(categoryNames) {
        var orderedCategories = [];
        _.each(categoryNames, function(name) {
            var position = 0;
            var category = _.find(allCategories, function(cat, index) {
                position = index;
                return cat.name.toUpperCase() === name.toUpperCase();
            });
            if (category) {
                orderedCategories.push(category);
                allCategories.splice(position, 1);
            }
        });
        allCategories = orderedCategories.concat(allCategories);
    },
    convertNameToLabel: function(name) {
        var label = name.replace(/_/g, ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
        return label;
    },
    getCategoryInfo: function(categoryName) {
        var exist = _.find(allCategories, function(cat) {
            return cat.name === categoryName;
        });
        return exist ? exist
            : {name: categoryName, label: Constants.convertNameToLabel(categoryName),
            visualizationType: Constants.getVisualizationTypes().basic};
    },
    addCategories: function(categories) {
        var index = 0;
        _.each(categories, function (newCat) {
            var exist = _.find(allCategories, function(cat) {
                return cat.name === newCat.name;
            });
            if (exist) {
                exist.label = newCat.label;
                exist.visualizationType = newCat.visualizationType;
            } else {
                allCategories.splice(index, 0, newCat);
                index++;
            }
        });
    },
    getTrackNames: function() {
      return allTrackNames;
    },
    setTrackNames: function(trackNames) {
        allTrackNames = trackNames;
    },
    addTrackTypes: function(tracksToAdd) {
        _.each(tracksToAdd, function(elem, key) {
            key = key.toLowerCase();
            allTrackNames[key] = elem;
        });
    },
    getTrackInfo: function(trackName) {
        var name = trackName.toLowerCase();
        return this.getTrackNames()[name] ? this.getTrackNames()[name]
            : {label: Constants.convertNameToLabel(name), tooltip:''};
    }
  };
}();

module.exports = Constants;
