import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Rumah {
    id: number;
    alamat: string;
    rt: string;
    rw: string;
    latitude: number;
    longitude: number;
    keterangan?: string;
    foto_rumah?: string;
    kartu_keluarga?: {
        nomor_kk: string;
    };
}

interface Props {
    rumah: Rumah;
    kartuKeluargaList?: any[];
}

export default function EditLokasiPenduduk({ rumah }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        alamat: rumah.alamat,
        rt: rumah.rt,
        rw: rumah.rw,
        latitude: rumah.latitude.toString(),
        longitude: rumah.longitude.toString(),
        keterangan: rumah.keterangan || '',
        foto_rumah: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('data-kependudukan.lokasi-penduduk.update', rumah.id), {
            onSuccess: () => {
                toast.success("Berhasil", {
                    description: "Lokasi rumah berhasil diperbarui.",
                });
            },
            onError: () => {
                toast.error("Error", {
                    description: "Gagal memperbarui lokasi rumah.",
                });
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit - ${rumah.alamat}`} />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('data-kependudukan.lokasi-penduduk')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Edit Lokasi Rumah</h1>
                        <p className="text-muted-foreground">Perbarui informasi lokasi rumah penduduk</p>
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
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                    <Link href={route('data-kependudukan.lokasi-penduduk')}>
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
                            <CardTitle>Ringkasan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">ID</p>
                                <p className="font-mono text-sm">{rumah.id}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">RT/RW</p>
                                <p className="text-sm font-semibold">{rumah.rt}/{rumah.rw}</p>
                            </div>
                            {rumah.kartu_keluarga && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground">No. KK</p>
                                    <p className="font-mono text-sm">{rumah.kartu_keluarga.nomor_kk}</p>
                                </div>
                            )}
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">Koordinat</p>
                                <p className="font-mono text-xs">{parseFloat(data.latitude).toFixed(6)}, {parseFloat(data.longitude).toFixed(6)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
