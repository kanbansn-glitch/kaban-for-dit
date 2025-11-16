<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SupplierController;
use App\Http\Middleware\EnsureModelOwnership;
use App\Support\ApiRoute;
use Illuminate\Support\Facades\Route;

ApiRoute::public('post', 'register', AuthController::class, 'register', [
    'name' => 'auth.register',
]);

ApiRoute::public('post', 'login', AuthController::class, 'login', [
    'name' => 'auth.login',
]);

ApiRoute::public('get', 'auth/google/config', GoogleAuthController::class, 'config', [
    'name' => 'auth.google.config',
]);

ApiRoute::public('post', 'login/google', GoogleAuthController::class, 'login', [
    'name' => 'auth.google.login',
]);

ApiRoute::public('post', 'email/verification-request', EmailVerificationController::class, 'request', [
    'name' => 'verification.request',
]);

ApiRoute::protected('post', 'logout', AuthController::class, 'logout', [
    'name' => 'auth.logout',
]);

ApiRoute::protected('get', 'me', AuthController::class, 'me', [
    'name' => 'auth.me',
]);

ApiRoute::protected('post', 'email/verification-notification', EmailVerificationController::class, 'resend', [
    'name' => 'verification.send',
    'middleware' => 'throttle:6,1',
]);

Route::middleware(['auth:sanctum', EnsureModelOwnership::class])->group(function () {
    Route::apiResource('products', ProductController::class)->except(['create', 'edit']);

    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');

    Route::apiResource('suppliers', SupplierController::class)->except(['create', 'edit']);
    Route::apiResource('stores', StoreController::class)->except(['create', 'edit']);
    Route::apiResource('orders', PurchaseOrderController::class)->except(['create', 'edit']);
    Route::apiResource('sales', SaleController::class)->only(['index', 'store', 'destroy']);

    Route::get('dashboard/summary', [DashboardController::class, 'summary']);

    Route::prefix('reports')->group(function () {
        Route::get('overview', [ReportsController::class, 'overview']);
        Route::get('best-categories', [ReportsController::class, 'bestCategories']);
        Route::get('profit-vs-revenue', [ReportsController::class, 'profitVsRevenue']);
        Route::get('best-products', [ReportsController::class, 'bestProducts']);
    });
});

Route::get('verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::options('{any}', fn () => response()->noContent())
    ->where('any', '.*')
    ->name('api.preflight');
