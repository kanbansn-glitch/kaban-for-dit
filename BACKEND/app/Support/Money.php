<?php

namespace App\Support;

class Money
{
    /**
     * Round any numeric value using a single strategy (half up) so all APIs stay consistent.
     */
    public static function round(float|int|string|null $value, int $precision = 2): float
    {
        if ($value === null) {
            return 0.0;
        }

        return round((float) $value, $precision, PHP_ROUND_HALF_UP);
    }
}
