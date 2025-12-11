import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

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
        anggota_keluarga?: Array<{
            id: number;
            nama_lengkap: string;
            nik: string;
        }>;
    };
}

export default function LokasiPendudukShow({ rumah }: { rumah: Rumah }) {
    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus lokasi rumah ini?')) {
            router.delete(route('data-kependudukan.lokasi-penduduk.destroy', rumah.id), {
                onSuccess: () => {
                    router.visit(route('data-kependudukan.lokasi-penduduk'));
                }
            });
        }
    };

    return (
        <AppLayout>
            <Head title={rumah.alamat} />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('data-kependudukan.lokasi-penduduk')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{rumah.alamat}</h1>
                        <p className="text-muted-foreground">Detail informasi lokasi rumah penduduk</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('data-kependudukan.lokasi-penduduk.edit', rumah.id)}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi Rumah</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {rumah.foto_rumah && (
                                <div className="rounded-lg overflow-hidden aspect-video bg-gray-100">
                                    <img src={rumah.foto_rumah} alt={rumah.alamat} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">RT</p>
                                    <p className="font-semibold">{rumah.rt}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">RW</p>
                                    <p className="font-semibold">{rumah.rw}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Latitude</p>
                                    <p className="font-mono text-sm">{typeof rumah.latitude === 'number' ? rumah.latitude.toFixed(6) : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Longitude</p>
                                    <p className="font-mono text-sm">{typeof rumah.longitude === 'number' ? rumah.longitude.toFixed(6) : 'N/A'}</p>
                                </div>
                            </div>
                            {rumah.kartu_keluarga && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Kartu Keluarga</p>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">No. KK</p>
                                            <p className="font-mono text-sm">{rumah.kartu_keluarga.nomor_kk}</p>
                                        </div>
                                        {rumah.kartu_keluarga && rumah.kartu_keluarga.anggota_keluarga && rumah.kartu_keluarga.anggota_keluarga.length > 0 && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Anggota Keluarga</p>
                                                <ul className="text-sm space-y-1">
                                                    {rumah.kartu_keluarga.anggota_keluarga.map((anggota: any) => (
                                                        <li key={anggota.id} className="flex justify-between">
                                                            <span>{anggota.nama_lengkap}</span>
                                                            <span className="text-muted-foreground">{anggota.nik}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {rumah.keterangan && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Keterangan</p>
                                    <p className="text-sm">{rumah.keterangan}</p>
                                </div>
                            )}
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
