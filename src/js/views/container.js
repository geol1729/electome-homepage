var containerTemplate = require( '../../html/container.html' );
var HeroModule = require( './hero-module' );
var SignupModule = require( './signup-module' );
var ArticlesModule = require( './articles-module' );
var LogosModule = require( './logos-module' );

module.exports = Marionette.View.extend( {

	template: containerTemplate,

	id: 'container-modules',

	regions: {
		'hero': '#hero-module-wrapper',
		'signup': '#signup-module-wrapper',
		'articles': '#articles-module-wrapper',
		'logos': '#logos-module-wrapper',
		'bios': '#bios-module-wrapper'
	},

	onRender: function () {
		this.showChildView( 'hero', new HeroModule() );
		this.showChildView( 'signup', new SignupModule() );
		this.showChildView( 'articles', new ArticlesModule() );
		this.showChildView( 'logos', new LogosModule() );
	}

} );