@component('mail::layout')
{{-- Header --}}
@slot('header')
@component('mail::header', ['url' => config('app.url')])
{{ config('app.name') }}
@endcomponent
@endslot

{{-- Body --}}
# Reset Password

Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.

Silakan klik tombol di bawah ini untuk mereset password Anda:

@component('mail::button', ['url' => $resetUrl])
Reset Password
@endcomponent

Atau salin dan tempel URL berikut ke browser Anda:

{{ $resetUrl }}

Link reset password ini akan kedaluwarsa dalam 60 menit.

Jika Anda tidak meminta reset password, tidak perlu ada tindakan lebih lanjut.

Salam,
{{ config('app.name') }}

{{-- Footer --}}
@slot('footer')
@component('mail::footer')
© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
@endcomponent
@endslot
@endcomponent
