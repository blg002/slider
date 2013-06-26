// Utility
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}


(function($) {
	var Modernizr = window.Modernizr;
	var transformProp = Modernizr.prefixed('transform');
	var transitionProp = Modernizr.prefixed('transition');

	var Slider = {
		init: function( el, config ) {
			var self = this;
			
			self.config = $.extend( {}, $.fn.slider.defaults, config );
			
			self.el            = el;
			self.$el           = $(el);
			self.$panels_wrap  = self.$el.find('.slider-panels');
			self.$tabs         = self.$el.find('.slider-tabs');
			self.$nav          = self.$el.find('.slider-nav');
			
			self.$panels       = self.$panels_wrap.find('.slider-panel');
			self.panels_length  = self.$panels.length;
			
			self.current       = 0;


			this.events();
			this.setup();
		},


		// -------------------------- setup -------------------------- //
		setup: function() {
			var self = this;

			self.setWidth();
			if ( self.config.animateHeight ) { self.setHeight( 1 ) };
		  if ( self.config.panelLinking && window.location.hash ) {
		    self.setCurrent( self.getPosition() );
		  }
		},

		setWidth: function() {
			var self = this;

		  self.$panels_wrap[0].style.width = (100 * self.panels_length) + '%'
		  self.$panels.width( (100 / self.panels_length) + '%' );
		},

		setHeight: function( duration ) {
			var self = this;

		  var duration = duration || self.config.animateDurationY;
		  var height = self.$panels.eq(this.current).height()

		  if (Modernizr.csstransitions) {
		  	self.$panels_wrap[0].style.height = height + 'px';
		  } else {
			  self.$panels_wrap.animate({
			    'height': height
			  }, duration);
		  }
		},


    // -------------------------- animation -------------------------- //
    transition: function() {
      var self = this;

      self.slideIt(
				self.$panels_wrap,
				(-(100 / self.panels_length) * self.current),
				self.config.animateDuration
			);

      if (self.config.animateHeight) {
        self.setHeight()
      };
    },

    slideIt: function($elem, x, duration) {
      var self = this;

      if (Modernizr.csstransforms3d) {
        $elem[0].style[transformProp] = 'translate3d(' + x + '%, 0, 0)';
        $elem[0].style[transitionProp] = duration + 'ms';
      } else if (Modernizr.csstransforms) {
        $elem[0].style[transformProp] = 'translate(' + x + '%)';
        $elem[0].style[transitionProp] = duration + 'ms';
      } else {
        $elem.animate({
          'margin-left': (x * self.panels_length + '%')
        });
      };
    },


		// -------------------------- methods -------------------------- //
		setCurrent: function( panel ) {
			var self = this;

			self.current = ( panel < 0 ) ? self.panels_length - 1 : panel % self.panels_length;
			self.$tabs.find('a').removeAttr('data-current').eq(self.current).attr('data-current','');

			self.transition();
		},

		getPosition: function( id ) {
			var self = this;

		  var panel_id = id || window.location.hash.substr(1) || self.$panels.eq(0).data('panel-id');
		  var panel    = self.$panels.filter('[data-panel-id="' + panel_id + '"]');
		  var position = self.$panels.index(panel);

		  return position < 0 ? this.current : position
		},

		updateUrlHash: function( hash ) {
		  Modernizr.history ?
		  	window.history.pushState(null, null, '#'+ hash) :
		  	window.location.hash = hash;
		},
		

		// -------------------------- events -------------------------- //
		events: function() {
			var self = this;
			var resizeTimer;

			// Tabs nav
			self.$tabs.find('a').on('click', function(e) {
				e.preventDefault();

				var panel_id = $(this).data('panel');
	      var position = self.getPosition( panel_id );

				self.setCurrent( position );
			  if ( self.config.panelLinking ) { self.updateUrlHash( panel_id ) }
			});

			// Button nav
	    self.$nav.find('button').on('click', function() {
	      var position = self.current  + ( ~~( $(this).data('dir') === 'next' ) || -1 );

	      self.setCurrent( position );

			  if ( self.config.panelLinking ) {
			    self.updateUrlHash( self.$panels.eq(self.current).data('panel-id') )
			  }
	    });

	    // Hashchange
			window.onload = function() {
				if ( !self.config.panelLinking ) { return; }

				if ( Modernizr.history ) {
				  window.setTimeout(function() {
				    window.onpopstate = function(e) {
				    	var position = self.getPosition();

				      self.setCurrent( position );
				    }
				  }, 1);
				} else {
		      window.onhashchange = function() {
			      self.setCurrent( self.getPosition() );
			    }
				}
			}
		}
	};

	$.fn.slider = function( config ) {
		return this.each(function() {
			var obj = Object.create( Slider );
			obj.init( this, config );
		});
	};

	$.fn.slider.defaults = {
		animateHeight: false,
	  animateDuration: 500,
	  panelLinking: false
	};

})( jQuery );
