<?php
/* config.user.inc.php */

$i = 0;

/* Serveur 1 */
$i++;
$cfg['Servers'][$i]['host'] = 'db1';
$cfg['Servers'][$i]['auth_type'] = 'cookie';


$i++;
$cfg['Servers'][$i]['host'] = 'mysql';
$cfg['Servers'][$i]['auth_type'] = 'cookie';

?>
