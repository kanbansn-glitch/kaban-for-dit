<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GoogleAuthController extends Controller
{
    protected function isEnabled(): bool
    {
        $clientId = config('services.google.client_id');

        return config('services.google.enabled', false) && ! empty($clientId);
    }

    protected function ensureEnabled(): void
    {
        if (! $this->isEnabled()) {
            abort(404);
        }
    }

    public function config(): JsonResponse
    {
        $enabled = $this->isEnabled();

        return response()->json([
            'success' => true,
            'data' => [
                'enabled' => $enabled,
                'client_id' => $enabled ? config('services.google.client_id') : null,
            ],
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $this->ensureEnabled();

        $data = $request->validate([
            'credential' => 'required|string',
        ]);

        $payload = $this->verifyCredential($data['credential']);

        $user = $this->findOrCreateUser($payload);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion Google réussie.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'requires_verification' => false,
                'provider' => 'google',
                'is_social_login' => true,
            ],
        ]);
    }

    /**
     * @param  string  $credential  Google ID token
     * @return array<string, mixed>
     */
    protected function verifyCredential(string $credential): array
    {
        try {
            $response = Http::acceptJson()->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $credential,
            ]);
        } catch (ConnectionException) {
            throw ValidationException::withMessages([
                'credential' => ['Connexion à Google impossible. Réessayez plus tard.'],
            ]);
        }

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'credential' => ['Jeton Google invalide ou expiré.'],
            ]);
        }

        $payload = $response->json();

        $clientId = config('services.google.client_id');

        if (! isset($payload['aud']) || $payload['aud'] !== $clientId) {
            throw ValidationException::withMessages([
                'credential' => ['Jeton Google non reconnu pour cette application.'],
            ]);
        }

        if (! isset($payload['email'])) {
            throw ValidationException::withMessages([
                'credential' => ['Adresse e-mail introuvable dans la réponse Google.'],
            ]);
        }

        if (($payload['email_verified'] ?? 'false') !== 'true') {
            throw ValidationException::withMessages([
                'credential' => ["Google n'a pas confirmé cette adresse e-mail."],
            ]);
        }

        if (isset($payload['iss']) && ! in_array($payload['iss'], ['accounts.google.com', 'https://accounts.google.com'], true)) {
            throw ValidationException::withMessages([
                'credential' => ['Réponse Google rejetée : émetteur invalide.'],
            ]);
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function findOrCreateUser(array $payload): User
    {
        $email = $payload['email'];
        $name = trim((string) ($payload['name'] ?? ''));

        $user = User::query()->firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->name = $name !== '' ? $name : (string) Str::of($email)->before('@')->title();
            $user->password = Str::random(40);
            $user->email_verified_at = now();
            $user->save();

            return $user->fresh();
        }

        $updates = [];

        if (empty($user->name) && $name !== '') {
            $updates['name'] = $name;
        }

        if (! $user->hasVerifiedEmail()) {
            $updates['email_verified_at'] = now();
        }

        if (! empty($updates)) {
            $user->forceFill($updates)->save();
        }

        return $user->fresh();
    }
}
