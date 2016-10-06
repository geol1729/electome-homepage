var debateVideoSubmoduleTemplate = require( '../../html/debate-video-submodule.html' );

module.exports = Marionette.View.extend( {

	id: 'debate-video',

	className: 'submodule',

	template: debateVideoSubmoduleTemplate,

	_createYouTubeScript: function () {
		var tag = document.createElement( 'script' );
		tag.src = 'https://www.youtube.com/iframe_api';

		document.body.appendChild( tag );

		window.onYouTubeIframeAPIReady = function () {

			this._viz.player = new YT.Player( 'debate-viz-video-iframe-wrapper', {
				height: this.$el.height(),
				width: this.$el.width(),
				videoId: '855Am6ovK7s',
				playerVars: {
					autoplay: 0,
					controls: 0
				},
				events: {
					onReady: function () {
						this._viz.ready = true;
						this._viz.duration = this._viz.player.getDuration();
						this.
					}.bind( this )
				}
			} )

		}.bind( this );

	},

	initialize: function () {

		this._viz = {};

		this._createYouTubeScript();

	}

} );