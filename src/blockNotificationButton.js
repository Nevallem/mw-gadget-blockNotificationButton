/**
 * Adds a button to notify a user after blocking
 *
 * @author [[pt:User:!Silent]]
 * @date 13/apr/2012
 * @updated 17/apr/2021
 */
/* global $, mw */
/* jshint laxbreak:true, esversion:6 */

( function () {
'use strict';

mw.messages.set( {
	// General
	'bbn-buttonText': 'Enviar uma notificação de bloqueio',
	'bbn-checkingBlockRegister': 'Consultando os registros de bloqueio do usuário...',
	'bbn-editUserDiscussion': 'Editando a página de discussão do usuário...',
	'bbn-sectionTitle': 'Notificação de bloqueio',
	'bbn-success': 'Mensagem de bloqueio enviada com sucesso (<a href="$1#Notifica.C3.A7.C3.A3o_de_bloqueio">Abrir</a>).',
	'bbn-successBlock': 'Bloqueio bem sucedido',

	// Errors
	'bbn-apiError': 'Erro: a API retornou o código de erro "$1": $2',
	'bbn-unknownError': 'Erro: resultado desconhecido da API.',
	'bbn-requestFail': 'Erro: a requisão falhou.',
} );

// Messages
// @param {string} name Name of the message
// @param {string|number} [$N] Dynamic parameters to the message (i.e. values for $1, $2, etc)
// @return {string}
function message( /*name[, $1[, $2[, ... ]]]*/ ) {
	return mw.message.apply( undefined, arguments ).plain();
}

// Translates to portuguese the block duration
// @param {string} duration Block duration
// @return {string}
function bbn_translateDuration( duration ) {
	let translation;

	duration = duration.split( ' ' );

	if ( duration[ 0 ].search( /in(?:de)?finit[ey]/ ) !== -1 ) {
		return 'tempo indeterminado';
	}

	translation = {
		'second': 'segundo',
		'minute': 'minuto',
		'hour': 'hora',
		'day': 'dia',
		'week': 'semana',
		'month': 'mês',
		'year': 'ano'
	};

	if ( duration[ 0 ] !== '1' ) {
		translation.month = 'meses';
	}

	return duration[ 0 ] + ' '
		+ translation[ duration[ 1 ].replace( /s$/, '' ) ]
		+ ( ( translation.month === 'meses' && duration[ 1 ].indexOf( 'month' ) === -1 ) ? 's' : '' );
}

// Send the notify
// @return {undefined}
function bbn_sendNotify() {
	let logevents,
		userNameBlocked = $( '#mw-content-text' ).find( 'a' ).html();

	mw.notify( message( 'bbn-checkingBlockRegister' ) );

	$.getJSON( mw.util.wikiScript( 'api' ), {
		action: 'query',
		list: 'logevents',
		format: 'json',
		leprop: 'title|user|timestamp|details|comment',
		lelimit: '1',
		leuser: mw.config.get( 'wgUserName' ),
		letitle: 'User:' + userNameBlocked
	} ).done( function ( data ) {
		logevents = data.query.logevents[ 0 ];

		mw.notify( message( 'bbn-editUserDiscussion' ) );

		( new mw.Api() ).editPage( {
			title: 'User talk:' + userNameBlocked,
			section: 'new',
			watchlist: 'preferences',
			sectiontitle: message( 'bbn-sectionTitle' ),
			tags:'blockNotificationButton',
			text: '{{subst:Bloqueado' + ( !!logevents.params.restrictions
					? ' parcial'
					: ( ( logevents.params.flags.indexOf( 'nousertalk' ) === -1 ) ? '-disc' : '' )
				) + '|1=' + bbn_translateDuration( logevents.params.duration ) + '|2=' + logevents.comment + '.}} \~\~\~\~',
			summary: message( 'bbn-sectionTitle' ),
			done: {
				success: function () {
					mw.notify( $.parseHTML( message( 'bbn-success', mw.util.getUrl( 'User talk:' + userNameBlocked ) ) ) );
				},
				apiError: function ( data ) {
					mw.notify( message( 'bbn-apiError', data.code, data.info ) );
					$( '#bbn-sendMsg' ).attr( 'disabled', 'false' );
				},
				unknownError: function () {
					mw.notify( message( 'bbn-unknownError' ) );
					$( '#bbn-sendMsg' ).attr( 'disabled', 'false' );
				}
			}
		} ).fail( function () {
			mw.notify( message( 'bbn-requestFail' ) );
			$( '#bbn-sendMsg' ).attr( 'disabled', 'false' );
		} );
	} );
}

// Run the gadget
// @return {undefined}
function bbn_run() {
	if ( !$( '.mw-htmlform-submit' ).length ) {
		$( '#mw-content-text' ).append(
			$( `<input type="button" class="mw-ui-button mw-ui-progressive" id="bbn-sendMsg" value="${ message( 'bbn-buttonText' ) }" />` ).on( 'click', function () {
				bbn_sendNotify();
				$( this ).attr( 'disabled', 'true' );
			} )
		);
	}
}
  
if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Block' ) {
	$( bbn_run );
}

}() );
