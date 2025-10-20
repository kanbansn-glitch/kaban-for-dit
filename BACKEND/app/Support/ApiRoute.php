<?php

namespace App\Support;

use Illuminate\Support\Facades\Route;
use InvalidArgumentException;

class ApiRoute
{
    /**
     * Supported HTTP verbs for quick registration.
     *
     * @var array<int, string>
     */
    protected const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'any'];

    /**
     * Declare a public (no auth middleware) API endpoint.
     */
    public static function public(string $method, string $uri, string $controller, string $action, array $options = []): void
    {
        static::register($method, $uri, $controller, $action, $options);
    }

    /**
     * Declare a Sanctum-protected API endpoint.
     */
    public static function protected(string $method, string $uri, string $controller, string $action, array $options = []): void
    {
        $options['middleware'] = static::mergeMiddleware(['auth:sanctum'], $options['middleware'] ?? []);

        static::register($method, $uri, $controller, $action, $options);
    }

    /**
     * Base route registration logic.
     */
    protected static function register(string $method, string $uri, string $controller, string $action, array $options = []): void
    {
        $httpMethod = strtolower($method);

        if (! in_array($httpMethod, static::METHODS, true)) {
            throw new InvalidArgumentException(sprintf('Unsupported HTTP method [%s].', $method));
        }

        $uri = ltrim($uri, '/');

        $route = Route::$httpMethod($uri, [$controller, $action]);

        $middleware = static::normalizeMiddleware($options['middleware'] ?? []);

        if (! empty($middleware)) {
            $route->middleware($middleware);
        }

        if (! empty($options['name'])) {
            $route->name($options['name']);
        }
    }

    /**
     * Normalize middleware into a clean array.
     *
     * @param  array|string|null  $middleware
     * @return array<int, string>
     */
    protected static function normalizeMiddleware(array|string|null $middleware): array
    {
        if (is_null($middleware) || $middleware === '') {
            return [];
        }

        $middleware = is_array($middleware) ? $middleware : [$middleware];

        return array_values(array_filter($middleware, fn ($name) => $name !== null && $name !== ''));
    }

    /**
     * Merge base middleware with additional ones.
     *
     * @param  array<int, string>  $base
     * @param  array|string|null  $additional
     * @return array<int, string>
     */
    protected static function mergeMiddleware(array $base, array|string|null $additional): array
    {
        return array_values(array_unique(array_merge(
            $base,
            static::normalizeMiddleware($additional)
        )));
    }
}
