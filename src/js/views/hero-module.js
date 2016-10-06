var heroModuleTemplate = require( '../../html/hero-module.html' );

module.exports = Marionette.View.extend( {

	id: 'hero-module',

	className: 'module container',

	template: heroModuleTemplate,

	events: {
		'click #debates-recaps-button': 'debates'
	},

	debates: function () {
		TOME.app.trigger( 'debate:go' );
	}

} );