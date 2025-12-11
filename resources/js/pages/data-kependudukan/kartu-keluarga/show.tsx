import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Users, ImageOff } from 'lucide-react';

interface AnggotaKeluarga {
    id: number;
    nik: string;
    nama_lengkap: string;
    jenis_kelamin: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    status_perkawinan: string;
    pekerjaan: string;
    status_hubungan_dalam_keluarga: string;
    keterangan: string;
}

interface KartuKeluarga {
    id: number;
    nomor_kk: string;
    alamat: string;
    rt: string;
    rw: string;
    kode_pos: string;
    desa_kelurahan: string;
    kecamatan: string;
    kabupaten_kota: string;
    provinsi: string;
    foto_rumah?: string | null;
    anggota_keluarga?: AnggotaKeluarga[];
}

interface Props {
    kartuKeluarga: KartuKeluarga;
}

export default function Show({ kartuKeluarga }: Props) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Kependudukan', href: '#' },
            { title: 'Kartu Keluarga', href: route('data-kependudukan.kartu-keluarga.index') },
            { title: 'Detail Kartu Keluarga', href: route('data-kependudukan.kartu-keluarga.show', kartuKeluarga.id) },
        ]}>
            <Head title="Detail Kartu Keluarga" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('data-kependudukan.kartu-keluarga.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-semibold">Detail Kartu Keluarga</h2>
                    </div>
                    <Link href={route('data-kependudukan.kartu-keluarga.edit', kartuKeluarga.id)}>
                        <Button>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                </div>

                {/* Data Kartu Keluarga */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Kartu Keluarga</CardTitle>
                        <CardDescription>Data lengkap kartu keluarga</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {kartuKeluarga.foto_rumah && (
                            <div className="flex justify-center">
                                <img 
                                    src={kartuKeluarga.foto_rumah} 
                                    alt="Foto Rumah" 
                                    className="max-w-md max-h-96 object-cover rounded-lg shadow-md"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Nomor KK</label>
                                <p className="text-base font-semibold mt-1">{kartuKeluarga.nomor_kk}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Kode Pos</label>
                                <p className="text-base mt-1">{kartuKeluarga.kode_pos}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
                                <p className="text-base mt-1">{kartuKeluarga.alamat}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">RT / RW</label>
                                <p className="text-base mt-1">{kartuKeluarga.rt} / {kartuKeluarga.rw}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Desa/Kelurahan</label>
                                <p className="text-base mt-1">{kartuKeluarga.desa_kelurahan}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                                <p className="text-base mt-1">{kartuKeluarga.kecamatan}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</label>
                                <p className="text-base mt-1">{kartuKeluarga.kabupaten_kota}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                                <p className="text-base mt-1">{kartuKeluarga.provinsi}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Anggota Keluarga */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <CardTitle>Anggota Keluarga</CardTitle>
                        </div>
                        <CardDescription>
                            {kartuKeluarga.anggota_keluarga?.length || 0} orang terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {kartuKeluarga.anggota_keluarga && kartuKeluarga.anggota_keluarga.length > 0 ? (
                            <div className="space-y-4">
                                {kartuKeluarga.anggota_keluarga.map((anggota, index) => (
                                    <div key={anggota.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                                            <h4 className="font-semibold text-lg">{anggota.nama_lengkap}</h4>
                                            <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                                                {anggota.status_hubungan_dalam_keluarga}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">NIK</label>
                                                <p className="text-sm mt-1">{anggota.nik}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">Jenis Kelamin</label>
                                                <p className="text-sm mt-1">{anggota.jenis_kelamin}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">Status Perkawinan</label>
                                                <p className="text-sm mt-1">{anggota.status_perkawinan || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">Tempat Lahir</label>
                                                <p className="text-sm mt-1">{anggota.tempat_lahir || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">Tanggal Lahir</label>
                                                <p className="text-sm mt-1">{formatDate(anggota.tanggal_lahir)}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">Pekerjaan</label>
                                                <p className="text-sm mt-1">{anggota.pekerjaan || '-'}</p>
                                            </div>
                                        </div>

                                        {anggota.keterangan && (
                                            <div className="mt-3 pt-3 border-t">
                                                <label className="text-xs font-medium text-muted-foreground">Keterangan</label>
                                                <p className="text-sm mt-1 text-muted-foreground italic">{anggota.keterangan}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Belum ada anggota keluarga terdaftar</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Link href={route('data-kependudukan.kartu-keluarga.index')}>
                        <Button variant="outline">
                            Kembali ke Daftar
                        </Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
