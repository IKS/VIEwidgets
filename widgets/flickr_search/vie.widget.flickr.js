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
            ts_query    : {
                "Person" : function (entity, widget) {
                    var name = entity.get("name");
                    if ($.isArray(name) && name.length > 0) {
                        name = name[0]; //just take the first
                    }
                    
                    var url = widget.options.base_url;
                    url += "?method=flickr.photos.search";
                    url += "&api_key=" + widget.options.api_key;
                    url += "&text=" + name;
                    url += "&sort=relevance";
                    url += "&per_page=" + widget.options.bin_size;
                    url += "&page=" + widget.options.page_num;
                    url += widget.options.jsonp_tail;
                    
                    return url;
                },
                "Place" : function (entity) {
                    debugger;
                    if (entity.get('geo') &&
                            entity.get('geo').get('latitude') &&
                            entity.get('geo').get('longitude')) {
                        //TODO: trigger search by LatLong
                    } else {
                        //TODO: fallback
                    }
                }
            },
            
            // helper
            render: undefined,
            entity: undefined,
            page_num: 1,
            base_url    : "http://api.flickr.com/services/rest/",
            jsonp_tail  : "&extras=url_o&format=json&jsoncallback=?",
            
            // events
            start_query: function () {},
            end_query: function () {}
        },
        
        _create: function () {
            console.info("VIE Widget 'Flickr' created on element!", this.element);
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
                image.trigger("create"); //TODO: hack as 
                $(self.element).append(image);
            }
        },
        
        triggerSearch: function (entity) {
            this.options.page_num = 1;
            
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
            var types = entity.get('@type');
            types = ($.isArray(type))? types : [ types ];
            
            for (var t = 0; t < types.length; t++) {
                var type = this.options.vie.types.get(types[t]);
                if (type) {
                    for (var q in this.options.ts_query) {
                        if (type.isof(q)) {
                            return this.options.ts_query[q](entity, this);
                        }
                    }
                }
            }
                        
            //TODO: fallback!
            var text = "This is a test";
            var url = self.options.base_url;
            url += "?method=flickr.photos.search";
            url += "&api_key=" + self.options.api_key;
            url += "&text=" + text;
            url += "&sort=relevance";
            url += "&per_page=" + this.options.bin_size;
            url += "&page=" + this.options.page_num;
            url += self.options.jsonp_tail;
            
            return url;
        },
       /*         
        _getUrlWithText: function  (text) {
            var self = this;
            
            text = encodeURI(text);
            
            var url = self.options.base_url;
            url += "?method=flickr.photos.search";
            url += "&api_key=" + self.options.api_key;
            url += "&text=" + text;
            url += "&sort=relevance";
            url += "&per_page=" + this.options.bin_size;
            url += "&page=" + this.options.page_num;
            url += self.options.jsonp_tail;
            
            return url;
        },
                
        _findPhotosByLatLong: function  (lat, lon) {
            var self = this;
                        
            var ts = Math.round((new Date()).getTime() / 1000);
            var minUploadDate = ts - 604800; // last week
            var radius = 20;
            var radiusUnits = "km";
            
            var url = self.options.base_url;
            url += "&lat=" + lat + "&lon=" + lon;
            url += "&min_upload_date=" + minUploadDate;
            url += "&radius=" + radius;
            url += "&radius_units=" + radiusUnits;
            url += "&sort=relevance";
            url += "&per_page=" + this.options.bin_size;
            url += "&page=" + this.options.page_num;
            url += self.options.jsonp_tail;
            
            return url;
        },
                
        _findPhotosByTags: function  (tags) {
            var self = this;
            
            if (!$.isArray(tags)) {
                tags = tags.split(" ");
            }
                        
            var url = self.options.base_url;
            url += "?method=flickr.photos.search";
            url += "&api_key=" + self.options.api_key;
            url += "&tags=" + tags.join();
            url += "&tag_mode=all";
            url += "&sort=relevance";
            url += "&per_page=" + this.options.bin_size;
            url += "&page=" + this.options.page_num;
            url += self.options.jsonp_tail;
            
            return url;
        },*/
        
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
                  widget._trigger('end_query', undefined, {time: new Date(), photos: photos});
              };
        }
    });
})(jQuery);