@extends('layouts.app')

@section('title', 'Edit Produk: ' . $produk->nama_produk)

@section('content')
<div class="card">
    <div class="card-header">
        <h4>Edit Produk</h4>
    </div>
    <div class="card-body">
        <form action="{{ route('produk.update', $produk->id) }}" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            
            <div class="mb-3">
                <label for="kode_produk" class="form-label">Kode Produk</label>
                <input type="text" class="form-control" id="kode_produk" value="{{ $produk->kode_produk }}" disabled>
            </div>
            
            <div class="mb-3">
                <label for="nama_produk" class="form-label">Nama Produk</label>
                <input type="text" class="form-control @error('nama_produk') is-invalid @enderror" 
                       id="nama_produk" name="nama_produk" value="{{ old('nama_produk', $produk->nama_produk) }}" required>
                @error('nama_produk')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-3">
                <label for="deskripsi" class="form-label">Deskripsi</label>
                <textarea class="form-control @error('deskripsi') is-invalid @enderror" 
                          id="deskripsi" name="deskripsi" rows="3">{{ old('deskripsi', $produk->deskripsi) }}</textarea>
                @error('deskripsi')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="harga" class="form-label">Harga</label>
                    <div class="input-group">
                        <span class="input-group-text">Rp</span>
                        <input type="number" class="form-control @error('harga') is-invalid @enderror" 
                               id="harga" name="harga" value="{{ old('harga', $produk->harga) }}" min="0" required>
                        @error('harga')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="col-md-6 mb-3">
                    <label for="stok" class="form-label">Stok</label>
                    <input type="number" class="form-control @error('stok') is-invalid @enderror" 
                           id="stok" name="stok" value="{{ old('stok', $produk->stok) }}" min="0" required>
                    @error('stok')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="mb-3">
                <label for="gambar" class="form-label">Gambar Produk</label>
                
                @if($produk->gambar)
                    <div class="mb-2">
                        <img src="{{ asset($produk->gambar) }}" alt="{{ $produk->nama_produk }}" class="img-thumbnail" style="max-width: 200px;">
                        <p class="text-muted mt-1">Gambar saat ini</p>
                    </div>
                @endif
                
                <input class="form-control @error('gambar') is-invalid @enderror" 
                       type="file" id="gambar" name="gambar" accept="image/*">
                @error('gambar')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
                <div id="gambarPreview" class="mt-2"></div>
                
                @if($produk->gambar)
                    <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" name="hapus_gambar" id="hapus_gambar" value="1">
                        <label class="form-check-label" for="hapus_gambar">
                            Hapus gambar saat ini
                        </label>
                    </div>
                @endif
            </div>

            <div class="d-flex justify-content-between">
                <a href="{{ route('produk.index') }}" class="btn btn-secondary">Batal</a>
                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
    // Preview gambar sebelum upload
    document.getElementById('gambar').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('gambarPreview');
                preview.innerHTML = `
                    <img src="${e.target.result}" class="img-thumbnail" style="max-width: 200px;">
                    <p class="mt-2">${file.name}</p>
                `;
            }
            reader.readAsDataURL(file);
        }
    });
</script>
@endpush
@endsection
