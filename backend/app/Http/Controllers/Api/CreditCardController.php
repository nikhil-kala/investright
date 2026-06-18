<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CreditCardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cards = $request->user()->creditCards()->where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'cards' => $cards->map(fn (CreditCard $card) => $this->formatCard($card)),
            'message' => 'Credit cards retrieved successfully',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'card_number' => ['required', 'string', 'min:13', 'max:19'],
            'card_holder_name' => ['required', 'string', 'max:255'],
            'expiry_month' => ['required', 'integer', 'min:1', 'max:12'],
            'expiry_year' => ['required', 'integer', 'min:'.date('Y')],
            'card_type' => ['nullable', Rule::in(['visa', 'mastercard', 'amex', 'discover'])],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();

        if ($user->creditCards()->where('is_active', true)->count() >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum 5 cards allowed',
            ], 422);
        }

        if ($validated['is_primary'] ?? false) {
            $user->creditCards()->update(['is_primary' => false]);
        }

        $card = $user->creditCards()->create([
            'card_number_masked' => $this->maskCardNumber($validated['card_number']),
            'card_holder_name' => $validated['card_holder_name'],
            'expiry_month' => $validated['expiry_month'],
            'expiry_year' => $validated['expiry_year'],
            'card_type' => $validated['card_type'] ?? $this->detectCardType($validated['card_number']),
            'is_primary' => $validated['is_primary'] ?? false,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'card' => $this->formatCard($card),
            'message' => 'Credit card added successfully',
        ], 201);
    }

    public function update(Request $request, CreditCard $creditCard): JsonResponse
    {
        $this->authorizeCard($request, $creditCard);

        $validated = $request->validate([
            'card_holder_name' => ['sometimes', 'string', 'max:255'],
            'expiry_month' => ['sometimes', 'integer', 'min:1', 'max:12'],
            'expiry_year' => ['sometimes', 'integer', 'min:'.date('Y')],
            'is_primary' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($validated['is_primary'] ?? false) {
            $request->user()->creditCards()->update(['is_primary' => false]);
        }

        $creditCard->update($validated);

        return response()->json([
            'success' => true,
            'card' => $this->formatCard($creditCard->fresh()),
            'message' => 'Credit card updated successfully',
        ]);
    }

    public function destroy(Request $request, CreditCard $creditCard): JsonResponse
    {
        $this->authorizeCard($request, $creditCard);
        $creditCard->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Credit card removed successfully',
        ]);
    }

    private function authorizeCard(Request $request, CreditCard $creditCard): void
    {
        if ($creditCard->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }

    private function maskCardNumber(string $number): string
    {
        $digits = preg_replace('/\D/', '', $number);

        return '**** **** **** '.substr($digits, -4);
    }

    private function detectCardType(string $number): string
    {
        $digits = preg_replace('/\D/', '', $number);

        return match (true) {
            str_starts_with($digits, '4') => 'visa',
            str_starts_with($digits, '5') => 'mastercard',
            str_starts_with($digits, '3') => 'amex',
            default => 'visa',
        };
    }

    private function formatCard(CreditCard $card): array
    {
        return [
            'id' => $card->id,
            'user_id' => $card->user_id,
            'card_number' => $card->card_number_masked,
            'card_holder_name' => $card->card_holder_name,
            'expiry_month' => $card->expiry_month,
            'expiry_year' => $card->expiry_year,
            'cvv' => '***',
            'card_type' => $card->card_type,
            'is_primary' => $card->is_primary,
            'is_active' => $card->is_active,
            'created_at' => $card->created_at?->toIso8601String(),
            'updated_at' => $card->updated_at?->toIso8601String(),
        ];
    }
}
