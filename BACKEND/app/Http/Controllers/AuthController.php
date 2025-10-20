<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected function emailVerificationEnabled(): bool
    {
        return (bool) config('auth.email_verification', false);
    }

    protected function createAuthResponse(User $user, string $message = 'Login successful.'): array
    {
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'success' => true,
            'message' => $message,
            'data' => [
                'user' => $user,
                'token' => $token,
                'requires_verification' => false,
            ],
        ];
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if ($this->emailVerificationEnabled()) {
            event(new Registered($user));

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully. Please verify your email address.',
                'data' => [
                    'user' => $user,
                    'token' => null,
                    'requires_verification' => true,
                ],
            ], 201);
        }

        return response()->json(
            $this->createAuthResponse($user, 'User registered successfully.'),
            201
        );
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.'],
            ]);
        }

        if ($this->emailVerificationEnabled() && ! $user->hasVerifiedEmail()) {
            $exception = ValidationException::withMessages([
                'email' => ['Veuillez vérifier votre adresse e-mail avant de vous connecter.'],
            ]);

            $exception->status = 403;

            throw $exception;
        }

        return response()->json($this->createAuthResponse($user));
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout successful.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
            ],
        ]);
    }
}
