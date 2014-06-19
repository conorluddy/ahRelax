
/*
 * 	Quick script to allow for some parallax and movement
 * 	
 * 	Inspired by https://medium.com/@dhg/parallax-done-right-82ced812e61c
 */
define(["jquery"], function($) {

	var
	//Viewport
	vpTop = 0, 
	vpBottom = 0, 
	vpHeight = 0, 
	vpWidth = 0,
	vpMidpoint = (( vpBottom - vpTop ) / 2 ) + vpTop,
	//Other
	scrollInterval = 0,
	$window =	$(window),
	$body =	$('body'),

	/*
	 *	Targeted pieces or elements
	 * 	New effects can be defined for use here
	 */
	piece = [{
		wrap: '#piece-station',
		target: null,
		rate: -0.3,
		tweak: 0,//for tweakage
		effect: 'bgSlideVertical'

		// Also gets the following on the fly:
		// starts: 0,
		// ends: 0,
		// lasts: 0,
		// height: 
		// progressIn
		// progressOut
		// midpoint
	}],	

	/*
	 *	Effects for assigning to our animatable pieces
	 */
	effect = {

		bgSlideVertical: function ( piece, relativeTop ) {

			var newvalue = ( relativeTop * piece.rate ).toFixed( 2 );	

			//If the rate is negative, background position should be 
			//shifted up so that it can move down without leaving a gap.
			newvalue -= piece.rate < 0 ? piece.height - piece.tweak : 0;

			$( piece.wrap ).css( 'background-position', '0 ' + newvalue + 'px' );

		},

		elementSlideVertical: function ( piece, relativeTop ) {

			var newvalue = ( relativeTop * piece.rate ).toFixed( 2 );	

			newvalue -= piece.rate < 0 ? piece.height - piece.tweak : 0;

			$( piece.wrap ).css( 'transform', 'translate3d(0,' + newvalue + 'px,0' );

		}

	};


	/*
	 *	Calculate some dimensions
	 */
	setup = function() {

		var $pw; //piece wrapper jq obj

		vpHeight = $window.height();
		vpWidth = $window.width();

		vpTop = $window.scrollTop();
		vpBottom = $window.scrollTop() + vpHeight;

		//Calculate the start and end points
		for (var i = piece.length - 1; i >= 0; i--) {
			
			$pw = $( piece[i].wrap );

			//Start of active section
			piece[i].starts = $pw.offset().top;
			
			//End of active section
			piece[i].ends = $pw.offset().top + $pw.height();

			//Save this so it doesn't need to calculate it every 10ms
			piece[i].height = $pw.height();
			
			//Ratio of section height to viewport height... has to be useful for something...
			piece[i].lasts =  $pw.height() / vpHeight;			
		}

	};



	/*
	 *	Animate 
	 */
	posUpdate = function () {

		window.requestAnimationFrame(function() {

			setVpTop();

			animatePieces();

		});

	};
	


	setVpTop = function() {

		// Viewport top
		vpTop = $window.scrollTop();

		// Viewport bottom
		vpBottom = $window.scrollTop() + vpHeight;

	};



	calcVisibilty = function ( piece ) {

		var
		$pieceWrap	= $(piece.wrap),
		pieceTop	= piece.starts,
		pieceBot	= piece.ends,
		//Element is visible
		inView = pieceTop < vpBottom && pieceBot > vpTop;

		if ( inView ) {
			$pieceWrap.addClass('inView');
		} else {
			$pieceWrap.removeClass('inView');
			return inView;
		}
		
		var
		//Midpoint of viewport in relation to page
		vpMidpoint = (( vpBottom - vpTop ) / 2 ) + vpTop,
		//Midpoint of targeted piece in relation to page
		pieceMidpoint = (( pieceBot - pieceTop ) / 2 ) + pieceTop,
		//0% when it just comes into vp, 100% when midpoints match
		progressIn = 1 - (( vpMidpoint - pieceMidpoint ) / vpHeight * -1 ) < 1  ? 	( 1 - (( vpMidpoint - pieceMidpoint ) / vpHeight * -1 )).toFixed( 2 ) : 1;
		//0% when when midpoints match, 100% when it exits vp
		progressOut = 1 - (( vpMidpoint - pieceMidpoint ) / vpHeight * -1 ) > 1 ? 	((( vpMidpoint - pieceMidpoint ) / vpHeight * -1 ) * -1 ).toFixed( 2 ) : 0;

		piece.progressIn = progressIn;
		piece.progressOut = progressOut;
		piece.midpoint = pieceMidpoint;


		if ( progressIn > 0.5 ){

			$pieceWrap.addClass('mostInView');
			$pieceWrap.addClass('beenInView');

		} else {

			$pieceWrap.removeClass('mostInView');

		}


		return inView;

	};



	animatePieces = function () {
		
		for (var i = piece.length - 1; i >= 0; i--) {

			var 
			$pieceWrap = $( piece[i].wrap ),
			inview = false,
			pieceTop = piece[i].starts,
			pieceBot = piece[i].ends,
			relativeTop;

			inview = calcVisibilty( piece[i] );
			
			//element is in view if it's top is less than vp bottom, and its bottom is greater than vp top
			if ( inview ) {

				relativeTop = pieceTop - vpBottom;
				
				switch ( piece[i].effect ){

					case 'bgSlideVertical':
						effect.bgSlideVertical( piece[i], relativeTop );
						break;

					// case 'opacity':
					// 	effect.opacity( piece[i] );
					// 	break;

				}

			}
		
		}

	};









	/*
	 *	Initialise page 	
	 */
	init = function () {

		//Save necessary widths, heights, and other important factors
		setup();
		//Update them on window resize
		$window.resize( setup );
		//Update the page every 10ms
		scrollInterval = setInterval( posUpdate, 10 );
		
	};

});

