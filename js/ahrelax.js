/**
 *  Each & Other website, 2015 [www.eachandother.com]
 *  Author: Conor Luddy
 *
 *  <module name>
 *  ---------
 *  <module description>
 *
 *  Attach this to a front end module by giving its root
 *  element the attribute: data-js-module="<module name>"
 */

(function(window, document, EachAnd, $, Modernizr, undefined) {
    'use strict';

    EachAnd.util.ahhrelax = function() {

      var
      //Viewport
      vpTop = 0,
      vpBottom = 0,
      vpHeight = 0,
      vpWidth = 0,
      vpMidpoint = ((vpBottom - vpTop) / 2) + vpTop,
      //Setup fills this with individual objects we can animate
      initialisedPieces = [],
      //Other
      scrollInterval = 0,
      $window = $(window),
      $body = $('body');

      /*
       * These are the classes that get applied to each 'piece'
       */
      var viewClass = {
          //Applies to all pieces
          pieceToBeUsed: 'js-ar-piece',
          //Has never been in the viewport
          notYetBeenInView: 'js-ar-unSeen',
          //Has been in the viewport but may or may not still be
          hasBeenInView: 'js-ar-beenInView',
          //Is somewhere in view
          currentlyInView: 'js-ar-inView',
          //Is more than 50% of the way into the centre (based on midpoints - may need more accurate implementation)
          mostlyInView: 'js-ar-mostInView',
          //Is more than 50% of the way past the centre (based on midpoints - may need more accurate implementation)
          mostlyPastView: 'js-ar-mostlyPastView'
      };

      /*
       *  Targeted pieces or elements
       *  New effects can be defined for use here
       *
       *    Pieces potentially get the following properties:
       *    wrap
       *    rate
       *    tweak
       *    effect
       *    starts
       *    ends
       *    lasts
       *    height
       *    progressIn - 0-1, maxes out at 1 when the piece is actually taking up some vp space
       *    progressOut
       *    midpoint
       */
      var piece = [{
          wrap: '.m-statement',
          effect: 'fadeOutOnExit',
          rate: 2
      }];

      // , {
      //     //Just apply the classes used for visibility and don't do any parallaxy stuff
      //     // wrap: '.row-about',
      //     // effect: 'fadeOutOnExit',
      //     // rate: 2
      // }, {
      //     //Just apply the classes used for visibility and don't do any parallaxy stuff
      //    // wrap: '.row-clients'
      // }],




      /*
       *  Effects for assigning to our animatable pieces
       *
       * Define whatever you can think of. There's plenty of data to use.
       */
      var effect = {

          bgSlideVertical: function(piece, relativeTop) {
              var newvalue = (relativeTop * piece.rate).toFixed(2);
              //If the rate is negative, background position should be
              //shifted up so that it can move down without leaving a gap.
              newvalue = piece.rate < 0 ? piece.height - piece.tweak : 0;
              $(piece.wrap).css('background-position', '0 ' + newvalue + 'px');
          },

          elementSlideVertical: function(piece, relativeTop) {
              // var newvalue = ( relativeTop * piece.rate ).toFixed( 2 );
              // newvalue -= piece.rate < 0 ? piece.height - piece.tweak : 0;
              // $( piece.wrap ).css( 'transform', 'translate3d(0,' + newvalue + 'px,0' );
          },

          fadeOutOnExit: function(piece) {
              var rate = typeof(piece.rate) === 'undefined' ? 1 : piece.rate;
              piece.element.css('opacity', (1 - piece.progressOut * rate).toFixed(2));
          },

          // fadeInOnApproach: function(piece) {
          //     var rate = typeof(piece.rate) === 'undefined' ? 1 : piece.rate;
          //     piece.element.css('opacity', (0 + piece.progressIn * rate).toFixed(2));
          // },

          debuggy: function(piece) {
            console.log(piece);
          }

      };






      /*
       *  Calculate some dimensions
       */
      function setup() {

          var
          $pw,
          thisPiece = {};

          vpHeight = $window.height();
          vpWidth = $window.width();
          vpTop = $window.scrollTop();
          vpBottom = $window.scrollTop() + vpHeight;

          //Calculate the start and end points
          for (var i = piece.length - 1; i >= 0; i--) {
              //Piece could be a jQuery collection of elemeents, not jst one...
              $pw = $(piece[i].wrap);

              for (var j = 0; j < $pw.length; j++) {
                
                thisPiece = {};

                $.extend( thisPiece, piece[i] );
                
                thisPiece.element = $pw.eq(j);
                //Start of active section
                thisPiece.starts = $pw.eq(j).offset().top;
                //End of active section
                thisPiece.ends = thisPiece.starts + $pw.eq(j).height();
                //Save this so it doesn't need to calculate it every 10ms
                thisPiece.height = $pw.eq(j).height();
                //Ratio of section height to viewport height... has to be useful for something...
                thisPiece.lasts = $pw.eq(j).height() / vpHeight;

                initialisedPieces.push(thisPiece);

                 thisPiece.element.addClass(viewClass.notYetBeenInView);

              }
          }
      }





      /*
       *  Animate
       */
      function posUpdate() {
          window.requestAnimationFrame(function() {
              setVpTop();
              animatePieces();
          });
      }



      function setVpTop() {
          // Viewport top
          vpTop = $window.scrollTop();
          // Viewport bottom
          vpBottom = $window.scrollTop() + vpHeight;
      }



      function manageVisibilty(piece) {

          var
          $piece = piece.element,
          pieceTop = piece.starts,
          pieceBot = piece.ends,
          vpMidpoint,
          pieceMidpoint,
          progressIn,
          progressOut,
          inview = pieceTop < vpBottom && pieceBot > vpTop;

          if (inview) {
              $piece.addClass(viewClass.currentlyInView);
              $piece.addClass(viewClass.hasBeenInView);
              //
              $piece.removeClass(viewClass.notYetBeenInView);
          } else {
              $piece.removeClass(viewClass.currentlyInView);
              return inview;
          }

          //Midpoint of viewport in relation to page
          vpMidpoint = ((vpBottom - vpTop) / 2) + vpTop;

          //Midpoint of targeted piece in relation to page
          pieceMidpoint = piece.midpoint = ((pieceBot - pieceTop) / 2) + pieceTop;

          //0% when it just comes into vp, 100% when midpoints match
          progressIn = piece.progressIn = 1 - ((vpMidpoint - pieceMidpoint) / vpHeight * -1) < 1 ? (1 - ((vpMidpoint - pieceMidpoint) / vpHeight * -1)).toFixed(2) : 1;

          //0% when when midpoints match, 100% when it exits vp
          progressOut = piece.progressOut = 1 - ((vpMidpoint - pieceMidpoint) / vpHeight * -1) > 1 ? (((vpMidpoint - pieceMidpoint) / vpHeight * -1) * -1).toFixed(2) : 0;

          //Add, change and remove these as you see fit:

          //As piece is scrolled towards centre
          if (progressIn > 0.5) $piece.addClass(viewClass.mostlyInView);
          else $piece.removeClass(viewClass.mostlyInView);

          //As piece is scrolled beyond centre
          if (progressOut > 0.5) $piece.addClass(viewClass.mostlyPastView);
          else $piece.removeClass(viewClass.mostlyPastView);

          return inview;
      }





      /**
       * animatePieces
       */
      function animatePieces() {

        for (var i = initialisedPieces.length - 1; i >= 0; i--) {

          var
          inview = false,
          pieceTop = initialisedPieces[i].starts,
          pieceBot = initialisedPieces[i].ends,
          relativeTop;

          inview = manageVisibilty( initialisedPieces[i] );
          
          // element is in view if it's top is less than vp bottom, and its bottom is greater than vp top
          if ( inview ) {
            relativeTop = pieceTop - vpBottom;
            
            if( typeof( initialisedPieces[i].effect ) !== 'undefined' ) {
              switch ( initialisedPieces[i].effect ){
                
                case 'bgSlideVertical':
                  effect.bgSlideVertical( initialisedPieces[i], relativeTop );
                  break;

                case 'elementSlideVertical':
                  effect.elementSlideVertical( initialisedPieces[i], relativeTop );
                  break;

                case 'fadeOutOnExit':
                  effect.fadeOutOnExit( initialisedPieces[i] );
                  break;

                //Easy way to explore data we can play with.
                //You can set inverval to 30sec or something
                //down below if you want time to read the output.
                case 'debuggy':
                  effect.debuggy( initialisedPieces[i] );
                  break;
              }

            }

          }
        
        }

      }









      /*
       *  Initialise page
       */
      function init() {
          //Save necessary widths, heights, and other important factors
          setup();
          
          //Update them on window resize
          $window.resize(setup);

          //Update the page every x
          scrollInterval = setInterval(posUpdate, 50);
      }


      return init();
  };







  //Move elsewhere
  EachAnd.util.ahhrelax();






})(this.window, this.document, this.EachAnd, jQuery, Modernizr);
