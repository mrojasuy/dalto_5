<?php

require_api( 'authentication_api.php' );
require_api( 'form_api.php' );
require_api( 'gpc_api.php' );

auth_ensure_user_authenticated();

form_security_validate( 'plugin_ModoDaltonico_toggle' );

$t_active = gpc_get_string( 'active', '' );

$t_valid = in_array( $t_active, array( 'on', 'off' ), true );

form_security_purge( 'plugin_ModoDaltonico_toggle' );

header( 'Content-Type: application/json; charset=utf-8' );

if( $t_valid ) {
	echo json_encode( array( 'ok' => true ) );
} else {
	echo json_encode( array( 'ok' => false ) );
}
