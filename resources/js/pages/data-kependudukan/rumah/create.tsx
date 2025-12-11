import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KartuKeluarga {
    id: number;
    nomor_kk: string;
    alamat: string;
    rt: string;
    rw: string;
}

interface Props {
    kartuKeluargaList: KartuKeluarga[];
}

export default function CreateRumah({ kartuKeluargaList = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        kartu_keluarga_id: '',
        alamat: '',
        rt: '',
        rw: '',
        latitude: '',
        longitude: '',
        keterangan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('data-kependudukan.rumah.store'), {
            onSuccess: () => {
                toast.success("Berhasil", {
                    description: "Rumah berhasil ditambahkan.",
                });
            },
            onError: () => {
                toast.error("Error", {
                    description: "Gagal menambahkan rumah.",
                });
            }
        });
    };

    const handleKKSelect = (kkId: string) => {
        const selectedKK = kartuKeluargaList.find(kk => kk.id.toString() === kkId);
        if (selectedKK) {
            setData({
                ...data,
                kartu_keluarga_id: kkId,
                alamat: selectedKK.alamat,
                rt: selectedKK.rt,
                rw: selectedKK.rw,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Tambah Rumah" />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('data-kependudukan.rumah.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Tambah Rumah</h1>
                        <p className="text-muted-foreground">Tambahkan data rumah penduduk baru</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi Rumah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm border-b pb-2">Pilih Kartu Keluarga</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="kartu_keluarga_id">Kartu Keluarga</Label>
                                        <Select value={data.kartu_keluarga_id} onValueChange={handleKKSelect}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Kartu Keluarga..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kartuKeluargaList.map((kk) => (
                                                    <SelectItem key={kk.id} value={kk.id.toString()}>
                                                        {kk.nomor_kk} - {kk.alamat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.kartu_keluarga_id && <p className="text-sm text-red-500">{errors.kartu_keluarga_id}</p>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm border-b pb-2">Informasi Alamat</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="alamat">Alamat <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="alamat"
                                            value={data.alamat}
                                            onChange={(e) => setData('alamat', e.target.value)}
                                            placeholder="Alamat lengkap"
                                            required
                                        />
                                        {errors.alamat && <p className="text-sm text-red-500">{errors.alamat}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
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
                                                placeholder="001"
                                                maxLength={3}
                                                required
                                            />
                                            {errors.rw && <p className="text-sm text-red-500">{errors.rw}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm border-b pb-2">Koordinat Lokasi</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="latitude">Latitude <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="0.000001"
                                                value={data.latitude}
                                                onChange={(e) => setData('latitude', e.target.value)}
                                                placeholder="Latitude"
                                                required
                                            />
                                            {errors.latitude && <p className="text-sm text-red-500">{errors.latitude}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="longitude">Longitude <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="0.000001"
                                                value={data.longitude}
                                                onChange={(e) => setData('longitude', e.target.value)}
                                                placeholder="Longitude"
                                                required
                                            />
                                            {errors.longitude && <p className="text-sm text-red-500">{errors.longitude}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm border-b pb-2">Keterangan Tambahan</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="keterangan">Keterangan</Label>
                                        <Textarea
                                            id="keterangan"
                                            value={data.keterangan}
                                            onChange={(e) => setData('keterangan', e.target.value)}
                                            placeholder="Keterangan tambahan (opsional)"
                                        />
                                        {errors.keterangan && <p className="text-sm text-red-500">{errors.keterangan}</p>}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                    <Link href={route('data-kependudukan.rumah.index')}>
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bantuan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="font-semibold mb-1">Pilih Kartu Keluarga</p>
                                <p className="text-muted-foreground">Pilih kartu keluarga yang sudah terdaftar untuk mengisi data alamat otomatis.</p>
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Koordinat Lokasi</p>
                                <p className="text-muted-foreground">Masukkan latitude dan longitude lokasi rumah. Gunakan format desimal (contoh: -7.123456).</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
