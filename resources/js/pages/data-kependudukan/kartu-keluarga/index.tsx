import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface AnggotaKeluarga {
    id: number;
    nama_lengkap: string;
    status_hubungan_dalam_keluarga: string;
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
    anggota_keluarga_count: number;
    anggota_keluarga?: AnggotaKeluarga[];
}

interface Props {
    kartuKeluarga: {
        data: KartuKeluarga[];
        links: any[];
    };
}

export default function Index({ kartuKeluarga }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('data-kependudukan.kartu-keluarga.destroy', id), {
                onSuccess: () => {
                    toast.success("Berhasil", {
                        description: "Data Kartu Keluarga berhasil dihapus.",
                    });
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Kependudukan', href: '#' },
            { title: 'Kartu Keluarga', href: route('data-kependudukan.kartu-keluarga.index') },
        ]}>
            <Head title="Kartu Keluarga" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Data Kartu Keluarga</h2>
                    <Link href={route('data-kependudukan.kartu-keluarga.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah KK
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">No.</TableHead>
                                <TableHead>No. KK</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>Kepala Keluarga</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kartuKeluarga.data.length > 0 ? (
                                kartuKeluarga.data.map((kk, index) => (
                                    <TableRow key={kk.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{kk.nomor_kk}</TableCell>
                                        <TableCell>
                                            <div>{kk.alamat}</div>
                                            <div className="text-xs text-muted-foreground">RT {kk.rt}/RW {kk.rw}</div>
                                        </TableCell>
                                        <TableCell>
                                            {kk.anggota_keluarga && kk.anggota_keluarga.length > 0 ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {kk.anggota_keluarga.find((a) => a.status_hubungan_dalam_keluarga === 'Kepala Keluarga')?.nama_lengkap || 'Belum ada'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {kk.anggota_keluarga_count} anggota
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Belum ada anggota</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('data-kependudukan.kartu-keluarga.show', kk.id)}>
                                                    <Button variant="ghost" size="icon" title="Detail">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('data-kependudukan.kartu-keluarga.edit', kk.id)}>
                                                    <Button variant="ghost" size="icon" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(kk.id)} title="Hapus">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Belum ada data Kartu Keluarga.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
