/**
 * coc.table.js v1.8
 * Pattern Library table functions
 * @dependency: jquery-3.5.1
 *
 * Provides the responsive functionality for 'normal' and 'stacked' tables.
 * See Pattern Library > UI Elements > Tables for required HTML markup and
 * usage information.
 */

(function ( $, window, document ) {
	'use strict';
	var COC = window.COC || {};
	COC.Table = {
		init: function() {
			COC.Table.normal.init();
			COC.Table.stacked.init();
		},
		/**
		 * 'Normal' responsive tables
		 */
		normal: {
			selector: {
				table:        'table.normal-view:not(.custom-logic)',
				wrapper:      '.table-responsive-wrapper',
				scroller:     '[class*="table-responsive"]',
				message:      '.table-responsive-msg',
				overlayLeft:  '.overlay.left',
				overlayRight: '.overlay.right'
			},
			html: {
				wrapper:         '<div class="table-responsive-wrapper"></div>',
				scrollerDefault: '<div class="table-responsive"></div>',
				overlays:        '<div class="overlay left"></div>' +
				                 '<div class="overlay right"></div>',
				message:         '<div class="table-responsive-msg">' +
				                 '<span class="cicon-info-circle"></span>' +
				                 '&nbsp;Scroll sideways to see the full table.</div>'
			},
			event: {
				resizeTimeout:    null
			},
			getTableScrollers: function() {
				return $( COC.Table.normal.selector.table ).parent( COC.Table.normal.selector.scroller );
			},
			init: function() {
				$( COC.Table.normal.selector.table ).each( function() {
					// Check whether the table has a table scroller wrapper.
					if( !$( this ).parent().is( COC.Table.normal.selector.scroller ) ) {
						// Table doesn't have a wrapper. Add the default
						// wrapper dynamically.
						$( this ).wrap( COC.Table.normal.html.scrollerDefault );
					}
				});

				// Initialize the responsive table functionality for each table
				// scroller wrapper.
				COC.Table.normal.getTableScrollers().each( function() {
					COC.Table.normal.initSingle( $( this ) );
				});

				COC.Table.normal.setupResizeEvent();
			},
			initSingle: function( tableScroller ) {
				COC.Table.normal.renderUI( tableScroller );
				COC.Table.normal.setupScrollEvent( tableScroller );

				// Trigger initial scroll.
				tableScroller.scroll();
			},
			renderUI: function( tableScroller ) {
				// Render the wrapper and overlays.
				tableScroller.wrap( COC.Table.normal.html.wrapper );
				tableScroller.after( COC.Table.normal.html.overlays );

				// Check whether the message element exists.
				var wrapper = tableScroller.parent( COC.Table.normal.selector.wrapper );
				var message = wrapper.prev( COC.Table.normal.selector.message );
				if( !( message.length > 0 ) ) {
					// No message exists. Add the default message dynamically.
					wrapper.before( COC.Table.normal.html.message );
				}
			},
			/*
			 * When the tableScroller is scrolled, the left and right faded
			 * overlays will toggle on or off. The responsive table message will
			 * also toggle based on the scrollability of the tableScroller.
			 */
			setupScrollEvent: function( tableScroller ) {
				var wrapper = tableScroller.parent( COC.Table.normal.selector.wrapper );
				var overlayLeft = tableScroller.siblings( COC.Table.normal.selector.overlayLeft );
				var overlayRight = tableScroller.siblings( COC.Table.normal.selector.overlayRight );
				var message = wrapper.prev( COC.Table.normal.selector.message );
				var scrollWidth, tableWidth, scrollLeft;

				tableScroller.scroll( function() {
					// The scrollable area's scrollable width.
					scrollWidth = tableScroller[0].scrollWidth;
					// The scrollable area's frame width.
					tableWidth = tableScroller.innerWidth();
					// The amount scrolled from the left.
					scrollLeft = this.scrollLeft;

					// Determine whether the area is scrollable.
					if( ( scrollWidth - tableWidth >= -1 ) && ( scrollWidth - tableWidth <= 1) ) {
						// Area is NOT scrollable. Hide the message and overlays.
						message.hide();
						overlayLeft.hide();
						overlayRight.hide();
					}
					else {
						// Area IS scrollable. Show the message and overlays.
						message.show();

						if( scrollLeft === 0 ) {
							// Reached the very left of the scrollable area.
							overlayLeft.hide();
							overlayRight.show();
						}
						else if( scrollWidth - tableWidth === scrollLeft ) {
							// Reached the very right of the scrollable area.
							overlayLeft.show();
							overlayRight.hide();
						}
						else {
							// Both sides have more content to see.
							overlayLeft.show();
							overlayRight.show();
						}
					}
				});
			},
			/**
			 * On resize, trigger the scroll event on all tableScrollers to
			 * update their displays.
			 * Note that the table scrollers are not passed in as an arg.
			 * This will ensure any tableScrollers dynamically added will be
			 * captured as well.
			 */
			setupResizeEvent: function() {
				$( window ).resize( function() {
					clearTimeout( COC.Table.normal.event.resizeTimeout );
					COC.Table.normal.event.resizeTimeout = setTimeout( function() {
						COC.Table.normal.update();
					}, 100 );
				});
			},
			update: function() {
				COC.Table.normal.getTableScrollers().scroll();
			}
		},
		/**
		 * 'Stacked' responsive tables
		 */
		stacked: {
			selector: {
				table: 'table.cui:not(.custom-logic)'
			},
			init: function() {
				$( COC.Table.stacked.selector.table ).each( function() {
					COC.Table.stacked.initSingle( $( this ) );
				});
			},
			initSingle: function( table ) {
				COC.Table.stacked.setScope( table );
				COC.Table.stacked.renderTableLabels( table );
			},
			setScope: function( table ) {
				// Set all <th> elements under <thead> to have scope="col" to be
				// accessible for screen readers.
				table.find( 'thead th' ).attr( 'scope', 'col' );

				// Set all <th> elements under <tbody> to have scope="row" to be
				// accessible for screen readers.
				table.find( 'tbody th' ).attr( 'scope', 'row' );
			},
			/**
			 * Adds a .table-label span to each table cell in the <tbody>.
			 * The .table-label text correlates to the associating <th> in the
			 * <thead>. The .table-label is hidden for desktop users and will
			 * only be shown on mobile-sizes screens or if the stacked
			 * (for all screens) variant is used. It will not be shown for the
			 *  normal responsive view.
			 */
			renderTableLabels: function( table ) {
				var labels = [];
				var tableHeader, tableRow, tableCells, tableCell;

				// Loop through all table headers.
				table.find( 'thead th' ).each( function() {
					tableHeader = $( this );
					// Add the <th> content to the labels array.
					// If the <th> has the .label-off class, use an empty
					// string.
					labels.push( !tableHeader.hasClass( 'label-off' ) ? tableHeader.html().trim() : '' );
				});

				// Loop through all table body rows.
				table.find( 'tbody tr' ).each( function() {
					tableRow = $( this );
					tableCells = tableRow.find( 'th, td' );

					// Loop through the cells.
					tableCells.each( function( i ) {
						tableCell = $( this );
						// Prepend the label to the cell, if applicable.
						if( labels.length > i && labels[i] !== '' && tableCell.find(".table-label").length == 0 ) {
							tableCell.prepend( '<span class="table-label" aria-hidden="true">' + labels[i] + ': </span>' );
						}
					});
				});
			}
		}
	};// End of COC.Table{}

	window.COC = COC;

	$( document ).ready( function() {
		COC.Table.init();
	});

}( jQuery, window, document ));
