var ContainerView = require( './views/container' );
var DebateModuleView = require( './views/debate-module' );

module.exports = {

	home: function () {
		TOME.root.showChildView( 'container', new ContainerView() );
		if ( $( '#overlay' ).hasClass( 'active' ) ) {
			$( '#overlay' ).removeClass( 'active' );
			window.setTimeout( function () {
				TOME.root.getChildView( 'overlay' ).remove();
			}, 500 );
		}

	},

	debate: function () {
		TOME.root.showChildView( 'overlay', new DebateModuleView() );
		$( '#overlay' ).addClass( 'active' );
	}

};