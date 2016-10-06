var articlesModuleTemplate = require( '../../html/articles-module.html' );
var d3 = require( 'd3' );

module.exports = Marionette.View.extend( {

	id: 'articles-module',

	className: 'module',

	template: articlesModuleTemplate,

	onAttach: function () {

		this._wrapper = d3.select( '#articles-wrapper' );
		this._button = document.getElementById( 'show-more-articles-button' );

		var index = 0;

		d3.csv( 'data/articles.csv', function ( data ) {

			data = data.sort( function ( a, b ) {
				return Date.parse( a.date ) < Date.parse( b.date ) ? 1 : -1;
			} );

			var add = function () {

				var endIndex = index + 3;
				if ( endIndex >= data.length - 1 ) {
					endIndex = data.length;
					this._button.parentNode.removeChild( this._button );
				}
				var articleData = data.slice( index, endIndex );

				index += 3;

				var article = this._wrapper.selectAll( 'article.batch' + index )
					.data( articleData )
					.enter()
					.append( 'article' )
					.classed( 'article', true )
					.classed( 'batch' + index, true )
					.style( 'height', '0em' );
				var img = article.append( 'div' )
					.classed( 'image', true )
					.style( 'background-image', function ( d ) {
						if ( d.image ) {
							return 'url(' + d.image + ')';							
						}
					} );
				var gloss = article.append( 'div' )
					.classed( 'gloss', true )
					.classed( 'with-image', function ( d ) {
						return d.image ? true : false;
					} );

				var guts = article.append( 'div' )
					.classed( 'inner-container', true );

				var link = article.append( 'a' )
					.attr( 'target', '_blank' )
					.attr( 'href', function ( d ) {
						return d.link;
					} );

				guts.append( 'h2' )
					.classed( 'article-publication', true )
					.text( function ( d ) {
						var date = d3.timeFormat( '%B %-d, %Y' )( new Date( d.date ) );
						return d.publication + ' // ' + date
					} );
				guts.append( 'h1' ).text( function ( d ) { return d.title } );
				guts.append( 'h2' )
					.classed( 'article-author', true )
					.text( function ( d ) {
						if ( d.author ) {
							return 'by ' + d.author;
						}
					} );

				article.each( function ( d, i ) {
					var el = d3.select( this ).node();
					el.addEventListener( 'click', function ( e ) {
						window.analytics.send( 'article', 'click', 'article ' + ( index + i ) );
					} );
				} );

				article.transition().duration( 500 ).style( 'height', '10em' );
			}.bind( this );



			var first = data.slice( index, index + 3 );
			add( first );

			this._button.addEventListener( 'click', function () {
				add();
			}.bind( this ) );



		}.bind( this ) );

	}

} );