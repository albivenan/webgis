<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kependudukan extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_kk',
        'jumlah_anggota_keluarga',
        // tambahkan kolom lain yang relevan di sini
    ];
}
