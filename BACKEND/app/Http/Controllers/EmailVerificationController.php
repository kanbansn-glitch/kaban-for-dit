<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class EmailVerificationController extends Controller
{
    protected function ensureEnabled(): void
    {
        if (! config('auth.email_verification', false)) {
            abort(Response::HTTP_NOT_FOUND);
        }
    }

    public function verify(Request $request, string $id, string $hash): JsonResponse|RedirectResponse
    {
        $this->ensureEnabled();

        if (! URL::hasValidSignature($request)) {
            abort(Response::HTTP_FORBIDDEN, 'Lien de vérification invalide ou expiré.');
        }

        $user = User::query()->findOrFail($id);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            abort(Response::HTTP_FORBIDDEN, 'Lien de vérification invalide.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Adresse e-mail vérifiée avec succès.',
            ]);
        }

        return redirect()->away($this->buildRedirectUrl($request, $user));
    }

    public function resend(Request $request): JsonResponse
    {
        $this->ensureEnabled();

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Adresse e-mail déjà vérifiée.',
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'success' => true,
            'message' => 'Un nouveau lien de vérification a été envoyé.',
        ]);
    }

    public function request(Request $request): JsonResponse
    {
        $this->ensureEnabled();

        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if ($user && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'success' => true,
            'message' => 'Si un compte existe pour cette adresse, un e-mail de vérification a été envoyé.',
        ]);
    }

    protected function buildRedirectUrl(Request $request, User $user): string
    {
        $base = rtrim($request->query('redirect', config('app.frontend_url')), '/');
        $status = $user->hasVerifiedEmail() ? 'success' : 'already-verified';

        return sprintf('%s/verify-email?status=%s', $base, $status);
    }
}
