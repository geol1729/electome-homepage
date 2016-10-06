var logosModuleTemplate = require( '../../html/logos-module.html' );

module.exports = Marionette.View.extend( {

	id: 'logos-module',

	className: 'module container',

	template: logosModuleTemplate,

} );