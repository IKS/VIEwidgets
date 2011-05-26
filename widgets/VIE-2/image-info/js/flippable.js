/*
 * Copyright 2011 Sebastian Germesin, DFKI GmbH
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function($, undefined) {

    $.widget('ui.flippable', {

    	// default options
    	options: {
    		backCssClass: 'flippable-backside',
    		
    		trigger: 'click'
    	},
    	
    	// the container that replaces the image in the DOM tree
		_container: jQuery("<span>")
		.css('perspective', '1000') //defines how 'far away' we are
		.css('-moz-perspective', '1000') //defines how 'far away' we are
		.css('-webkit-perspective', '1000'), //defines how 'far away' we are
		
		// the object that stores front (the image) and
		// back (the metadata)
		_parent: jQuery('<div>')
		.attr('id', 'parent')
		.css('transform-style', 'preserve-3d')
		.css('-moz-transform-style', 'preserve-3d')
		.css('-webkit-transform-style', 'preserve-3d')
		.css('transition', '1.0s linear')
		.css('-moz-transition', '1.0s linear')
		.css('-webkit-transition', '1.0s linear')
		.data('flipped', false),
		
		//the back div
		_back: jQuery('<div>')
		.attr('id', 'back')
		.css('overflow', 'auto') //make it scrollable
		.css('backface-visibility', 'hidden')
		.css('-moz-backface-visibility', 'hidden')
		.css('-webkit-backface-visibility', 'hidden')
		.css('transform', 'rotateY(-180deg)')
		.css('-moz-transform', 'rotateY(-180deg)')
		.css('-webkit-transform', 'rotateY(-180deg)'),
    	
    	_create: function() {
    		var that = this;
    		/*
    		 * now:
    		 * <img>
    		 * 
    		 * after:
    		 * <span> //this.options.container
    		 *  <div> //this.options.parent
    		 *   <img />
    		 *   <div> // this.options.back
    		 *   </div>
    		 *  </div>
    		 * </span>
    		 */
    		
    		var image = jQuery(this.element);

    		//structure
    		this._container.insertBefore(image);
    		this._container.append(this._parent);
    		this._parent.append(image);
    		this._parent.append(this._back);

    		var imgWidth = image.width();
    		var imgHeight = image.height();
    		
    		this._parent
    		.width(imgWidth + 'px')
    		.height(imgHeight + 'px');
    		
    		this._copyPosCss(image, this._container);
    		
    		this._back
            .addClass(this.options.backCssClass)
    		.width(imgWidth + 'px')
    		.height(imgHeight + 'px');
    		
    		//and add the correct CSS values
    		image
    		.css('backface-visibility', 'hidden')
    		.css('-moz-backface-visibility', 'hidden')
    		.css('-webkit-backface-visibility', 'hidden')
    		.css('position', 'absolute')
    		.css('z-index', '0');
    			
    		//bind the flipping to the given event
    		this._parent
    		.bind(this.options.trigger, function (ev) {
				if (that._parent.data('flipped')) {
					that._parent.
					data('flipped', false)
	    			.css('transform', 'rotateY(0deg)')
	    			.css('-moz-transform', 'rotateY(0deg)')
	    			.css('-webkit-transform', 'rotateY(0deg)');
				} else {
					that._parent.
					data('flipped', true)
	    			.css('transform', 'rotateY(-180deg)')
	    			.css('-moz-transform', 'rotateY(-180deg)')
	    			.css('-webkit-transform', 'rotateY(-180deg)');
				}
    		});
		},
		
		_copyPosCss: function (from, to) {
			var styles = ['float','position','marginLeft','marginRight',
			              'marginTop','marginBottom','paddingLeft','paddingRight',
			              'paddingTop','paddingBottom'];
			
			jQuery.each(styles, function (i, e) {
				if (from.css(e)) {
					to.css(e, from.css(e));
					from.css(e, '');
				}
			});
		},
		
		fillMetadata: function (object) {
			this._back.empty().append(object);
		}
		
    });

}(jQuery));
