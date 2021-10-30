/**
 * Block Notification Button
 *
 * @desc Adds a button to notify a user after blocking
 * @author [[pt:User:!Silent]]
 * @date 13/apr/2012
 * @updated 29/oct/2021
 */
/* global mw */

( function () {
'use strict';

if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Block' ) {
	mw.loader.load( '//pt.wikipedia.org/w/index.php?title=MediaWiki:Gadget-blockNotificationsButton.js/core.js&action=raw&ctype=text/javascript' );
}

}() );
