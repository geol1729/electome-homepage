var debateVideoSubmoduleTemplate = require( '../../html/debate-video-submodule.html' );

module.exports = Marionette.View.extend( {

	id: 'debate-video',

	className: 'submodule',

	playRAFID: null,

	playing: false,

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
						TOME.app.trigger('debate:video:ready');
					}.bind( this )
				}
			} )

		}.bind( this );

	},

	onAttach: function() {
		this.listenTo(TOME.app, 'debate:video:play', this.play);

		this.listenTo(TOME.app, 'debate:video:pause', this.pause);
	},

	initialize: function () {

		this._viz = {};

		this._createYouTubeScript();

		this.playRAF = this.playRAF.bind(this);

	},

	playRAF: function() {
		console.log("PLAY RAF")
		console.log(this._viz.player.getCurrentTime())
		TOME.app.trigger('debate:time:update', {
			source: 'video', to: this._viz.player.getCurrentTime()
		});

		if(this.playing) {
			this.playRAFID = requestAnimationFrame(this.playRAF);
		}
	},

	play: function() {
		this._viz.player.playVideo();

		this.playing = true;

		this.playRAFID = this.playRAF();
	},

	pause: function() {
		this._viz.player.pauseVideo();

		this.playing = false;
	}

} );