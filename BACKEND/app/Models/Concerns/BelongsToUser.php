<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

/**
 * Trait to centralize "user owned" model concerns.
 *
 * @mixin \Illuminate\Database\Eloquent\Model
 */
trait BelongsToUser
{
    /**
     * Automatically set the owning user when missing.
     */
    protected static function bootBelongsToUser(): void
    {
        static::creating(function ($model): void {
            if (! $model->user_id && Auth::id()) {
                $model->user_id = Auth::id();
            }
        });
    }

    /**
     * Scope queries to the authenticated (or given) user.
     */
    public function scopeForUser(Builder $query, ?int $userId = null): Builder
    {
        $userId ??= $this->resolveAuthenticatedUserId();

        if (! $userId) {
            return $query;
        }

        return $query->where($this->qualifyColumn('user_id'), $userId);
    }

    /**
     * Simple helper to compare ownership.
     */
    public function belongsToUser(?int $userId): bool
    {
        return $userId !== null && (int) $this->user_id === (int) $userId;
    }

    /**
     * Enforce ownership during route model binding.
     */
    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        $userId = $this->resolveAuthenticatedUserId();

        if ($userId) {
            $query->where($this->qualifyColumn('user_id'), $userId);
        }

        return parent::resolveRouteBindingQuery($query, $value, $field);
    }

    protected function resolveAuthenticatedUserId(): ?int
    {
        $guards = array_filter([
            config('auth.defaults.guard'),
            'sanctum',
        ]);

        foreach ($guards as $guard) {
            $authGuard = Auth::guard($guard);

            if ($authGuard->check()) {
                return (int) $authGuard->id();
            }

            $user = $authGuard->user();

            if ($user) {
                return (int) $user->getAuthIdentifier();
            }
        }

        $user = request()->user();

        return $user?->getAuthIdentifier();
    }
}
