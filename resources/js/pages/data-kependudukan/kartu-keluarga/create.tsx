import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface AnggotaKeluargaForm {
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

export default function Create() {
    const [anggotaKeluarga, setAnggotaKeluarga] = useState<AnggotaKeluargaForm[]>([{
        nik: '',
        nama_lengkap: '',
        jenis_kelamin: 'Laki-laki',
        tempat_lahir: '',
        tanggal_lahir: '',
        status_perkawinan: 'Belum Kawin',
        pekerjaan: '',
        status_hubungan_dalam_keluarga: 'Kepala Keluarga',
        keterangan: '',
    }]);

    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        nomor_kk: '',
        alamat: '',
        rt: '',
        rw: '',
        kode_pos: '',
        desa_kelurahan: '',
        kecamatan: '',
        kabupaten_kota: '',
        provinsi: '',
        foto_rumah: null as File | null,
        anggota_keluarga: anggotaKeluarga,
    });

    const handleAddAnggota = () => {
        const newAnggota: AnggotaKeluargaForm = {
            nik: '',
            nama_lengkap: '',
            jenis_kelamin: 'Laki-laki',
            tempat_lahir: '',
            tanggal_lahir: '',
            status_perkawinan: 'Belum Kawin',
            pekerjaan: '',
            status_hubungan_dalam_keluarga: 'Anak',
            keterangan: '',
        };
        const updated = [...anggotaKeluarga, newAnggota];
        setAnggotaKeluarga(updated);
        setData('anggota_keluarga', updated);
    };

    const handleRemoveAnggota = (index: number) => {
        const updated = anggotaKeluarga.filter((_, i) => i !== index);
        setAnggotaKeluarga(updated);
        setData('anggota_keluarga', updated);
    };

    const handleAnggotaChange = (index: number, field: keyof AnggotaKeluargaForm, value: string) => {
        const updated = [...anggotaKeluarga];
        updated[index][field] = value;
        setAnggotaKeluarga(updated);
        setData('anggota_keluarga', updated);
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran file (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Gagal", {
                    description: "Ukuran foto tidak boleh lebih dari 2MB.",
                });
                return;
            }

            // Validasi tipe file
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                toast.error("Gagal", {
                    description: "Format foto harus JPG, JPEG, atau PNG.",
                });
                return;
            }

            setData('foto_rumah', file);

            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFoto = () => {
        setData('foto_rumah', null);
        setFotoPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('data-kependudukan.kartu-keluarga.store'), {
            onSuccess: () => {
                toast.success("Berhasil", {
                    description: "Data Kartu Keluarga berhasil ditambahkan.",
                });
            },
            onError: (errors) => {
                toast.error("Gagal", {
                    description: "Terjadi kesalahan saat menyimpan data.",
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Kependudukan', href: '#' },
            { title: 'Kartu Keluarga', href: route('data-kependudukan.kartu-keluarga.index') },
            { title: 'Tambah Kartu Keluarga', href: route('data-kependudukan.kartu-keluarga.create') },
        ]}>
            <Head title="Tambah Kartu Keluarga" />

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('data-kependudukan.kartu-keluarga.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-semibold">Tambah Kartu Keluarga</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Data Kartu Keluarga */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Kartu Keluarga</CardTitle>
                            <CardDescription>Informasi alamat dan nomor KK</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomor_kk">Nomor KK <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="nomor_kk"
                                        value={data.nomor_kk}
                                        onChange={(e) => setData('nomor_kk', e.target.value)}
                                        placeholder="32xxxxxxxxxxxxxx"
                                        required
                                    />
                                    {errors.nomor_kk && <p className="text-sm text-red-500">{errors.nomor_kk}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kode_pos">Kode Pos <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="kode_pos"
                                        value={data.kode_pos}
                                        onChange={(e) => setData('kode_pos', e.target.value)}
                                        placeholder="4xxxx"
                                        required
                                    />
                                    {errors.kode_pos && <p className="text-sm text-red-500">{errors.kode_pos}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alamat">Alamat Lengkap <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="alamat"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    placeholder="Jl. Contoh No.  123"
                                    rows={3}
                                    required
                                />
                                {errors.alamat && <p className="text-sm text-red-500">{errors.alamat}</p>}
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rt">RT <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="rt"
                                        value={data.rt}
                                        onChange={(e) => setData('rt', e.target.value)}
                                        placeholder="001"
                                        required
                                    />
                                    {errors.rt && <p className="text-sm text-red-500">{errors.rt}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rw">RW <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="rw"
                                        value={data.rw}
                                        onChange={(e) => setData('rw', e.target.value)}
                                        placeholder="001"
                                        required
                                    />
                                    {errors.rw && <p className="text-sm text-red-500">{errors.rw}</p>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="desa_kelurahan">Desa/Kelurahan <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="desa_kelurahan"
                                        value={data.desa_kelurahan}
                                        onChange={(e) => setData('desa_kelurahan', e.target.value)}
                                        required
                                    />
                                    {errors.desa_kelurahan && <p className="text-sm text-red-500">{errors.desa_kelurahan}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kecamatan">Kecamatan <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="kecamatan"
                                        value={data.kecamatan}
                                        onChange={(e) => setData('kecamatan', e.target.value)}
                                        required
                                    />
                                    {errors.kecamatan && <p className="text-sm text-red-500">{errors.kecamatan}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kabupaten_kota">Kab/Kota <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="kabupaten_kota"
                                        value={data.kabupaten_kota}
                                        onChange={(e) => setData('kabupaten_kota', e.target.value)}
                                        required
                                    />
                                    {errors.kabupaten_kota && <p className="text-sm text-red-500">{errors.kabupaten_kota}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="provinsi">Provinsi <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="provinsi"
                                        value={data.provinsi}
                                        onChange={(e) => setData('provinsi', e.target.value)}
                                        required
                                    />
                                    {errors.provinsi && <p className="text-sm text-red-500">{errors.provinsi}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foto_rumah">Foto Rumah (Opsional)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="foto_rumah" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                            <div className="text-center">
                                                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm font-medium">Klik untuk upload foto</p>
                                                <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 2MB)</p>
                                            </div>
                                            <input
                                                id="foto_rumah"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={handleFotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {fotoPreview && (
                                        <div className="relative w-24 h-24">
                                            <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={handleRemoveFoto}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.foto_rumah && <p className="text-sm text-red-500">{errors.foto_rumah}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anggota Keluarga */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Anggota Keluarga</CardTitle>
                                    <CardDescription>Tambahkan anggota keluarga dan keterangan</CardDescription>
                                </div>
                                <Button type="button" onClick={handleAddAnggota} variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Anggota
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {anggotaKeluarga.map((anggota, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold">Anggota #{index + 1}</h4>
                                        {anggotaKeluarga.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveAnggota(index)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>NIK <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={anggota.nik}
                                                onChange={(e) => handleAnggotaChange(index, 'nik', e.target.value)}
                                                placeholder="32xxxxxxxxxxxx"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={anggota.nama_lengkap}
                                                onChange={(e) => handleAnggotaChange(index, 'nama_lengkap', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Jenis Kelamin</Label>
                                            <Select
                                                value={anggota.jenis_kelamin}
                                                onValueChange={(value) => handleAnggotaChange(index, 'jenis_kelamin', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tempat Lahir</Label>
                                            <Input
                                                value={anggota.tempat_lahir}
                                                onChange={(e) => handleAnggotaChange(index, 'tempat_lahir', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal Lahir</Label>
                                            <Input
                                                type="date"
                                                value={anggota.tanggal_lahir}
                                                onChange={(e) => handleAnggotaChange(index, 'tanggal_lahir', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Status Hubungan</Label>
                                            <Select
                                                value={anggota.status_hubungan_dalam_keluarga}
                                                onValueChange={(value) => handleAnggotaChange(index, 'status_hubungan_dalam_keluarga', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Kepala Keluarga">Kepala Keluarga</SelectItem>
                                                    <SelectItem value="Istri">Istri</SelectItem>
                                                    <SelectItem value="Anak">Anak</SelectItem>
                                                    <SelectItem value="Menantu">Menantu</SelectItem>
                                                    <SelectItem value="Cucu">Cucu</SelectItem>
                                                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                                                    <SelectItem value="Mertua">Mertua</SelectItem>
                                                    <SelectItem value="Famili Lain">Famili Lain</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status Perkawinan</Label>
                                            <Select
                                                value={anggota.status_perkawinan}
                                                onValueChange={(value) => handleAnggotaChange(index, 'status_perkawinan', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                                                    <SelectItem value="Kawin">Kawin</SelectItem>
                                                    <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                                                    <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pekerjaan</Label>
                                            <Input
                                                value={anggota.pekerjaan}
                                                onChange={(e) => handleAnggotaChange(index, 'pekerjaan', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Keterangan</Label>
                                        <Textarea
                                            value={anggota.keterangan}
                                            onChange={(e) => handleAnggotaChange(index, 'keterangan', e.target.value)}
                                            placeholder="Keterangan tambahan untuk anggota keluarga ini..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route('data-kependudukan.kartu-keluarga.index')}>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Kartu Keluarga'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
