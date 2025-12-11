import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Bencana {
    id: number;
    nama_bencana: string;
    jenis_bencana: string;
    tipe_lokasi: string;
    tanggal_mulai: string;
    tanggal_selesai?: string;
    status: string;
    tingkat_bahaya: string;
    korban_jiwa?: number;
    korban_luka?: number;
    kerusakan_infrastruktur?: string;
    keterangan?: string;
    foto?: string;
}

export default function BencanaShow({ bencana }: { bencana: Bencana }) {
    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus bencana ini?')) {
            router.delete(route('bencana.destroy', bencana.id));
        }
    };

    return (
        <AppLayout>
            <Head title={bencana.nama_bencana} />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('bencana.berlangsung')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{bencana.nama_bencana}</h1>
                        <p className="text-muted-foreground">Detail informasi bencana alam</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('bencana.edit', bencana.id)}>
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
                            <CardTitle>Informasi Bencana</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bencana.foto && (
                                <div className="rounded-lg overflow-hidden aspect-video bg-gray-100">
                                    <img src={bencana.foto} alt={bencana.nama_bencana} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Jenis Bencana</p>
                                    <p className="font-semibold">{bencana.jenis_bencana.replace(/_/g, ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tipe Lokasi</p>
                                    <p className="font-semibold">{bencana.tipe_lokasi}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                                    <p className="font-semibold">{new Date(bencana.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tingkat Bahaya</p>
                                    <p className="font-semibold">{bencana.tingkat_bahaya.replace(/_/g, ' ')}</p>
                                </div>
                                {bencana.tanggal_selesai && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                                        <p className="font-semibold">{new Date(bencana.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-semibold">{bencana.status}</p>
                                </div>
                            </div>
                            {bencana.korban_jiwa !== undefined && (
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Korban Jiwa</p>
                                        <p className="font-semibold text-lg">{bencana.korban_jiwa}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Korban Luka</p>
                                        <p className="font-semibold text-lg">{bencana.korban_luka || 0}</p>
                                    </div>
                                </div>
                            )}
                            {bencana.kerusakan_infrastruktur && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Kerusakan Infrastruktur</p>
                                    <p className="text-sm">{bencana.kerusakan_infrastruktur}</p>
                                </div>
                            )}
                            {bencana.keterangan && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Keterangan</p>
                                    <p className="text-sm">{bencana.keterangan}</p>
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
                                <p className="font-mono text-sm">{bencana.id}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">Jenis</p>
                                <p className="text-sm font-semibold">{bencana.jenis_bencana.replace(/_/g, ' ')}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">Tingkat Bahaya</p>
                                <p className="text-sm font-semibold">{bencana.tingkat_bahaya.replace(/_/g, ' ')}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className="text-sm font-semibold">{bencana.status}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
