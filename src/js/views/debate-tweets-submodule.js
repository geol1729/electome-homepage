var debateTweetsSubmoduleTemplate = require( '../../html/debate-tweets-submodule.html' );

module.exports = Marionette.View.extend( {

	id: 'debate-tweets',

	className: 'submodule',

	template: debateTweetsSubmoduleTemplate,

	_loadTweets: function ( ids, node ) {

		var tweetWidgetSettings = {
			align: 'left',
			conversation: 'none',
			// cards: 'hidden'
		};

		// I *think* there's a race condition here that I solved for.
		if ( !twttr.widgets ) {
			var checkForTwttrInterval = setInterval( function() {
				if ( twttr.widgets ) {
					clearInterval( checkForTwttrInterval );
					loadTweets( ids, node );
				}
			}, 100 );
		} else {
			node.classList.remove( 'empty' );
			node.classList.add( 'loading' );
			node.querySelector( '.tweets' ).innerHTML = '';
			Promise.all( ids.map( function ( id ) {
				return twttr.widgets.createTweet( id, node.querySelector( '.tweets' ), tweetWidgetSettings );
			} ) ).then( function () {
				node.classList.remove( 'loading' );
			} );
		}

	},

	onAttach: function () {

		var node = this.$el.find( '.sample' )[0];

		this.listenTo( TOME.app, 'debate:sparkline:selected', function ( params ) {
			this._loadTweets( [ params.datum.headline_tweet_id ].concat( params.datum.tweet_ids ), node );
		}.bind( this ) );

	}

} );