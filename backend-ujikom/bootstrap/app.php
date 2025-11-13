<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables;

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Load Composer's autoloader
require __DIR__.'/../vendor/autoload.php';

// Create the application
$app = new Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// Load environment variables
(new LoadEnvironmentVariables())->bootstrap($app);

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
*/

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
*/

return $app;
