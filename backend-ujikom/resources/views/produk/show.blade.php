@extends('layouts.app')

@section('title', 'Detail Produk: ' . $produk->nama_produk)

@section('content')
<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h4>Detail Produk</h4>
        <div>
            <a href="{{ route('produk.index') }}" class="btn btn-secondary">Kembali</a>
            <a href="{{ route('produk.edit', $produk->id) }}" class="btn btn-warning">Edit</a>
            <form action="{{ route('produk.destroy', $produk->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus produk ini?')">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">Hapus</button>
            </form>
        </div>
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-4">
                @if($produk->gambar)
                    <img src="{{ asset($produk->gambar) }}" alt="{{ $produk->nama_produk }}" class="img-fluid rounded">
                @else
                    <div class="text-center py-5 bg-light rounded">
                        <i class="fas fa-image fa-5x text-muted"></i>
                        <p class="mt-2">Tidak ada gambar</p>
                    </div>
                @endif
            </div>
            <div class="col-md-8">
                <table class="table table-bordered">
                    <tr>
                        <th width="30%">Kode Produk</th>
                        <td>{{ $produk->kode_produk }}</td>
                    </tr>
                    <tr>
                        <th>Nama Produk</th>
                        <td>{{ $produk->nama_produk }}</td>
                    </tr>
                    <tr>
                        <th>Harga</th>
                        <td>Rp {{ number_format($produk->harga, 0, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <th>Stok</th>
                        <td>{{ $produk->stok }}</td>
                    </tr>
                    <tr>
                        <th>Deskripsi</th>
                        <td>{!! nl2br(e($produk->deskripsi)) ?: '<span class="text-muted">Tidak ada deskripsi</span>' !!}</td>
                    </tr>
                    <tr>
                        <th>Dibuat Pada</th>
                        <td>{{ $produk->created_at->format('d/m/Y H:i') }}</td>
                    </tr>
                    <tr>
                        <th>Diperbarui Pada</th>
                        <td>{{ $produk->updated_at->format('d/m/Y H:i') }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
