
/*
 * 	Quick script to allow for some parallax and movement
 * 	
 * 	Inspired by https://medium.com/@dhg/parallax-done-right-82ced812e61c
 */

( function( $, window, undefined ) {

	var
	//Targeted elements
	pieceTop = 0, pieceBot = 0,
	
	//Viewport
	vpTop = 0, vpBottom = 0, vpHeight = 0, vpWidth = 0,
	
	//Other
	relativeTop = 0,
	scrollInterval = 0,
	$window =	$(window),
	$body =	$('body'),

	/*
	 *	Targeted pieces or elements
	 * 	New effects can be defined for use here
	 */
	piece = [{
		wrap: '#move-me',
		rate: 0.2,
		effect: 'bgSlideVertical'

		// These also get created on setup(), 
		// just putting them here for brevity:
		// starts: 0
		// ends: 0
		// lasts: 0
	}],	

	/*
	 *	Effects for assigning to our animatable pieces
	 *	In theory you should be able to contain custom 
	 *	functions in here that you can assign to elements.
	 */
	effect = {

		bgSlideVertical: function ( piece ) {

			var newvalue = ( relativeTop * piece.rate ).toFixed( 2 );

			$( piece.wrap ).css( 'background-position', '0 ' + newvalue + 'px' );

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
			
			//Ratio of section height to viewport height... has to be useful for something...
			piece[i].lasts =  $pw.height() / vpHeight;			
		}

	};



	/*
	 *	Position update, fires every 10ms 
	 */
	posUpdate = function () {

		window.requestAnimationFrame(function() {

			setVpTop();

			animatePieces();

		});

	};
	



	/*
	 *	Update the top and bottom offset of the page
	 *	from the top of the document
	 */
	setVpTop = function() {

		// Viewport top
		vpTop = $window.scrollTop();

		// Viewport bottom
		vpBottom = $window.scrollTop() + vpHeight;

	};



	/*
	 *	Loop through all of the objects in 'piece'
	 *	and if they're within our viewport then
	 *	fire the function that's assigned to them
	 */
	animatePieces = function () {
		
		for (var i = piece.length - 1; i >= 0; i--) {

			pieceTop = piece[i].starts;
			pieceBot = piece[i].ends;
			relativeTop = pieceTop - vpBottom;

			//element is in view if it's top offset is less than vp bottom's offset, 
			//and its bottom offset is greater than vp top's offset.
			if ( pieceTop < vpBottom && pieceBot > vpTop ) {
				
				switch ( piece[i].effect ){

					case 'bgSlideVertical':
						effect.bgSlideVertical( piece[i] );
						break;

					//Add more custom functions here 
					//when they've been defined up top
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


	///////
	init();
	///////


})( jQuery, window );




