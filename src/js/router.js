var controller = require( './controller' );

module.exports = Marionette.AppRouter.extend( {

	controller: controller,

	appRoutes: {
		'': 'home',
		'debates': 'debate'
	},

	initialize: function () {

		this.listenTo( TOME.app, 'debate:go', function () {
			this.controller.debate();
		}.bind( this ) );

		this.listenTo( TOME.app, 'debate:back', function () {
			this.controller.home();
		}.bind( this ) );

	}

} );