<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DokuPaymentService
{
    private string $clientId;
    private string $secretKey;
    private string $baseUrl;
    private ?string $accessToken = null;

    public function __construct()
    {
        $this->clientId = config('services.doku.client_id') ?? 'MOCK_CLIENT_ID';
        $this->secretKey = config('services.doku.secret_key') ?? 'MOCK_SECRET_KEY';
        $this->baseUrl = config('services.doku.base_url') ?? 'https://api-sandbox.doku.com';
    }

    /**
     * Get access token from DOKU
     */
    private function getAccessToken(): string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        try {
            $response = Http::asForm()->post("{$this->baseUrl}/v1/auth/token", [
                'client_id' => $this->clientId,
                'client_secret' => $this->secretKey,
                'grant_type' => 'client_credentials',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->accessToken = $data['access_token'];
                return $this->accessToken;
            }

            throw new \Exception('Failed to get access token: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('DOKU Auth Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create payment request
     */
    public function createPayment(array $data): array
    {
        // Return mock response for development if DOKU not configured
        if ($this->clientId === 'MOCK_CLIENT_ID') {
            Log::warning('DOKU not configured, returning mock payment response');
            return $this->getMockPaymentResponse($data);
        }

        $token = $this->getAccessToken();

        $payload = [
            'order' => [
                'invoice_number' => $data['invoice_number'],
                'amount' => $data['amount'],
                'currency' => 'IDR',
            ],
            'payment' => [
                'payment_method' => $data['payment_method'], // VA, EWALLET, QRIS, CC
            ],
            'customer' => [
                'name' => $data['customer_name'],
                'email' => $data['customer_email'],
                'phone' => $data['customer_phone'] ?? '',
            ],
            'additional_info' => [
                'integration' => [
                    'name' => 'GOMOMENT',
                    'version' => '1.0',
                ],
            ],
        ];

        // Add payment channel if specified
        if (isset($data['payment_channel'])) {
            $payload['payment']['payment_channel'] = $data['payment_channel'];
        }

        // Add callback URLs
        $payload['additional_info']['callback_url'] = config('app.url') . '/api/payments/callback';
        $payload['additional_info']['redirect_url'] = config('services.doku.redirect_url');

        try {
            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/v1/payment/create", $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('DOKU Create Payment Error: ' . $response->body());
            throw new \Exception('Failed to create payment: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('DOKU Payment Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get mock payment response for development
     */
    private function getMockPaymentResponse(array $data): array
    {
        return [
            'transaction_id' => 'MOCK-' . strtoupper(substr(md5(uniqid()), 0, 16)),
            'payment_code' => strtoupper(substr($data['payment_channel'], 0, 3)) . time(),
            'payment_url' => config('app.url') . '/payment/mock/' . $data['invoice_number'],
            'qr_code_url' => null,
            'instructions' => [
                'Bank Transfer',
                '1. Login ke mobile banking',
                '2. Pilih Transfer',
                '3. Masukkan nomor VA',
                '4. Konfirmasi pembayaran',
            ],
            'status' => 'PENDING',
            'expiry_time' => Carbon::now()->addHours(24)->toIso8601String(),
        ];
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus(string $invoiceNumber): array
    {
        // Return mock status for development
        if ($this->clientId === 'MOCK_CLIENT_ID') {
            Log::warning('DOKU not configured, returning mock status');
            return [
                'status' => 'PENDING',
                'invoice_number' => $invoiceNumber,
            ];
        }

        $token = $this->getAccessToken();

        try {
            $response = Http::withToken($token)
                ->get("{$this->baseUrl}/v1/payment/status/{$invoiceNumber}");

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception('Failed to check payment status: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('DOKU Check Status Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify callback signature
     */
    public function verifySignature(array $data): bool
    {
        $expectedSignature = hash('sha256',
            $data['amount'] .
            $this->clientId .
            $data['invoice_number'] .
            $this->secretKey
        );

        return hash_equals($expectedSignature, $data['signature'] ?? '');
    }

    /**
     * Generate signature for request
     */
    public function generateSignature(string $invoiceNumber, float $amount): string
    {
        return hash('sha256',
            $amount .
            $this->clientId .
            $invoiceNumber .
            $this->secretKey
        );
    }

    /**
     * Get available payment methods
     */
    public function getPaymentMethods(): array
    {
        return [
            'virtual_account' => [
                'name' => 'Virtual Account',
                'channels' => [
                    'bca' => 'BCA Virtual Account',
                    'mandiri' => 'Mandiri Virtual Account',
                    'bni' => 'BNI Virtual Account',
                    'bri' => 'BRI Virtual Account',
                    'permata' => 'Permata Virtual Account',
                ],
                'fee' => 4000,
            ],
            'ewallet' => [
                'name' => 'E-Wallet',
                'channels' => [
                    'ovo' => 'OVO',
                    'dana' => 'DANA',
                    'linkaja' => 'LinkAja',
                    'shopeepay' => 'ShopeePay',
                ],
                'fee_percentage' => 2.5,
            ],
            'qris' => [
                'name' => 'QRIS',
                'channels' => [
                    'qris' => 'QRIS (All E-Wallet)',
                ],
                'fee_percentage' => 0.7,
            ],
        ];
    }

    /**
     * Calculate total amount with fee
     */
    public function calculateTotalAmount(float $baseAmount, string $paymentMethod, ?string $channel = null): array
    {
        $methods = $this->getPaymentMethods();
        $fee = 0;

        if (isset($methods[$paymentMethod])) {
            if (isset($methods[$paymentMethod]['fee'])) {
                $fee = $methods[$paymentMethod]['fee'];
            } elseif (isset($methods[$paymentMethod]['fee_percentage'])) {
                $fee = $baseAmount * ($methods[$paymentMethod]['fee_percentage'] / 100);
            }
        }

        return [
            'base_amount' => $baseAmount,
            'fee' => $fee,
            'total_amount' => $baseAmount + $fee,
        ];
    }
}
