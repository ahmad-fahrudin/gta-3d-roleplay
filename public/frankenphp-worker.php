<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

ignore_user_abort(true);

// Register Composer autoloader
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel Application
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$handler = static function () use ($app) {
    $request = Request::capture();
    $response = $app->handleRequest($request);
    $response->send();
    $app->terminate($request, $response);
};

$maxRequests = (int) ($_SERVER['MAX_REQUESTS'] ?? 500);
for ($nbRequests = 0; !$maxRequests || $nbRequests < $maxRequests; ++$nbRequests) {
    $keepRunning = \frankenphp_handle_request($handler);

    gc_collect_cycles();

    if (!$keepRunning) {
        break;
    }
}
