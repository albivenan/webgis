import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface BatasWilayah {
    id: number;
    nama: string;
    jenis: string;
    nama_pemilik?: string;
    no_hp_pemilik?: string;
    alamat_pemilik?: string;
    luas?: number;
    keterangan?: string;
    foto_batas_wilayah?: string;
}

const formatLuas = (luas?: number): string => {
    if (!luas) return '-';
    if (luas >= 10000) {
        const hectares = luas / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
    return `${Math.round(luas).toLocaleString('id-ID')} m²`;
};

export default function BatasWilayahShow({ batasWilayah }: { batasWilayah: BatasWilayah }) {
    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus batas wilayah ini?')) {
            router.delete(route('batas-wilayah.destroy', batasWilayah.id));
        }
    };

    return (
        <AppLayout>
            <Head title={batasWilayah.nama} />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('batas-wilayah.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{batasWilayah.nama}</h1>
                        <p className="text-muted-foreground">Detail informasi batas wilayah lahan</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('batas-wilayah.edit', batasWilayah.id)}>
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
                            <CardTitle>Informasi Batas Wilayah</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {batasWilayah.foto_batas_wilayah && (
                                <div className="rounded-lg overflow-hidden aspect-video bg-gray-100">
                                    <img src={batasWilayah.foto_batas_wilayah} alt={batasWilayah.nama} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Jenis Lahan</p>
                                    <p className="font-semibold">{batasWilayah.jenis}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Luas</p>
                                    <p className="font-semibold">{formatLuas(batasWilayah.luas)}</p>
                                </div>
                            </div>
                            {batasWilayah.nama_pemilik && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Informasi Pemilik</p>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nama Pemilik</p>
                                            <p className="text-sm font-semibold">{batasWilayah.nama_pemilik}</p>
                                        </div>
                                        {batasWilayah.no_hp_pemilik && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">No. HP</p>
                                                <p className="text-sm">{batasWilayah.no_hp_pemilik}</p>
                                            </div>
                                        )}
                                        {batasWilayah.alamat_pemilik && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Alamat</p>
                                                <p className="text-sm">{batasWilayah.alamat_pemilik}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {batasWilayah.keterangan && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Keterangan</p>
                                    <p className="text-sm">{batasWilayah.keterangan}</p>
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
                                <p className="font-mono text-sm">{batasWilayah.id}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">Jenis Lahan</p>
                                <p className="text-sm font-semibold">{batasWilayah.jenis}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">Luas</p>
                                <p className="text-sm font-semibold">{formatLuas(batasWilayah.luas)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
