/** 
 * coc.accordion-tabs.js v1.8
 * Pattern Library accordion and tab functions
 * @dependency: jQuery v2.2.4
 *
 * Provides the interactive functionality for accordions and tabs.
 * Note: For mobile screens, tabs transform into accordions for usability.
 * See Pattern Library > Components > Accordions | Tabs for required HTML
 * markup and usage information.
 */

(function ( $, window, document ) {
	'use strict';
	var COC = window.COC || {};
	COC.Accordion = {
		/**
		 * Static variables
		 */
		selector: {
			wrapper: '.cui.accordion',
			title: '.title-bar',
			panel: '.cui.collapsible'
		},
		init: function() {
			$(COC.Accordion.selector.wrapper)
				.not('.initialized')
				.addClass('initialized')
				.each( function() 
			{
				COC.Accordion.initSet( $( this ) );
			});
			
			window.addEventListener('hashchange', function(e) 
			{
				var escHash = $.escapeSelector(location.hash.replace("#", ""));
				var matchingSections = $(".cui.accordion h3#" + escHash + " button");
				
				if (matchingSections.length > 0)
					COC.Accordion.setOpen(matchingSections, true);
			});
		},
		/**
		 * Initialize each set (or wrapper) of accordions.
		 */
		initSet: function( wrapper ) {
			wrapper.children( COC.Accordion.selector.title ).each( function() {
				COC.Accordion.initSingle( $( this ) );
			});

            COC.Accordion.setupShowHide(wrapper);
		},
		/**
		 * Each accordion is composed of the title and the content.
		 * A <button> will wrap all of the contents of the title element.
		 * The accordion content will become wrapped in a <div>.
		 * The button will toggle the show/hide of the content.
		 */
		initSingle: function( accordionTitle ) {
			accordionTitle = $( accordionTitle );

			// Create a unique id. This is used to create a relationship with the button and the content.
			var id = COC.Accordion.generateUID( 'collapsible-' );

			// Allow section to be open based on default class, OR window hash
			var openByDefault = 
					accordionTitle.parents(".cui.accordion").is(".default-expanded")
					|| ("#" + (accordionTitle.attr("id") || "").toLowerCase() == window.location.hash.toLowerCase());

			// Wrap all of the content after the title into a collapsible panel.
			accordionTitle.nextUntil( '.title-bar' ).wrapAll('<div id="' + id + '" class="cui collapsible" aria-hidden="true">');

            if (openByDefault)
                accordionTitle.next().slideDown(1, function() { $(this).attr('aria-hidden', 'false'); });

			// Wrap the innards of the title into a <button>.
			accordionTitle.wrapInner( '<button aria-expanded="' + openByDefault + '" aria-controls="' + id + '">' );
			var button = accordionTitle.children( 'button' );

			// Add a click listener to toggle the content.
			button.on( 'click', function() {
				COC.Accordion.click( $( this ) );
			});
		},
		click: function( button ) {
			var state = button.attr( 'aria-expanded' ) === 'false' ? true : false;
			COC.Accordion.setOpen($(button), state);
		},
		setOpen: function (button, state)
		{
			var panel = button.parents( '.title-bar' ).next( '.collapsible' );			
			
			// Update the button state.
			button.attr( 'aria-expanded', state );
			
			// Slide the content up or down.
			if (state)
				panel.slideDown( 500 ).attr( 'aria-hidden', false );
			else 
				panel.slideUp( 500 ).attr( 'aria-hidden', true );
				
		},
		/**
		 * generateUID()
		 * Returns a unique id.
		 * @param prefix - string - Prefix for the ID
		 */
		generateUID: function( prefix ) {
			// Generate a random ID.
			var id = prefix + Math.floor(Math.random() * 100000);

			// Confirm that the ID does not currently exist in the DOM.
			if( $( '#' + id ).length === 0 ) {
				// ID does not exist already, use it.
				return id;
			}
			else {
				// ID already exists, try again.
				COC.Accordion.generateUID( prefix );
			}
		},
		
		setupShowHide: function(container)
		{
			if (!container.is(".acc-wrap"))
				return;

			var headers = container.find('.title-bar');
            var openByDefault = container.is(".default-expanded");
            var initialButtonState;
            var initialButtonText;
            
            if(openByDefault == true) {
            	initialButtonState = "expanded";
            	initialButtonText = "Collapse all";
            } else {
            	initialButtonState = "collapsed";
            	initialButtonText = "Expand all";
            }

			if (headers.length > 1) {
				var btnShowHide = $(document.createElement('button'));
				btnShowHide.addClass('cui btn-sm secondary-text show-hide-all-button mb-xxs')
						   .attr('data-button-state', initialButtonState)
						   .attr('type', "button")
						   .text(initialButtonText)
						   .insertBefore(headers.eq(0));
				
				var btnState = $(document.createElement('span'));
				btnState.attr('id', "statusmsg")
						.attr('role', "status")
						.attr("class","sr-only")
						.text(initialButtonState + " all")
						.insertBefore(headers.eq(0));

				btnShowHide.click(function () {
					var state = $(this).attr("data-button-state");
					var targetState;
					if (state == "collapsed") {
						targetState = "show";
						$(this).attr("data-button-state", "expanded").text("Collapse all");
						$(this).next().text("expanded all");
					} else {
						targetState = "hide";
						$(this).attr("data-button-state", "collapsed").text("Expand all");
						$(this).next().text("collapsed all");
					}
					ShowHideAll(container, targetState);
				});
			}
		}

	};// End of COC.Accordion{}

	COC.Tab = {
		/**
		 * Static variables
		 */
		selector: {
			wrapper: '.cui.tab-container',
			linkList: '.tab-nav',
			panel: '.tab-panel'
		},
		event: {
			resizeTimeout:    null
		},
		isTabStyle: null,// Flag for responsive behaviour.
		init: function() {
			COC.Tab.makeResponsive();
			COC.Tab.resize();
		},
		// Based on the window width, determine whether to show the tabs as tabs
		// or as accordions (for mobile).
		makeResponsive: function() {
			if( window.innerWidth >= 768 ) {
				// Convert to tabStyle if they're not already.
				if( !COC.Tab.isTabStyle ) {
					COC.Tab.convertToTabStyle();
				}
				// use on the vertical tab
				$(".cui.tab-container").each(function () {
					var newTab = $('.tab-container');
					if (newTab.hasClass( 'vertical-tab' )){
						var tabsHeight = $(this).find('.tab-nav').height();
						$(this).find('.tab-panel').css('min-height', tabsHeight + 2);
						//alert($(this).find('.tab-nav').height());
					} 
				});
			}
			else {
				// Convert to accordionStyle if they're not already.
				if( COC.Tab.isTabStyle || COC.Tab.isTabStyle === null ) {
					COC.Tab.convertToAccordionStyle()
				}
			}
		},
		convertToTabStyle: function() {
			COC.Tab.isTabStyle = true;

			var wrapper = $( COC.Tab.selector.wrapper );
			// Reset tabs if they are being converted from accordion style.
			if( wrapper.find( COC.Accordion.selector.panel ).length ) {
				// Remove the .collapsible divs that came from the accordion style.
				wrapper.find( COC.Accordion.selector.panel + ' > ' + COC.Tab.selector.panel ).unwrap();

				// Remove buttons from the title-bar.
				wrapper.find( COC.Accordion.selector.title + ' > button' ).contents().unwrap();
			}
			wrapper.each( function() {
				COC.Tab.initSingle( $( this ) );
			});
		},
		convertToAccordionStyle: function() {
			COC.Tab.isTabStyle = false;

			var wrapper = $( COC.Tab.selector.wrapper );
			// Reset the tab panels.
			if( wrapper.find( COC.Tab.selector.panel ) ) {
				wrapper.find( COC.Tab.selector.panel ).removeAttr( 'role' );
			}
			// Inititalize each accordion title.
			wrapper.find( COC.Accordion.selector.title ).each( function() {
				COC.Accordion.initSingle( $( this ) );
			});
		},
		initSingle: function( wrapper ) {
			wrapper = $( wrapper );
			var list = wrapper.find( COC.Tab.selector.linkList );
			var panels = wrapper.find( COC.Tab.selector.panel );

			COC.Tab.initList( list );
			COC.Tab.initContent( panels );
		},
		initList: function( list ) {
			list = $( list );

			// Add role attributes for accessibility.
			list.attr( 'role', 'tablist' );
			list.children( 'li' ).attr( 'role', 'presentation' );

			// Update each link within the list.
			// The first link will be selected and focusable.
			var links = list.find( 'button' );
			links.each( function( i ) {
				var isFirst = ( i === 0 );
				$( this ).attr({
					'role': 'tab',
					// Set the aria-control to equal the href target
					// (without the #).
					'aria-controls': $(this).attr('href').substring(1),
					'aria-selected': ( isFirst ? 'true' : 'false' ),
					'tabindex': ( isFirst ? '0' : '-1' )
				});
			});

			// Add a keydown listener on the links if not already done so.
			if( !list.data( 'keydownInited' ) ) {
				links.on( 'keydown', function( e ) {
					COC.Tab.linkKeydown( $( this ), e );
				});
				list.data( 'keydownInited', true );
			}

			// Add a click listener on the links if not already done so.
			if( !list.data( 'clickInited' ) ) {
				links.on( 'click', function( e ) {
					COC.Tab.linkClick( $( this ), e );
				});
				list.data( 'clickInited', true );
			}
		},
		initContent: function( panels ) {
			// Apply the role attribute and hide all but the first panel
			// to screen readers.
			panels.each( function( i ) {
				$( this ).attr({
					'role': 'tabpanel',
					'aria-hidden': ( i === 0 ? null : true )
				});

				// Make the first-child of each panel focusable.
				$( this ).find( '> *:first-child' ).attr({
					'tabindex': '0'
				});
			});

		},
		linkKeydown: function( link, e ) {
			// Define current, previous and next (possible) tabs
			var currentLink = $( link );
			var prevLink = currentLink.parents( 'li' ).prev().children( '[role="tab"]' );
			var nextLink = currentLink.parents( 'li' ).next().children( '[role="tab"]' );
			var targetLink;

			// Determine the key pressed.
			switch (e.keyCode) {
				case 13:
					// Enter key.
					currentLink.focus();
					targetLink = $( this );
					targetLink.setAttribute("aria-selected", true);
					break;
				case 37:
					// Left arrow key.
					targetLink = prevLink;
					break;
				case 39:
					// Right arrow key.
					targetLink = nextLink;
					break;
				default:
					targetLink = null;
					break;
			}

			if( targetLink ) {
				currentLink.attr({
					'tabindex': '-1',	
				});

				targetLink.attr({
					'tabindex': '0',
				}).focus();
			}
		},
		linkClick: function( link, e ) {
			e.preventDefault();
			var currentLink = $( link );
			var wrapper = currentLink.parents( COC.Tab.selector );

			// Remove focus and aria-selected from all other links in the wrapper.
			wrapper.closest('.tab-container').closest('.tab-container').find( '[role="tab"]' ).attr({
				'tabindex': '-1',
				'aria-selected': false
			});

			// Update the current link.
			currentLink.attr({
				'tabindex': '0',
				'aria-selected': true
			});

			// Hide all panels in the wrapper.
			wrapper.closest('.tab-container').closest('.tab-container').find( '[role="tabpanel"]' ).attr( 'aria-hidden', 'true' );

			// Show the corresponding panel for the current link.
			var targetPanel = currentLink.attr( 'href' );
			$( targetPanel ).attr( 'aria-hidden', null );
		},
		resize: function() {
			// The resize listener only has to be called once on init.
			$( window ).resize( function() {
				clearTimeout( COC.Tab.event.resizeTimeout );
				COC.Tab.event.resizeTimeout = setTimeout( function() {
					COC.Tab.makeResponsive();
				});
			}), 100;
		}

	};// End of COC.Tab{}

	window.COC = COC;

	$( document ).ready( function() {
		COC.Accordion.init();
		COC.Tab.init();
	});

}( jQuery, window, document ));


/**
* Shows or Hides all accordions on the page
*/
function ShowHideAll(container, targetState) {
    var displayState;

    // What do we want to set display to?
    if (targetState == "show") {
        displayState = "block";
        $(container).find('.title-bar').each(function (index) {
			$(this).next().css("display", "block" );
			$(this).next().attr("aria-hidden", false);
			$(this).children().attr("aria-expanded", true);
		});
    } else {
        displayState = "none";
        $(container).find('.title-bar').each(function (index) {
			$(this).next().css("display", "none" );
			$(this).next().attr("aria-hidden", true);
			$(this).children().attr("aria-expanded", false);
        });
    }
}

/**
* Shows a specific tab if there is a hash tag in the URL
*/
$(document).ready( function() {
	if(window.location.hash) {
		var activeTab = window.location.hash.substring(1);
	
		setTimeout(function () {
			$("ul li button[href*=\\#" + activeTab + "]").click();
		}, 1);
	}
});
