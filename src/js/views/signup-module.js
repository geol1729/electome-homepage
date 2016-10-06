var signupModuleTemplate = require( '../../html/signup-module.html' );

module.exports = Marionette.View.extend( {

	id: 'signup-module',

	className: 'module container',

	template: signupModuleTemplate

} );