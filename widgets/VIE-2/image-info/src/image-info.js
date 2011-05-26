function notSupported (msg) {
    $('#content').hide();
    $('#warning').html(msg);
    $('#warning').show();
}
            
$(function () {

   if (!navigator.vendor.match(/apple/i)) {
        var warnMsg = "<h2>Sorry, your browser and/or version is currently not supported!</h2>";
        warnMsg += "<h3>This demo is highly dependent of CSS3 features. Hence, it needs browsers that support these features. ";
        warnMsg += "Of course, we are working on backwards-compatibility and try to make this app accessible for more browser. ";
        warnMsg += "However, in the meantime, you could consider updating to one of the following browser(s):</h3>";
        warnMsg += "<table>";
        warnMsg += "<tr><td><a target=\"_blank\" href=\"http://www.apple.com/safari/download/\"><img src=\"images/safari-logo.png\" /></a></td><td><a target=\"_blank\" href=\"http://www.apple.com/safari/download/\">Apple Safari</a></td></tr>";
        warnMsg += "</table>";
        
        notSupported (warnMsg);
    }
});

$(window).load(function () {    
    
    VIE2.connectors['dbpedia'].options({
        "proxy_url" : "../../../../utils/proxy/proxy.php"
    });
    
    $('img[about]').vie2().vie2('analyze', function () {
	    enhanceImg.call($(this));
    }, {connectors: ['rdfa']});
        
});

function enhanceImg () {

    var uris = this.vie2('option', 'entities');
    var model = VIE.EntityManager.getBySubject(uris[0].toString());
    var imgMetadata = $('<table style="width:100%;font-size:60%;">');
    this.flippable();
    this.flippable('fillMetadata', imgMetadata);
    
    var v = new SkyscraperMetadataView({el : imgMetadata, model : model});
    
    return this;
};

var SkyscraperMetadataView = Backbone.View.extend ({
    
    initialize : function () {
         _.bindAll(this, "render");
         
        this.model.bind('change', this.render);
    },
    
    render : function () {
    console.log("REEEEEEEEEEEEEENDER!");
        var that = this;
        var model = this.model;
        this.el.empty();
        
        
        var names = model.get('foaf:name');
        if (names.size() === 0) {
            names = model.get('rdfs:label');
        }
        
        if (names.size() > 0) {
            for (var i = 0; i < names.size(); i++) {
                if (names.at(i).lang() === 'en') {
                    var name = names.at(i).value().replace(/"/g, "").replace(/\^\^.*/, "").replace(/@.*/, "");
                }
            }
            var nameRow = $('<tr>').appendTo($(this.el));
            $('<th colspan="2" style="text-align:center;"><h2 style="padding:0;margin:0;">' + name + '</h2></td>').appendTo(nameRow);
            }
         
        var architects = model.get('dbprop:architect');
        if (architects.size() > 0) {
            var architect = architects.at(0).value().replace(/"/g, "").replace(/\^\^.*/, "").replace(/@.*/, "");
            var archRow = $('<tr>').appendTo($(this.el));
            $('<td>Architect</td>').appendTo(archRow);
            $('<td>' + architect + '</td>').appendTo(archRow);
        }
        
        var floorCounts = model.get('dbprop:floorCount');
        if (floorCounts.size() > 0) {
            var floorCount = floorCounts.at(0).value();
            var fcRow = $('<tr>').appendTo($(this.el));
            $('<td>Floors</td>').appendTo(fcRow);
            $('<td>' + floorCount + '</td>').appendTo(fcRow);
        }
        
        var elevatorCounts = model.get('dbprop:elevatorCount');
        if (elevatorCounts.size() > 0) {
            var elevatorCount = elevatorCounts.at(0).value();
            var ecRow = $('<tr>').appendTo($(this.el));
            $('<td>Elevators</td>').appendTo(ecRow);
            $('<td>' + elevatorCount + '</td>').appendTo(ecRow);
        }
        
        var openingDates = model.get('dbonto:openingDate');
        if (openingDates.size() > 0) {
            var openingDate = openingDates.at(0).value();
            var odRow = $('<tr>').appendTo($(this.el));
            $('<td>Opened</td>').appendTo(odRow);
            $('<td>' + openingDate + '</td>').appendTo(odRow);
        }
        
        var links = model.get('foaf:page');
        if (links.size() > 0) {
            var link = links.at(0).value();
            var linkRow = $('<tr>').appendTo($(this.el));
            
            var linkAnchor = $('<a target="_blank" href="' + model.get('foaf:page')[0].replace(/</g, '').replace(/>/g, '') + '" >Link to Wikipedia</a>').click(function(ev){
				ev.stopPropagation();
			});
			var url = $('<td colspan="2" style="width:100%;"></td>').append(linkAnchor).appendTo(linkRow);
        }
        
        var lats = model.get('geo:lat');
        if (lats.size() > 0) {
            var lat = lats.at(0).value();
        } else {
            var lat = undefined;
        }
        
        var lons = model.get('geo:long');
        if (lons.size() > 0) {
            var lon = lons.at(0).value();
        } else {
            var lon = undefined;
        }
        
		if (lat && lon) {
			var gmapsrow = $('<tr>').appendTo($(that.el));
			var gmap = $('<td colspan="2" style="width:100%; height:200px;"></td>').appendTo(gmapsrow);

			//to avoid unwanted flipping!
			gmap.click(function(ev){
				ev.stopPropagation();
			});
            
			var myLatlng = new google.maps.LatLng(lat, lon);
			var myOptions = {
					zoom: 15,
					center: myLatlng,
					mapTypeId: google.maps.MapTypeId.HYBRID
			};
			var map = new google.maps.Map(gmap[0], myOptions);

			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lon),
				map: map,
				title: (name)? name : ''
			});
		}
    }
});

