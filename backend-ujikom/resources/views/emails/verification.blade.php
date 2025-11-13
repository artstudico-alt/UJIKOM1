@component('mail::layout')
{{-- Header --}}
@slot('header')
@component('mail::header', ['url' => config('app.url')])
{{ config('app.name') }}
@endcomponent
@endslot

{{-- Body --}}
# Verifikasi Email Anda

Halo {{ $user->name }},

Terima kasih telah mendaftar di {{ config('app.name') }}. Silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini:

@component('mail::button', ['url' => $verificationUrl])
Verifikasi Email
@endcomponent

Atau salin dan tempel URL berikut ke browser Anda:

{{ $verificationUrl }}

Link verifikasi ini akan kedaluwarsa dalam 5 menit.

Jika Anda tidak membuat akun ini, Anda dapat mengabaikan email ini.

Salam,
{{ config('app.name') }}

{{-- Footer --}}
@slot('footer')
@component('mail::footer')
© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
@endcomponent
@endslot
@endcomponent
