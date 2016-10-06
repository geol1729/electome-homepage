var debateModuleTemplate = require( '../../html/debate-module.html' );

var DebateVideoSubmoduleView = require( './debate-video-submodule' );
var DebateVizSubmoduleView = require( './debate-viz-submodule' );
var DebateScrubberSubmoduleView = require( './debate-scrubber-submodule' );
var DebateTweetsSubmoduleView = require( './debate-tweets-submodule' );

var moment = require( 'moment' );
var d3 = require( 'd3' );
var _ = require( 'underscore' );

module.exports = Marionette.View.extend( {

	id: 'debate-module-wrapper',

	className: 'module-wrapper',

	template: debateModuleTemplate,

	regions: {
		video: '#debate-viz-video-wrapper',
		viz: '#debate-viz-viz-wrapper',
		scrubber: '#debate-viz-scrubber-wrapper',
		tweets: '#debate-viz-tweets-sidebar-wrapper'
	},

	events: {
		'click #debate-header-back-button': 'back'
	},

	back: function ( e ) {
		e.preventDefault();
		Backbone.history.navigate( '/' );
		TOME.app.trigger( 'debate:back' );
	},

	onRender: function () {

		this.showChildView( 'video', new DebateVideoSubmoduleView( this._viz.config ) );
		this.showChildView( 'viz', new DebateVizSubmoduleView( this._viz.config ) );
		this.showChildView( 'scrubber', new DebateScrubberSubmoduleView( this._viz.config ) );
		this.showChildView( 'tweets', new DebateTweetsSubmoduleView( this._viz.config ) );

	},

	_createClusterDropdown: function ( data ) {

		this._viz.els.dropdown = d3.select( this.$el.find( '#debate-viz-dropdown' )[0] );

		var options = this._viz.els.dropdown.selectAll( 'p' )
			.data( data )
			.enter()
			.append( 'p' )
			.attr( 'class', 'dropdown-item' )
			.text( function ( d ) {
				return d.label;
			} )
			.attr( 'data-id', function ( d ) {
				return d.id;
			} );


		this.$el.find( '#debate-viz-dropdown').on( 'click', _.debounce( function ( e ) {

			if ( !e.target.classList.contains( 'dropdown-item' ) ) {
				return;
			}

			this._viz.activeDatum = d3.select( e.target ).datum();
			this._viz.els.title.text( this._viz.activeDatum.label );
			this._viz.els.subtitle.text( this._viz.activeDatum.headline_tweet_body );

			TOME.app.trigger( 'debate:sparkline:selected', { id: $(e.target).data( 'id' ), datum: this._viz.activeDatum } );

		}.bind( this ), 100 ) );

		// this.listenTo( 'debate:sparkline:active', function ( params ) {

		// 		var scrollerLeft = this._scroller.getBoundingClientRect().left;
		// 		var left = sparklineLeft - scrollerLeft + this._scroller.scrollLeft;

		// 		this._scroller.scrollLeft = left;

		// 	var timestamp = this._viz.els.scroller.scrollLeft() / ( this._viz.els.scroller[0].scrollWidth - this._viz.els.scroller.width() ) * this._viz.secondsRange;

		// 	TOME.app.trigger( 'debate:time:update', { source: 'sparkline', to: timestamp } );

		// }.bind( this ) );

		this.listenTo( TOME.app, 'debate:sparkline:clicked', function ( params ) {
			this.$el.find( '.dropdown-item[data-id=' + params.id + ']' ).trigger( 'click' );
		}.bind( this ) );

		this.listenTo( TOME.app, 'debate:sparkline:hovered', function ( params ) {
			this._viz.els.title.text( params.datum.label );
			this._viz.els.subtitle.text( params.datum.headline_tweet_body );
		} );

		this.listenTo( TOME.app, 'debate:sparkline:unhovered', function ( params ) {
			this._viz.els.title.text( this._viz.activeDatum ? this._viz.activeDatum.label : '' );
			this._viz.els.subtitle.text( this._viz.activeDatum ? this._viz.activeDatum.headline_tweet_body : '' );			
		} );

	},

	onAttach: function () {

		this._viz.els.title = this.$el.find( '#debate-viz-title' );
		this._viz.els.subtitle = this.$el.find( '#debate-viz-subtitle' );
		this._viz.els.scroller =this.$el.find( '#debate-viz-scroller' );

		d3.json( this._viz.url, function ( response ) {

			var xmin = '2016-09-27 00:55:30'; // This is the exact moment in time our video starts streaming
			var xmax;

			response.trending.sort( function( a, b ) {

				var aEndMoment = moment(a.end_time),
					aStartMoment = moment(a.start_time),
					bEndMoment = moment(b.end_time),
					bStartMoment = moment(b.start_time);

				if ( aEndMoment.isAfter( bEndMoment ) ) {
					return -1;
				} else if ( aEndMoment.isBefore( bEndMoment ) ) {
					return 1;
				} else if ( aStartMoment.isAfter( bStartMoment ) ) {
					return -1;
				} else {
					return 1;
				}

			} );

			this._viz.secondsRange = moment( xmax ).diff( moment( xmin ), 'seconds' );

			response.trending.forEach( function( d ) {
				if ( typeof xmax === 'undefined' || moment( d.end_time ).isAfter( moment( xmax ) ) ) {
					xmax = d.end_time;
				}
			} );

			this._createClusterDropdown( response.trending );

			TOME.app.trigger( 'debate:data:fetched', { response: response, xmin: xmin, xmax: xmax } );

			this._viz.els.scroller[0].addEventListener( 'wheel', function ( e ) {
				if ( Math.abs( e.deltaX ) > Math.abs( e.deltaY ) ) {

					var timestamp = this._viz.els.scroller.scrollLeft() / ( this._viz.els.scroller[0].scrollWidth - this._viz.els.scroller.width() ) * this._viz.secondsRange;

					TOME.app.trigger( 'debate:time:update', { source: 'wheel', to: timestamp } );

				}
			}.bind(this));

		}.bind( this ) );

	},

	initialize: function () {

		this._viz = {
			url: 'data/trends-1.json',
			intervalWidth: 50, // px
			intervalDuration: 30000, // s
			horizontalPadding: 20, // px
			els: {}
		};

		this._viz.config = {
			intervalWidth: this._viz.intervalWidth,
			horizontalPadding: this._viz.horizontalPadding
		};

		this.listenTo( TOME.app, 'debate:sparkline:activated', function ( params ) {

			var scrollerLeft = this._viz.els.scroller[0].getBoundingClientRect().left;
			var left = params.sparklineLeft - scrollerLeft + this._viz.els.scroller[0].scrollLeft;
			this._viz.els.scroller[0].scrollLeft = left;

			var timestamp = this._viz.els.scroller.scrollLeft() / ( this._viz.els.scroller[0].scrollWidth - this._viz.els.scroller.width() ) * this._viz.secondsRange;

			TOME.app.trigger( 'debate:time:update', { source: 'sparkline', to: timestamp } );

		}.bind( this ) );

	}

} );