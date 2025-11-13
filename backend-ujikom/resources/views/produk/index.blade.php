@extends('layouts.app')

@section('title', 'Daftar Produk')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Daftar Produk</h2>
    <a href="{{ route('produk.create') }}" class="btn btn-primary">Tambah Produk</a>
</div>

<div class="table-responsive">
    <table class="table table-striped">
        <thead class="table-dark">
            <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Gambar</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($produks as $produk)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $produk->kode_produk }}</td>
                <td>{{ $produk->nama_produk }}</td>
                <td>Rp {{ number_format($produk->harga, 0, ',', '.') }}</td>
                <td>{{ $produk->stok }}</td>
                <td>
                    @if($produk->gambar)
                        <img src="{{ asset($produk->gambar) }}" alt="{{ $produk->nama_produk }}" width="50">
                    @else
                        -
                    @endif
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <a href="{{ route('produk.show', $produk->id) }}" class="btn btn-info btn-sm">Lihat</a>
                        <a href="{{ route('produk.edit', $produk->id) }}" class="btn btn-warning btn-sm">Edit</a>
                        <form action="{{ route('produk.destroy', $produk->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus produk ini?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger btn-sm">Hapus</button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="text-center">Tidak ada data produk.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    {{ $produks->links() }}
</div>
@endsection
