// File:   place.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Mapping(
    'skyscraper',  //the id of the mapping 
    ['dbonto:Skyscraper'],  //a list of all types that fall into this category
    ['rdfs:label', 'foaf:page', 'dbprop:architect', 'dbonto:floorCount', 'dbprop:elevatorCount', 'foaf:depiction', 'dbonto:openingDate', 'geo:lat', 'geo:long'], //a list of default properties
    {// optional options
        namespaces: { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
            'rdfs'       : 'http://www.w3.org/2000/01/rdf-schema#',
            'foaf'       : 'http://xmlns.com/foaf/0.1/',
            'dbonto'     : 'http://dbpedia.org/ontology/',
            'dbonto'     : 'http://dbpedia.org/property/',
            'geo'        : 'http://www.w3.org/2003/01/geo/wgs84_pos#'
        }
    }
);