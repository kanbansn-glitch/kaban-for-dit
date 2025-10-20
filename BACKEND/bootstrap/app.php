<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prependToGroup('api', HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        if (config('app.debug')) {
            $exceptions->render(function (\Throwable $exception, $request) {
                if (! $request->is('api/*') && ! $request->expectsJson()) {
                    return null;
                }

                $status = $exception instanceof HttpExceptionInterface
                    ? $exception->getStatusCode()
                    : 500;

                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage() ?: 'Server error.',
                    'exception' => get_class($exception),
                    'file' => sprintf('%s:%d', $exception->getFile(), $exception->getLine()),
                    'trace' => array_slice($exception->getTrace(), 0, 5),
                ], $status);
            });

            return;
        }

        $exceptions->render(function (ValidationException $exception, $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: 'Unauthenticated.',
            ], 401);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            $status = $exception->getStatusCode();

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: (HttpResponse::$statusTexts[$status] ?? 'HTTP error.'),
            ], $status, $exception->getHeaders());
        });

        $exceptions->render(function (\Throwable $exception, $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            $payload = [
                'success' => false,
                'message' => 'Server error.',
            ];

            if (config('app.debug')) {
                $payload['error'] = $exception->getMessage();
            }

            return response()->json($payload, 500);
        });
    })->create();
