// VIE Widgets - Vienna IKS Editable Widgets
// (c) 2011 Sebastian Germesin, IKS Consortium
// VIE Widgets may be freely distributed under the MIT license.
// (see LICENSE)

(function($, undefined) {
    $.widget('view.vieImageSearch', {
        
        _create: function () {
            var self = this;
        },
        
        _init: function () {
            this.triggerSearch(this.options.entity);
        },
        
        _render: function (data) {
            var self = this;
            var photos = data.photos;
            var time = data.time;
            
            // clear the element
            $(self.element).empty();
            //render!
            for (var p = 0; p < photos.length; p++) {
                var photo = photos[p];
                var image = $('<a class="' + self.widgetBaseClass + '-image" target="_blank" href="' + photo.original + '"></a>')
                    .append($("<img src=\"" + photo.thumbnail + "\" />"));
                $(self.element).append(image);
            }
            if (photos.length) {
                var button = $('<button>')
                    .text(self.options.more_btn_txt)
                    .click(function () {
                        $(self.element).vieImageSearch({
                            page_num : self.options.page_num+1
                        })
                    });
                $(self.element)
                .append(button);
            }
        },
        
        triggerSearch: function (entity) {
            
            if (typeof entity === "string") {
                entity = this.options.vie.entities.get(entity);
            }
            
            if (entity) {
                this.options.entity = entity;
                for (var s in this.options.services) {
                    var service = this.options.services[s];
                    if (service.use) {
                        this._trigger('start_query', undefined, {service: s, time: new Date()});
                        service.query(entity, this);
                    }
                }
            }
        },
        
        _getUrlMainPartFromEntity : function (entity, service) {
            entity = ($.isArray(entity))? entity : [ entity ];

            for (var e = 0; e < entity.length; e++) {
                var types = entity[e].get('@type');
                types = ($.isArray(type))? types : [ types ];
                
                for (var t = 0; t < types.length; t++) {
                    var type = this.options.vie.types.get(types[t]);
                    if (type) {
                        var tsKeys = [];
                        for (var q in service.ts_url) {
                            tsKeys.push(q);
                        }
                        //sort the keys in ascending order!
                        tsKeys = this.options.vie.types.sort(tsKeys, false);
                        for (var q = 0; q < tsKeys.length; q++) {
                            var key = tsKeys[q];
                            if (type.isof(key)) {
                                var ret = service.ts_url[key].call(this, entity[e], service);
                                if (ret) {
                                    return ret;
                                }
                            }
                        }
                    }
                }
            }
            return "";
        },
        
        options: {
            vie         : new VIE(),
            more_btn_txt: "More images...",
            page_num    : 1,
            services    : {
                'europeana' : {
                    use       : false,
                    api_key   : undefined,
                    bin_size  : 10,
                    base_url  : "http://api.europeana.eu/api/opensearch.rss?",
                    tail_url  : function (widget, service) {
                        var url = "&sort=" + service.sort;
                        
                        url += "&per_page=" + service.bin_size;
                        url += "&page=" + widget.options.page_num;
                        url += "&api_key=" + service.api_key;
                        url += "&extras=url_o&format=json&jsoncallback=?";
                        
                        return url;
                    },
                    query : function (entity, widget) {
                        // assemble the URL
                        var url = this.base_url;
                        url += widget._getUrlMainPartFromEntity(entity, this);
                        url += this.tail_url(widget, this);
                        // trigger the search & receive the data via callback
                        $.getJSON(url, this.callback(widget, this));
                    },
                    callback : function (widget, service) {
                        //"searchTerms=bible&&startPage=1&wskey=x";
                        return function (data) {
                            var photos = [];
                            //TODO
                            debugger;
                            widget._pageNum++;
                            var data = {time: new Date(), photos: photos};
                            widget._trigger('end_query', undefined, data);
                            var render = (widget.options.render)? widget.options.render : widget._render;
                            render.call(widget, data);
                          };
                    },
                    ts_url : {
                        "Thing" : function (entity, service) {
                            return "";
                        }
                    }
                },
                'flickr' : {
                    use       : false,
                    api_key   : undefined,
                    bin_size  : 10,
                    sort      : 'relevance',
                    base_url  : "http://api.flickr.com/services/rest/?method=flickr.photos.search",
                    tail_url  : function (widget, service) {
                        var url = "&sort=" + service.sort;
                        
                        url += "&per_page=" + service.bin_size;
                        url += "&page=" + widget.options.page_num;
                        url += "&api_key=" + service.api_key;
                        url += "&safe_search=1"; // safe search
                        url += "&extras=url_o&format=json&jsoncallback=?";
                        
                        return url;
                    },
                    query : function (entity, widget) {
                        // assemble the URL
                        var url = this.base_url;
                        url += widget._getUrlMainPartFromEntity(entity, this);
                        url += this.tail_url(widget, this);
                        // trigger the search & receive the data via callback
                        $.getJSON(url, this.callback(widget, this));
                    },
                    callback  : function (widget, service) {
                        return function (data) {
                            var photos = [];
                              if (data.stat === 'ok' && data.photos.total > 0) {
                                  //put them into bins
                                  for (var i = 0; i < data.photos.photo.length; i++) {
                                      var photo = data.photos.photo[i];
                                      var imgS = 'http://farm' + 
                                              photo.farm + '.static.flickr.com/' + 
                                              photo.server + '/' + 
                                              photo.id + '_' + 
                                              photo.secret + '_s.jpg';
                                      
                                      var imgZ = 'http://farm' + 
                                              photo.farm + '.static.flickr.com/' + 
                                              photo.server + '/' + 
                                              photo.id + '_' + 
                                              photo.secret + '_z.jpg';
                                      
                                      var photoObj = {
                                              "thumbnail" : imgS,
                                              "original" : imgZ
                                      };
                                      photos.push(photoObj);
                                  }
                                  widget._pageNum++;
                              }
                              var data = {service: service, time: new Date(), photos: photos};
                              widget._trigger('end_query', undefined, data);
                              var render = (widget.options.render)? widget.options.render : widget._render;
                              render.call(widget, data);
                          };
                    },
                    ts_url : {
                        "Thing" : function (entity, service) {
                            var url = "";
                            
                            if (entity.has("name")) {
                                var name = entity.get("name");
                                if ($.isArray(name) && name.length > 0) {
                                    name = name[0]; //just take the first
                                }
                                url += "&text="; // *no* type-specific keywords
                                url += name;
                            }
                            return url;
                        },
                        "Person" : function (entity, service) {
                            var url = "";
                            
                            if (entity.has("name")) {
                                var name = entity.get("name");
                                if ($.isArray(name) && name.length > 0) {
                                    name = name[0]; //just take the first
                                }
                                url += "&text=portrait "; // type-specific keywords
                                url += name;
                            } else {
                                return undefined
                            }
                            return url;
                        },
                        "GeoCoordinates" : function (entity, service) {
                            var url = "";
                            
                            if (entity.has('latitude') && 
                                entity.has('longitude')) {
                                var ts = Math.round((new Date()).getTime() / 1000);
                                var minUploadDate = ts - 604800 * 100; // last 100 weeks
                                var radius = 10;
                                var radiusUnits = "km";
                                
                                var lat = entity.get("latitude");
                                if ($.isArray(lat) && lat.length > 0) {
                                    lat = lat[0]; //just take the first
                                }
                                var lon = entity.get("longitude");
                                if ($.isArray(lon) && lon.length > 0) {
                                    lon = lon[0]; //just take the first
                                }
                                
                                url += "&lat=" + lat + "&lon=" + lon;
                                url += "&min_upload_date=" + minUploadDate;
                                url += "&radius=" + radius;
                                url += "&text=tourist attraction"; // type-specific keywords!
                                url += "&radius_units=" + radiusUnits;
                            } else {
                                return undefined
                            }                      
                            return url;
                        },
                        "Place" : function (entity, service) {
                            var url = "";
                            
                            if (entity.has('geo')) {
                                var geo = entity.get("geo");
                                return this._getUrlMainPartFromEntity(geo, service);
                            } else if (entity.has('containedIn')) {
                                var containedIn = entity.get('containedIn');
                                return this._getUrlMainPartFromEntity(containedIn, service);
                            } else if (entity.has('name')) {
                                var name = entity.get("name");
                                if ($.isArray(name) && name.length > 0) {
                                    name = name[0]; //just take the first
                                }
                                url += "&text=tourist attraction "; // type-specific keywords
                                url += name;
                            } else {
                                return undefined
                            }
                            return url;
                        }
                    }
                }
            },
            
            // helper
            render: undefined,
            entity: undefined,
            
            // events
            start_query: function () {},
            end_query: function () {}
        }
        
    });
})(jQuery);