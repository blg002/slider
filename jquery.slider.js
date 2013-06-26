var Modernizr = window.Modernizr;
var transformProp = Modernizr.prefixed('transform');
var transitionProp = Modernizr.prefixed('transition');

;(function($, window, document, undefined) {

	var Slider = function( elem, options ) {
		this.elem     = elem;
		this.$elem    = $(elem);
		this.options  = options;
		this.metadata = this.$elem.data('slider-options');

		this.$panelsWrap  = this.$elem.find('.slider-panels');
		this.$tabs        = this.$elem.find('.slider-tabs');
		this.$tabLinks    = this.$tabs.find('.slider-tab-target');
		this.$nav         = this.$elem.find('.slider-nav');
		this.$navLinks    = this.$nav.find('.slider-nav-target');
		this.$panels      = this.$panelsWrap.find('.slider-panel');
		this.panelsLength = this.$panels.length;
		this.current      = 0;
	};

	Slider.prototype = {
		defaults: {
			animateHeight: false,
		  animateDuration: 500,
		  panelLinking: false
		},

		init: function() {
			this.config = $.extend( {}, this.defaults, this.options, this.metadata );

			// set proper widths
			this.$panelsWrap[0].style.width = (100 * this.panelsLength) + '%';
			this.$panels.width( (100 / this.panelsLength) + '%' ); 

			this.bindEvents();

			if ( this.config.animateHeight ) { this.setHeight(1); }
			if ( this.config.panelLinking && window.location.hash ) {
				var panelID = 'panel-' + window.location.hash.slice(1);
				var panelIndex = this.getPositionOf( panelID );
				this.setCurrent( panelIndex );
			}

			return this;
		},

		// events
		bindEvents: function() {
			var self = this;

			this.$tabLinks.on( 'click', $.proxy(this.handleTabClick, self) );
			this.$navLinks.on( 'click', $.proxy(this.handleNavClick, self) );
		},

		handleTabClick: function( e ) {
			e.preventDefault();
			var link          = e.currentTarget;
			var panelID       = link.getAttribute('href').slice(1);
			var newPanelIndex = this.getPositionOf(panelID);

			this.setCurrent( newPanelIndex );
		},

		handleNavClick: function( e ) {
			var newPanelIndex = this.current + ( ~~( $(e.currentTarget).data('dir') === 'next' ) || -1 );
			
			this.setCurrent( newPanelIndex );
		},

		// methods
		getPositionOf: function( panelID ) {
			var panel = this.$panels.filter('#' + panelID);
			var position = this.$panels.index(panel);

			return position;
		},

		// actions
		setCurrent: function( panelIndex ) {
			this.current = panelIndex < 0 ? this.panelsLength - 1 : panelIndex % this.panelsLength;
			this.$tabLinks.removeClass('is-current').eq(this.current).addClass('is-current');

			this.slippitySlideTo( this.current );
			if ( this.config.animateHeight ) { this.setHeight(); }
			if ( this.config.panelLinking )  { this.setUrlHash( this.$panels.eq(this.current).attr('id').split('panel-')[1] ); }
		},

		slippitySlideTo: function( panelIndex ) {
			var x = -(100 / this.panelsLength) * panelIndex;

			// slide
      if ( Modernizr.csstransforms3d ) {
        this.$panelsWrap[0].style[transformProp] = 'translate3d(' + x + '%, 0, 0)';
        this.$panelsWrap[0].style[transitionProp] = this.config.animateDuration + 'ms';
      } else if ( Modernizr.csstransforms ) {
        this.$panelsWrap[0].style[transformProp] = 'translate(' + x + '%)';
        this.$panelsWrap[0].style[transitionProp] = this.config.animateDuration + 'ms';
      } else {
        this.$panelsWrap.animate({
          'margin-left': (x * self.panelsLength + '%')
        });
      }
		},

		setHeight: function( duration ) {
			var duration = duration || this.config.animateDuration;
    	var height = this.$panels.eq(this.current).height();
    	
      if ( Modernizr.csstransitions ) {
		  	this.$panelsWrap[0].style.height = height + 'px';
		  } else {
			  this.$panelsWrap.animate({
			    'height': height
			  }, duration);
		  }
		},

		setUrlHash: function( hash ) {
			Modernizr.history ?
		  	window.history.pushState(null, null, '#'+ hash) :
		  	window.location.hash = hash;
		},
	};


	Slider.defaults = Slider.prototype.defaults;

	$.fn.slider = function( options ) {
		return this.each(function() {
			new Slider(this, options).init();
		});
	};

})(jQuery, window, document);