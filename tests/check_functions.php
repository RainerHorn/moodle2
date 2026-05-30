<?php
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
global $DB;
$rows = $DB->get_records_sql('SELECT name FROM {external_functions} WHERE name LIKE ?', ['local_aicoursecreator%']);
foreach ($rows as $r) {
    echo $r->name . PHP_EOL;
}
