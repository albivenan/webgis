import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PersebaranPenduduk {
    id: number;
    rt: string;
    rw: string;
    periode_bulan: number;
    periode_tahun: number;
    jumlah_kk: number;
    jumlah_laki_laki: number;
    jumlah_perempuan: number;
    jumlah_kelahiran: number;
    jumlah_kematian: number;
    keterangan: string | null;
}

interface Props {
    data: PersebaranPenduduk;
}

export default function Edit({ data: initialData }: Props) {
    const currentYear = new Date().getFullYear();

    const { data, setData, put, processing, errors } = useForm({
        rt: initialData.rt,
        rw: initialData.rw,
        periode_bulan: initialData.periode_bulan,
        periode_tahun: initialData.periode_tahun,
        jumlah_kk: initialData.jumlah_kk ?? 0,
        jumlah_laki_laki: initialData.jumlah_laki_laki,
        jumlah_perempuan: initialData.jumlah_perempuan,
        jumlah_kelahiran: initialData.jumlah_kelahiran,
        jumlah_kematian: initialData.jumlah_kematian,
        keterangan: initialData.keterangan || '',
    });

    const [loadingKk, setLoadingKk] = useState(false);

    const fetchKkCount = async () => {
        if (!data.rt || !data.rw) {
            toast.error("Lengkapi RT dan RW terlebih dahulu");
            return;
        }
        setLoadingKk(true);
        try {
            const response = await fetch(`/api/persebaran-penduduk/get-kk-count?rt=${data.rt}&rw=${data.rw}`);
            const result = await response.json();
            setData('jumlah_kk', result.count);
            toast.success(`Ditemukan ${result.count} Kartu Keluarga di RT ${data.rt}/RW ${data.rw}`);
        } catch (error) {
            toast.error("Gagal mengambil data KK dari database");
        } finally {
            setLoadingKk(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('data-kependudukan.persebaran-penduduk.update', { id: initialData.id }), {
            onSuccess: () => {
                toast.success("Berhasil", {
                    description: "Data persebaran penduduk berhasil diperbarui.",
                });
            },
            onError: (errors) => {
                toast.error("Gagal", {
                    description: "Terjadi kesalahan saat menyimpan data.",
                });
            },
        });
    };

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' },
    ];

    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Kependudukan', href: '#' },
            { title: 'Persebaran Penduduk', href: route('data-kependudukan.persebaran-penduduk.index') },
            { title: 'Edit Data', href: route('data-kependudukan.persebaran-penduduk.edit', { id: initialData.id }) },
        ]}>
            <Head title="Edit Data Persebaran Penduduk" />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('data-kependudukan.persebaran-penduduk.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h2 className="text-xl md:text-2xl font-semibold">Edit Data Persebaran Penduduk</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Wilayah dan Periode</CardTitle>
                            <CardDescription>Masukkan data RT/RW dan periode pencatatan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rt">RT <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="rt"
                                        value={data.rt}
                                        onChange={(e) => setData('rt', e.target.value)}
                                        placeholder="001"
                                        maxLength={3}
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
                                        placeholder="002"
                                        maxLength={3}
                                        required
                                    />
                                    {errors.rw && <p className="text-sm text-red-500">{errors.rw}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="periode_bulan">Bulan <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={data.periode_bulan.toString()}
                                        onValueChange={(value) => setData('periode_bulan', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month.value} value={month.value.toString()}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.periode_bulan && <p className="text-sm text-red-500">{errors.periode_bulan}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="periode_tahun">Tahun <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={data.periode_tahun.toString()}
                                        onValueChange={(value) => setData('periode_tahun', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.periode_tahun && <p className="text-sm text-red-500">{errors.periode_tahun}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="w-5 h-5 text-orange-500" />
                                Jumlah Kartu Keluarga (KK)
                            </CardTitle>
                            <CardDescription>Jumlah KK warga lokal yang terdaftar di wilayah ini</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="jumlah_kk">Jumlah KK <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="jumlah_kk"
                                        type="number"
                                        min="0"
                                        value={data.jumlah_kk}
                                        onChange={(e) => setData('jumlah_kk', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                    {errors.jumlah_kk && <p className="text-sm text-red-500">{errors.jumlah_kk}</p>}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={fetchKkCount}
                                    disabled={loadingKk || !data.rt || !data.rw}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingKk ? 'animate-spin' : ''}`} />
                                    {loadingKk ? 'Mengambil...' : 'Ambil dari Data'}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Klik "Ambil dari Data" untuk mengambil jumlah KK yang terdaftar di database berdasarkan RT/RW yang dipilih.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Jumlah Penduduk</CardTitle>
                            <CardDescription>Masukkan jumlah penduduk berdasarkan jenis kelamin</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_laki_laki">Jumlah Laki-laki <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="jumlah_laki_laki"
                                        type="number"
                                        min="0"
                                        value={data.jumlah_laki_laki}
                                        onChange={(e) => setData('jumlah_laki_laki', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                    {errors.jumlah_laki_laki && <p className="text-sm text-red-500">{errors.jumlah_laki_laki}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_perempuan">Jumlah Perempuan <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="jumlah_perempuan"
                                        type="number"
                                        min="0"
                                        value={data.jumlah_perempuan}
                                        onChange={(e) => setData('jumlah_perempuan', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                    {errors.jumlah_perempuan && <p className="text-sm text-red-500">{errors.jumlah_perempuan}</p>}
                                </div>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium">Total Penduduk: <span className="text-lg font-bold">{(data.jumlah_laki_laki + data.jumlah_perempuan).toLocaleString()}</span></p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Kelahiran dan Kematian</CardTitle>
                            <CardDescription>Masukkan jumlah kelahiran dan kematian pada periode ini</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_kelahiran">Jumlah Kelahiran <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="jumlah_kelahiran"
                                        type="number"
                                        min="0"
                                        value={data.jumlah_kelahiran}
                                        onChange={(e) => setData('jumlah_kelahiran', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                    {errors.jumlah_kelahiran && <p className="text-sm text-red-500">{errors.jumlah_kelahiran}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_kematian">Jumlah Kematian <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="jumlah_kematian"
                                        type="number"
                                        min="0"
                                        value={data.jumlah_kematian}
                                        onChange={(e) => setData('jumlah_kematian', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                    {errors.jumlah_kematian && <p className="text-sm text-red-500">{errors.jumlah_kematian}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Keterangan</CardTitle>
                            <CardDescription>Informasi tambahan (opsional)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                placeholder="Masukkan keterangan tambahan jika diperlukan..."
                                rows={4}
                            />
                            {errors.keterangan && <p className="text-sm text-red-500">{errors.keterangan}</p>}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route('data-kependudukan.persebaran-penduduk.index')}>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
