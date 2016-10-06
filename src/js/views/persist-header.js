var d3 = require( 'd3' );

var persistHeaderTemplate = require( '../../html/persist-header.html' );

module.exports = Marionette.View.extend( {

	_chart: {
		els: {},
		axes: {},
		sizes: {},
		scales: {},
		padding: {
			top: 10,
			right: 0,
			bottom: 0,
			left: 0
		},
		first: true,
		index: 0
	},

	className: 'container',

	template: persistHeaderTemplate,

	events: {
		'mouseenter': 'mouseenterHandler',
		'mouseleave': 'mouseleaveHandler',
		'resize': 'resizeHandler'
	},

	mouseenterHandler: function () {
		window.clearInterval( this._chart.timer );
	},

	mouseleaveHandler: function () {
		this._showChart( true );
		this._chart.timer = window.setInterval( this._showChart.bind( this ), 2000 );
	},

	resizeHandler: function () {
		
		this._sizeChartEls();

		this._chart.scales.x.range( [ 0, this._chart.sizes.cwidth ] );
		this._chart.scales.y.range( [ this._chart.sizes.cheight, 0 ] );
		this._chart.axes.x.tickSize( -this._chart.sizes.cheight ).scale( this._chart.scales.x );
		this._chart.axes.y.tickSize( -this._chart.sizes.cwidth ).scale( this._chart.scales.y );

		if ( this._width <= 640 ) {
			this._xAxis.ticks( d3.timeDay.every( 7 ) );
		}

		window.clearInterval( this._chart.timer );
		window.clearTimeout( this._chart.pauser );

		this._chart.pauser = window.setTimeout( function () {
			this._showChart();
			this._chart.timer = window.setInterval( this._showChart.bind( this ), 2000 );
		}.bind( this ), 100 );

		var key = this._chart.keys[this._chart.index];
		if ( key === 'date' ) {
			this._chart.index++;
			key = this._chart.keys[this._chart.index];
		}

		this._chart.els.xAxis.transition().duration( 0 ).call( this._chart.axes.x );
		this._chart.els.yAxis.transition().duration( 0 ).call( this._chart.axes.y );

		this._chart.area = d3.area()
			.x( function ( d ) { return this._chart.scales.x( new Date( d.date ) ); }.bind( this ) )
			.y0( this._chart.sizes.cheight )
			.y1( function ( d ) { return this._chart.scales.y( parseFloat( d[key] ) ); }.bind( this ) );

		this._chart.els.path
			.transition()
			.duration( 0 )
			.attr( 'd', this._chart.area )
			.style( 'fill', this._chart.scales.color( this._chart.index ) );
	},

	onBeforeRender: function () {

		this._chart.scales.color = d3.scaleOrdinal().range( TOME.modules.color.colorRange );

	},

	onAttach: function () {

		this._createChartEls();

		this._getChartSizes();

		d3.csv( '/data/timeline.csv', function ( response ) {

			this._chart.data = response;

			this._chart.keys = Object.keys( this._chart.data[0] );

			this._chart.xmin = d3.min( this._chart.data, function ( d ) { return new Date( d.date ); } );
			this._chart.xmax = d3.max( this._chart.data, function ( d ) { return new Date( d.date ); } );

			this._chart.ymin = 0;

			this._chart.scales.x = d3.scaleUtc()
				.domain( [ this._chart.xmin, this._chart.xmax ] )
				.range( [ 0, this._chart.sizes.cwidth ] );
			this._chart.scales.y = d3.scaleLinear()
				.range( [ this._chart.sizes.cheight, 0 ] );

			this._chart.axes = {
				x: d3.axisBottom( this._chart.scales.x )
					.tickFormat( d3.utcFormat( '%b %-d') )
					.tickPadding( -12 )
					.tickSize( -this._chart.sizes.cheight ),
				y: d3.axisLeft( this._chart.scales.y )
					.ticks( 2 )
					.tickPadding( -30 )
					.tickFormat( function ( d, i ) {
						return '' + ( Math.round( d * 10000 ) / 100 ) + '%';
					} )
					.tickSize( -this._chart.sizes.cwidth )
			};

			this._sizeChartEls();

			this._showChart();
			this._chart.timer = window.setInterval( this._showChart.bind( this ), 2000 );

		}.bind( this ) );
	},

	_getChartSizes: function () {
		this._chart.sizes.width = this.el.parentNode.clientWidth;
		this._chart.sizes.height = this.el.parentNode.clientHeight;
		this._chart.sizes.cwidth = this._chart.sizes.width - this._chart.padding.left - this._chart.padding.right;
		this._chart.sizes.cheight = this._chart.sizes.height - this._chart.padding.top - this._chart.padding.bottom;
	},

	_createChartEls: function () {
		this._chart.els.title = document.getElementById( 'persist-header-chart-title' );
		this._chart.els.svg = d3.select( this.el.parentNode ).append( 'svg' );
		this._chart.els.guts = this._chart.els.svg.append( 'g' );
		this._chart.els.areaWrapper = this._chart.els.guts.append( 'g' );
		this._chart.els.axesWrapper = this._chart.els.guts.append( 'g' ).attr( 'id', 'persist-header-chart-axes' );
		this._chart.els.xAxis = this._chart.els.axesWrapper.append( 'g' );
		this._chart.els.yAxis = this._chart.els.axesWrapper.append( 'g' );
	},

	_sizeChartEls: function () {
		this._chart.els.svg
			.attr( 'width', this._chart.sizes.width )
			.attr( 'height', this._chart.sizes.height );
		this._chart.els.guts.attr( 'transform', 'translate(' + this._chart.padding.left + ',' + this._chart.padding.top + ')' );
		this._chart.els.xAxis.attr( 'transform', 'translate(0,' + this._chart.sizes.cheight + ')' );	
	},

	_showChart: function ( supressTitle ) {

		var key = this._chart.keys[this._chart.index];

		if ( key === 'date' ) {
			this._chart.index++;
			key = this._chart.keys[this._chart.index];
		}

		if ( !supressTitle ) {
			this._chart.els.title.innerHTML = key;
		} else {
			window.setTimeout( function () {
				this._chart.els.title.innerHTML = key;
			}.bind( this ), 500 );
		}

		if ( this._chart.first ) {

			this._chart.els.xAxis.call( this._chart.axes.x );
			this._chart.els.yAxis.call( this._chart.axes.y );

			this._chart.area = d3.area()
				.x( function ( d ) { return this._chart.scales.x( new Date( d.date ) ) }.bind( this ) )
				.y0( this._chart.sizes.cheight )
				.y1( function ( d ) { return this._chart.scales.y( 0 ) }.bind( this ) );

			this._chart.els.path = this._chart.els.areaWrapper.append( 'path' )
				.datum( this._chart.data )
				.attr( 'id', 'persist-header-chart-line', true )
				.attr( 'd', this._chart.area )
				.style( 'fill', this._chart.scales.color( this._chart.index ) );

			this._chart.first = false;

			this._chart.els.yAxis.select( 'text' ).remove();

		}

		this._chart.ymax = d3.max( this._chart.data, function ( d ) {
			return parseFloat( d[key] );
		} );

		this._chart.scales.y.domain( [ this._chart.ymin, this._chart.ymax ] );

		this._chart.area = d3.area()
			.x( function ( d ) { return this._chart.scales.x( new Date( d.date ) ); }.bind( this ) )
			.y0( this._chart.sizes.cheight )
			.y1( function ( d ) { return this._chart.scales.y( parseFloat( d[key] ) ); }.bind( this ) );

		this._chart.els.path
			.transition()
			.duration( 1000 )
			.style( 'opacity', 0.25 )
			.attr( 'd', this._chart.area )
			.style( 'fill', this._chart.scales.color( this._chart.index ) );

		this._chart.els.xAxis.transition().duration( 1000 ).call( this._chart.axes.x );
		this._chart.els.yAxis.transition().duration( 1000 ).call( this._chart.axes.y );

		this._chart.index++;
		if ( this._chart.index === this._chart.keys.length ) {
			this._chart.index = 0;
		}

	}

} );