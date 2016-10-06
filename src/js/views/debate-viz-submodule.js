var debateVizSubmoduleTemplate = require( '../../html/debate-viz-submodule.html' );

var moment = require( 'moment' );
var d3 = require( 'd3' );

module.exports = Marionette.View.extend( {

	id: 'debate-viz',

	className: 'submodule',

	template: debateVizSubmoduleTemplate,

	initialize: function ( options ) {

		this._viz = {
			padding: {
				top: 10,
				right: options.horizontalPadding,
				left: options.horizontalPadding,
				bottom: 20
			},
			sizes: {
				width: 0,
				interval: options.intervalWidth
			},
			scales: {},
			els: {},
			format: 'YYYY-MM-DD hh:mm:ss Z'
		};

		this.listenTo( TOME.app, 'debate:data:fetched', function ( params ) {

			this._viz.sizes.height = this.$el.height();

			// Get the ymin/ymax...
			// Get the serieses.
			var ymin = Infinity;
			var ymax = 0;
			var mapped = params.response.trending.map( function ( d ) {
				return d.series;
			} );
			// Reduce them.
			var reduced = mapped.reduce( function ( previous, current ) {
				return previous.concat( current );
			}, [] );
			// Set the min and max.
			reduced.forEach( function ( d ) {
				// Get the max volume.
				if ( d[1] > ymax ) {
					ymax = d[1];
				}

				// Get the min volume.
				if ( d[1] < ymin ) {
					ymin = d[1];
				}
			} );


			// Get the area min/max...
			var amax = 0;
			var amin = Infinity;
			params.response.trending.forEach( function ( d ) {
				var area = 0;
				d.series.forEach( function ( s ) {
					area += s[1];
				} );
				if ( area > amax ) {
					amax = area;
				}
				if ( amin > area ) {
					amin = area;
				}
			} );

			this._viz.scales.color = d3.scaleLog()
				.domain( [ amin, amax ] )
				.range( [ TOME.modules.color.colors.purple.light.brighter(), TOME.modules.color.colors.green.medium ] )
				.interpolate( d3.interpolateRgb );

			this._viz.scales.y = d3.scaleLinear()
				.range( [ this._viz.padding.top, this._viz.sizes.height - this._viz.padding.bottom - this._viz.padding.top ] )
				.domain( [ ymax, ymin ] )

			var range = ( moment( params.xmax ).diff( moment( params.xmin ), 'minutes' ) * 2 ) + 1;

			var dates = [];

			var minAxisDate = moment.utc( params.xmin, this._viz.format );

			for ( var i = 0; i < range; i++ ) {
				dates.push( {
					date: minAxisDate.clone().add( 30 * i, 's' )
				} );
			}

			this._viz.els.svg = d3.select( this.$el.find( 'svg' )[0] );
			this._viz.els.svg
				.attr( 'width', ( this._viz.sizes.interval * range ) + this._viz.padding.left + this._viz.padding.right )
				.attr( 'height', this._viz.sizes.height );

			this._viz.els.svg.selectAll( '.date' ).remove();
			var dateNodes = this._viz.els.svg.selectAll( '.date' )
				.data( dates )
				.enter()
				.append( 'g' )
				.attr( 'class', 'date' )
				.attr( 'transform', function ( d, i ) {
					return 'translate(' + ( this._viz.padding.left + ( this._viz.sizes.interval * i ) ) + ',' + ( this._viz.sizes.height ) + ')';
				}.bind( this ) );
			dateNodes.append( 'text' )
				.text( function ( d ) {
					return d.date.local().format( 'h:mm:ss' );
				} )
				.attr( 'text-anchor', 'middle' );


			var lineGenerator = d3.line()
				.x( function ( d, i ) {
					var start = Math.abs( moment( d[0] ).diff( moment( params.xmin ), 'seconds' ) ) / 30;
					return ( start * this._viz.sizes.interval ) + this._viz.padding.left;
				}.bind( this ) )
				.y( function ( d, i ) {
					return this._viz.scales.y( d[1] );
				}.bind( this ) );

			var data = [];

			params.response.trending.forEach( function ( d ) {			
				var area = 0;
				d.series.forEach( function ( s ) {
					area += s[1];
				} );
				d.color = this._viz.scales.color( area );				
			}, this );

			this._viz.els.svg.selectAll( '.sparkline' ).remove();

			params.response.trending.forEach( function ( d ) {

				// Okay, we're going to do something tricky.
				// In order to ensure that the paths are hoverable,
				// we need to split them into subpaths.
				var lineWrapper = this._viz.els.svg.append( 'g' )
					.classed( 'sparkline', true )
					.attr( 'id', 'sparkline-' + d.id );
				for ( var i = 0; i < d.series.length - 1; i++ ) {
					var line = lineWrapper.append( 'path' ).classed( 'sparkline-part', true )
						.attr( 'd', lineGenerator( [ d.series[i], d.series[i + 1] ] ) )
						.style( 'stroke', d.color );
					var fauxline = lineWrapper.append( 'path' ).classed( 'faux-sparkline-part', true )
						.attr( 'd', lineGenerator( [ d.series[i], d.series[i + 1] ] ) );
					fauxline.on( 'click', function () {
						TOME.app.trigger( 'debate:sparkline:clicked', { id: d.id } );
					} );
					fauxline.on( 'mouseover', function () {
						lineWrapper.classed( 'hovered', true );
						TOME.app.trigger( 'debate:sparkline:hovered', { datum: d } );
					}.bind( this ) );
					fauxline.on( 'mouseout', function () {
						lineWrapper.classed( 'hovered', false );
						TOME.app.trigger( 'debate:sparkline:unhovered', {} );
					}.bind( this ) );
				}
			}, this );

			this.listenTo( TOME.app, 'debate:sparkline:selected', function ( params ) {

				d3.selectAll( '.sparkline' ).classed( 'active', false );
				var sparkline = d3.select( '#sparkline-' + params.id );
				sparkline.classed( 'active', true );
				var sparklineLeft = sparkline.node().getBoundingClientRect().left;

				TOME.app.trigger( 'debate:sparkline:activated', { sparklineLeft: sparklineLeft, datum: sparkline.datum() } )

			} );


			// var firstId;
			// var start = params.xmax;
			// params.response.trending.forEach( function ( d ) {
			// 	if ( moment( d.start_time ).isBefore( moment( start ) ) ) {
			// 		firstId = d.id;
			// 		start = d.start_time;
			// 	}
			// } );
			// TOME.app.trigger( 'debate:sparkline:clicked', { id: firstId } );

		}.bind( this ) );
	}

} );