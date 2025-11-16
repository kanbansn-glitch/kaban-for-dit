<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModelOwnership
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->user()?->id;

        if ($userId) {
            $route = $request->route();

            foreach ($route?->parameters() ?? [] as $parameter) {
                if (is_object($parameter) && method_exists($parameter, 'belongsToUser')) {
                    if (! $parameter->belongsToUser($userId)) {
                        abort(Response::HTTP_FORBIDDEN, 'You are not allowed to access this resource.');
                    }
                }
            }
        }

        return $next($request);
    }
}
