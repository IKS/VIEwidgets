// VIE Widgets - Vienna IKS Editable Widgets
// (c) 2011 Sebastian Germesin, IKS Consortium
// VIE Widgets may be freely distributed under the MIT license.
// (see LICENSE)

(function($, undefined) {
    $.widget('view.flickr', {
        
        options: {
            vie         : new VIE(),
            api_key     : 'abcdefghijklmnopqrstuvwxyz012345',
            bin_size    : 10,
            page_num    : 1,
            more_btn_txt: "More images...",
            ts_query    : {
                "Person" : function (entity) {
                    var url = this.options.base_url;
                    url += "?method=flickr.photos.search";
                    url += "&api_key=" + this.options.api_key;
                    
                    if (entity.has("name")) {
                        var name = entity.get("name");
                        if ($.isArray(name) && name.length > 0) {
                            name = name[0]; //just take the first
                        }
                        url += "&text=" + name;
                    } else {
                        return undefined;
                    }
                    
                    url += "&sort=relevance";
                    url += "&per_page=" + this.options.bin_size;
                    url += "&page=" + this.options.page_num;
                    url += this.options.jsonp_tail;
                
                    return url;
                },
                "GeoCoordinates" : function (entity) {
                    var url = this.options.base_url;
                    url += "?method=flickr.photos.search";
                    url += "&api_key=" + this.options.api_key;
                    
                    if (entity.has('latitude') && 
                        entity.has('longitude')) {
                        var ts = Math.round((new Date()).getTime() / 1000);
                        var minUploadDate = ts - 604800; // last week
                        var radius = 20;
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
                        url += "&radius_units=" + radiusUnits;
                    } else {
                        return undefined;
                    }
                    
                    url += "&sort=relevance";
                    url += "&per_page=" + this.options.bin_size;
                    url += "&page=" + this.options.page_num;
                    url += this.options.jsonp_tail;
                
                    return url;
                },
                "Place" : function (entity) {
                    var url = this.options.base_url;
                    url += "?method=flickr.photos.search";
                    url += "&api_key=" + this.options.api_key;
                    
                    if (entity.has('geo')) {
                        var geo = entity.get("geo");
                        return this._getUrlFromEntity(geo);
                    } else if (entity.has('address')) {
                        //TODO: trigger search by Address
                    } else if (entity.has('containedIn')) {
                        var containedIn = entity.get('containedIn');
                        return this._getUrlFromEntity(containedIn);
                    } else if (entity.has('name')) {
                        var name = entity.get("name");
                        if ($.isArray(name) && name.length > 0) {
                            name = name[0]; //just take the first
                        }
                        url += "&text=" + name;
                    } else {
                        return undefined;
                    }
                    
                    url += "&sort=relevance";
                    url += "&per_page=" + this.options.bin_size;
                    url += "&page=" + this.options.page_num;
                    url += this.options.jsonp_tail;
                
                    return url;
                }
            },
            
            // helper
            render: undefined,
            entity: undefined,
            base_url    : "http://api.flickr.com/services/rest/",
            jsonp_tail  : "&extras=url_o&format=json&jsoncallback=?",
            
            // events
            start_query: function () {},
            end_query: function () {}
        },
        
        _create: function () {
            var self = this;
            self.element.bind('flickrend_query',
                function (event, data) {
                    var render = (self.options.render)? self.options.render : self._render;
                    render.call(self, data);
            });
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
                        $(self.element).flickr({
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
                var url = this._getUrlFromEntity(entity);
                this._trigger('start_query', undefined, {time: new Date()});
                $.getJSON(url, this._flickrCallback(this));
            } else {
                //TODO: throw error!
                this._trigger('start_query', undefined, {time: new Date()});
                this._trigger('end_query', undefined, {time: new Date(), photos: []});
            }
        },
        
        _getUrlFromEntity : function (entity) {
            entity = ($.isArray(entity))? entity : [ entity ];

            for (var e = 0; e < entity.length; e++) {
                var types = entity[e].get('@type');
                types = ($.isArray(type))? types : [ types ];
                
                for (var t = 0; t < types.length; t++) {
                    var type = this.options.vie.types.get(types[t]);
                    if (type) {
                        for (var q in this.options.ts_query) {
                            if (type.isof(q)) {
                                var ret = this.options.ts_query[q].call(this, entity[e]);
                                if (ret) {
                                    return ret;
                                }
                            }
                        }
                    }
                }
            }
                        
            //TODO: fallback!
            return undefined;
        },
        
        _flickrCallback: function (widget) {
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
                  }
                  widget._pageNum++;
                  widget._trigger('end_query', undefined, {time: new Date(), photos: photos});
              };
        }
    });
})(jQuery);