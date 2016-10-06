var $ = require( 'jquery' );

// Expose some globals. Sorry.
window.$ = window.jQuery = $;
window.TOME = {
	modules: {}
};
window.Backbone = require( 'backbone' );
window.Marionette = require( 'backbone.marionette' );

// Load custom shit.
var Router = require( './router' );
var Controller = require( './controller' );
var RootView = require( './views/root' );
var PersistHeaderView = require( './views/persist-header' );
var colorModule = require( './modules/colors' );

// Add the utils module.
TOME.modules.color = colorModule;
TOME.modules.color.initialize();

// Load Bootstrap.
window.Tether = require( 'tether' );
require( 'bootstrap' );

// Create the app and the app's root view.
TOME.app = new Marionette.Application();
TOME.root = new RootView();

// On start, fire up the router and start history.
TOME.app.on( 'start', function () {

	TOME.root.showChildView( 'header', new PersistHeaderView() );

	TOME.app.router = new Router();

	Backbone.history.start();

} );

TOME.app.start();