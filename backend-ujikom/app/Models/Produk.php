<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produk extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'deskripsi',
        'harga',
        'stok',
        'gambar'
    ];

    protected $dates = ['deleted_at'];
}
