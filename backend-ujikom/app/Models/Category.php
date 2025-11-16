<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'kategori_kegiatan';

    protected $fillable = [
        'nama_kategori',
        'slug',
        'kategori_logo',
        'deskripsi',
        'is_active',
    ];

    public function events()
    {
        return $this->hasMany(Event::class, 'category_id');
    }
}
