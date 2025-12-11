import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Home, Users, Eye } from 'lucide-react';

interface Penduduk {
    id: number;
    nama_lengkap: string;
    nik: string;
    jenis_kelamin: string;
    status_hubungan_dalam_keluarga: string;
}

interface KartuKeluarga {
    id: number;
    nomor_kk: string;
    alamat: string;
    rt: string;
    rw: string;
    desa_kelurahan: string;
    kecamatan: string;
    anggota_keluarga: Penduduk[];
}

interface Props {
    kartuKeluarga: KartuKeluarga[];
    rt: string;
    rw: string;
}

export default function DetailKk({ kartuKeluarga, rt, rw }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Kependudukan', href: '#' },
            { title: 'Persebaran Penduduk', href: route('data-kependudukan.persebaran-penduduk.index') },
            { title: `Detail KK RT ${rt}/RW ${rw}`, href: '#' },
        ]}>
            <Head title={`Detail KK RT ${rt}/RW ${rw}`} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('data-kependudukan.persebaran-penduduk.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl md:text-2xl font-semibold">Daftar Kartu Keluarga</h2>
                            <p className="text-muted-foreground">RT {rt} / RW {rw}</p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kartu Keluarga</CardTitle>
                            <Home className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{kartuKeluarga.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Anggota Keluarga</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {kartuKeluarga.reduce((sum, kk) => sum + (kk.anggota_keluarga?.length || 0), 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* KK List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kartu Keluarga</CardTitle>
                        <CardDescription>
                            Warga lokal yang terdaftar di RT {rt} / RW {rw}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">No.</TableHead>
                                        <TableHead>Nomor KK</TableHead>
                                        <TableHead>Kepala Keluarga</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead>Desa/Kelurahan</TableHead>
                                        <TableHead className="text-right">Jml Anggota</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kartuKeluarga.length > 0 ? (
                                        kartuKeluarga.map((kk, index) => {
                                            const kepalaKeluarga = kk.anggota_keluarga?.find(
                                                (a) => a.status_hubungan_dalam_keluarga === 'Kepala Keluarga'
                                            );
                                            return (
                                                <TableRow key={kk.id}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell className="font-mono text-sm">{kk.nomor_kk}</TableCell>
                                                    <TableCell>
                                                        {kepalaKeluarga?.nama_lengkap || '-'}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">{kk.alamat}</TableCell>
                                                    <TableCell>{kk.desa_kelurahan}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {kk.anggota_keluarga?.length || 0}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={route('data-kependudukan.kartu-keluarga.show', kk.id)}>
                                                            <Button variant="ghost" size="icon" title="Lihat Detail" className="text-blue-500 hover:text-blue-600">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Tidak ada Kartu Keluarga terdaftar di RT {rt} / RW {rw}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
