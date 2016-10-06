var d3 = require( 'd3' );

module.exports = {

	colors: {
		green: {
			dark: d3.rgb( '#3A4445' ),
			medium: d3.rgb( '#A0B1B2' ).darker(),
			light: d3.rgb( '#A0B1B2' ),
			extralight: d3.rgb( '#C9CCCD' )
		},
		blue: {
			dark: d3.rgb( '#5A76A8' ).darker(),
			medium: d3.rgb( '#5A76A8' ),
			light: d3.rgb( '#788AB5' ),
			extralight: d3.rgb( '#B4BBD5' )
		},
		purple: {
			dark: d3.rgb( '#6D658D' ).darker(),
			medium: d3.rgb( '#6D658D' ),
			light: d3.rgb( '#938BAA' ),
			extralight: d3.rgb( '#C0BCCD' )
		},
		red: {
			dark: d3.rgb( '#9F746E' ).darker(),
			medium: d3.rgb( '#9F746E' ),
			light: d3.rgb( '#AE8983' ),
			extralight: d3.rgb( '#D0BBB6' )
		},
		pink: {
			dark: d3.rgb( '#C58B9C' ).darker(),
			medium: d3.rgb( '#C58B9C' ),
			light: d3.rgb( '#D3A5B1' ),
			extralight: d3.rgb( '#DEC1C8' )
		},
		yellow: {
			dark: d3.rgb( '#B1AF76' ).darker(),
			medium: d3.rgb( '#B1AF76' ),
			light: d3.rgb( '#BFBC8C' ),
			extralight: d3.rgb( '#DCD9C0' )
		}
	},

	initialize: function () {
		this.colorRange = [
			this.colors.green.dark,
			this.colors.green.meidum,
			this.colors.green.light,
			this.colors.green.extralight,
			this.colors.blue.dark,
			this.colors.blue.meidum,
			this.colors.blue.light,
			this.colors.blue.extralight,
			this.colors.purple.dark,
			this.colors.purple.meidum,
			this.colors.purple.light,
			this.colors.purple.extralight,
			this.colors.red.dark,
			this.colors.red.meidum,
			this.colors.red.light,
			this.colors.red.extralight,
			this.colors.pink.dark,
			this.colors.pink.meidum,
			this.colors.pink.light,
			this.colors.pink.extralight,
			this.colors.yellow.dark,
			this.colors.yellow.meidum,
			this.colors.yellow.light,
			this.colors.yellow.extralight,
		]
	}



};