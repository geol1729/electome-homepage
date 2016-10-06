module.exports = Marionette.View.extend( {

	el: 'body',

	regions: {
		'header': '#persist-header',
		'container': '#container',
		'overlay': '#overlay'
	}

} );