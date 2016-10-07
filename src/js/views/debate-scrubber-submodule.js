var debateScrubberSubmoduleTemplate = require( '../../html/debate-scrubber-submodule.html' );

var moment = require( 'moment' );

module.exports = Marionette.View.extend( {

	id: 'debate-scrubber',

	className: 'submodule',

	template: debateScrubberSubmoduleTemplate,

	onAttach: function () {
		var controls = this.$el.find(".controls");
		var scrubber = this.$el.find( '#debate-viz-scrubber-bar' );
		var scrubberPlayedRect = this.$el.find( '#debate-viz-scrubber-played-rect' );
		var scrubberArea = this.$el.find( '#debate-viz-scrubber-area' );

		var dragging;
		var mouseX;
		var interruptedPlay = false;
		var active = false;
		var playing = false;
		var scrubberWidth = scrubber.width();
		var scrubberAreaWidth = scrubberArea.width();
		var scrubberAreaOffsetLeft = scrubberArea[0].getBoundingClientRect().left;
		var totalSeconds;

		window.addEventListener( 'mousemove', function ( e ) {

			mouseX = e.pageX

			if ( dragging ) {

				var left = Math.max( 0, Math.min( ( mouseX - scrubberAreaOffsetLeft ), scrubberAreaWidth - scrubberWidth ) );

				scrubber.css( 'left', left );
				scrubberPlayedRect.css( 'width', left );

				var ratio = left / ( scrubberAreaWidth - scrubberWidth)

				TOME.app.trigger( 'debate:time:update', { source: 'scrubber', to: ratio * totalSeconds } );

			}

		}.bind( this ) );

		window.addEventListener( 'mouseup', function () {
			if(dragging) {
				if ( interruptedPlay ) {

					TOME.app.trigger( 'debate:video:play' );

					interruptedPlay = false;

				} else {

					TOME.app.trigger( 'debate:video:pause' );
				}				
			}

			dragging = false;
		}.bind( this ) );

		scrubber.on( 'mousedown', function () {
			dragging = true;

			if ( playing ) {
				interruptedPlay = true;
			}

			TOME.app.trigger( 'debate:video:pause' );

		}.bind( this ) );

		controls.on( 'click', function () {
			if ( active ) {

				playing = !playing;

				controls.toggleClass( 'playing' );

				if ( playing ) {
					TOME.app.trigger( 'debate:video:play' );
				} else {
					TOME.app.trigger( 'debate:video:pause' );
				}
			}

		}.bind( this ) );

		this.listenTo( TOME.app, 'debate:video:ready', function() {
			active = true;
			controls.attr("data-active", true);
		}.bind(this));

		this.listenTo( TOME.app, 'debate:data:fetched', function ( params ) {
			totalSeconds = moment( params.xmax ).diff( moment( params.xmin ), 'seconds' );
			this.$el.find( '.controls' ).removeClass( 'inactive' );
		}.bind( this ) );

		this.listenTo( TOME.app, 'debate:time:update', function ( params ) {
			if ( params.source !== 'scrubber' ) {
				var left = Math.max( 0, Math.min( scrubberAreaWidth - scrubberWidth, ( params.to / totalSeconds ) * scrubberAreaWidth ) );

				scrubber.css( 'left', left );
				scrubberPlayedRect.css( 'width', left );
			}
		}.bind( this ) );

	}

} );