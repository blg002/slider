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
			self.panels_count = self.$panels.length;
			
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

		  self.wrapper_width = self.el.offsetWidth;
		  self.$panels.width(self.wrapper_width);
		  self.panel_width = self.$panels[0].offsetWidth;

		  self.$panels_wrap[0].style.width = (self.panel_width * self.panels_count) + 'px';
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

			self.slideIt( self.$panels_wrap, -( self.current * self.panel_width ), self.config.animateDuration );

			if ( self.config.animateHeight ) { self.setHeight() };
		},

		slideIt: function( $elem, x, duration ) {
			var self = this;

			if (Modernizr.csstransforms3d) {
				$elem[0].style[transformProp] = 'translate3d(' + x + 'px, 0, 0)';
		    $elem[0].style[transitionProp] = duration + 'ms';
			} else if (Modernizr.csstransforms) {
				$elem[0].style[transformProp] = 'translate(' + x + 'px)';
		    $elem[0].style[transitionProp] = duration + 'ms';
			} else {
				$elem.animate({ 'margin-left': x });
			};
		},


		// -------------------------- methods -------------------------- //
		setCurrent: function( panel ) {
			var self = this;

			self.current = ( panel < 0 ) ? self.panels_count - 1 : panel % self.panels_count;
			self.$tabs.find('a').removeAttr('data-current').eq(self.current).attr('data-current','');

		  if ( self.config.panelLinking ) {
		    self.updateUrlHash( self.$panels.eq(self.current).data('panel-id') )
		  }

			self.transition();
		},

		getPosition: function( id ) {
			var self = this;

		  var panel_id = id || window.location.hash.substr(1);
		  var panel    = self.$panels.filter('[data-panel-id="' + panel_id + '"]');
		  var position = self.$panels.index(panel);

		  return position < 0 ? this.current : position
		},

		updateUrlHash: function( hash ) {
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
			});

			// Button nav
	    self.$nav.find('button').on('click', function() {
	      var position = self.current  + ( ~~( $(this).data('dir') === 'next' ) || -1 );

	      self.setCurrent( position );
	    });

	    // Hashchange
      window.onhashchange = function() {
	      self.setCurrent( self.getPosition() );
	    }

	    // Window resizing
	    window.onresize = function() {
	      if (resizeTimer) { clearTimeout(resizeTimer); }
	      resizeTimer = setTimeout(function() {
	        self.setWidth();
	        if ( self.config.animateHeight ) { self.setHeight( 1 ) };
	        self.slideIt( self.$panels_wrap, -( self.current * self.panel_width ), 0 );
	      }, 50);
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
