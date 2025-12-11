import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Users, Baby, Heart, UserCheck, UserX, Home, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

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
    bulan_name: string;
    jumlah_total: number;
}

interface Statistics {
    total_penduduk: number;
    total_laki_laki: number;
    total_perempuan: number;
    total_kelahiran: number;
    total_kematian: number;
    total_kk: number;
}

interface Filters {
    rt: string | null;
    rw: string | null;
    periode_bulan: number | null;
    periode_tahun: number | null;
}

interface Props {
    data: PersebaranPenduduk[];
    statistics: Statistics;
    filters: Filters;
    rtList: string[];
    rwList: string[];
    tahunList: number[];
}

export default function Index({ data, statistics, filters, rtList, rwList, tahunList }: Props) {
    const [filterRt, setFilterRt] = useState<string>(filters.rt || '');
    const [filterRw, setFilterRw] = useState<string>(filters.rw || '');
    const [filterBulan, setFilterBulan] = useState<string>(filters.periode_bulan?.toString() || '');
    const [filterTahun, setFilterTahun] = useState<string>(filters.periode_tahun?.toString() || '');

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('data-kependudukan.persebaran-penduduk.destroy', id), {
                onSuccess: () => {
                    toast.success("Berhasil", {
                        description: "Data persebaran penduduk berhasil dihapus.",
                    });
                },
            });
        }
    };

    const applyFilters = () => {
        router.get(route('data-kependudukan.persebaran-penduduk.index'), {
            rt: filterRt || undefined,
            rw: filterRw || undefined,
            periode_bulan: filterBulan || undefined,
            periode_tahun: filterTahun || undefined,
        }, {
            preserveState: true,
        });
    };

    const resetFilters = () => {
        setFilterRt('');
        setFilterRw('');
        setFilterBulan('');
        setFilterTahun('');
        router.get(route('data-kependudukan.persebaran-penduduk.index'));
    };

    const months = [
        { value: '1', label: 'Januari' },
        { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Mei' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' },
    ];

    // Prepare chart data
    const populationByRtRw = useMemo(() => {
        const grouped: { [key: string]: { laki: number; perempuan: number } } = {};
        data.forEach(item => {
            const key = `RT ${item.rt}/RW ${item.rw}`;
            if (!grouped[key]) {
                grouped[key] = { laki: 0, perempuan: 0 };
            }
            grouped[key].laki += item.jumlah_laki_laki ?? 0;
            grouped[key].perempuan += item.jumlah_perempuan ?? 0;
        });
        return Object.entries(grouped).map(([name, values]) => ({
            name,
            'Laki-laki': values.laki,
            'Perempuan': values.perempuan,
        }));
    }, [data]);

    const trendData = useMemo(() => {
        const grouped: { [key: string]: { laki: number; perempuan: number; kelahiran: number; kematian: number } } = {};
        data.forEach(item => {
            const key = `${item.bulan_name} ${item.periode_tahun}`;
            if (!grouped[key]) {
                grouped[key] = { laki: 0, perempuan: 0, kelahiran: 0, kematian: 0 };
            }
            grouped[key].laki += item.jumlah_laki_laki ?? 0;
            grouped[key].perempuan += item.jumlah_perempuan ?? 0;
            grouped[key].kelahiran += item.jumlah_kelahiran ?? 0;
            grouped[key].kematian += item.jumlah_kematian ?? 0;
        });
        return Object.entries(grouped).map(([name, values]) => ({
            name,
            'Laki-laki': values.laki,
            'Perempuan': values.perempuan,
            'Kelahiran': values.kelahiran,
            'Kematian': values.kematian,
        })).slice(-6); // Last 6 periods
    }, [data]);

    const genderPieData = useMemo(() => [
        { name: 'Laki-laki', value: statistics.total_laki_laki, color: '#3b82f6' },
        { name: 'Perempuan', value: statistics.total_perempuan, color: '#ec4899' },
    ], [statistics]);

    const birthDeathData = useMemo(() => [
        { name: 'Kelahiran', value: statistics.total_kelahiran, color: '#10b981' },
        { name: 'Kematian', value: statistics.total_kematian, color: '#ef4444' },
    ], [statistics]);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Kependudukan', href: '#' },
            { title: 'Persebaran Penduduk', href: route('data-kependudukan.persebaran-penduduk.index') },
        ]}>
            <Head title="Persebaran Penduduk" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-semibold">Persebaran Penduduk</h2>
                    <Link href={route('data-kependudukan.persebaran-penduduk.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Data
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Penduduk</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_penduduk.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
                            <UserCheck className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{statistics.total_laki_laki.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Perempuan</CardTitle>
                            <UserX className="h-4 w-4 text-pink-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-600">{statistics.total_perempuan.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kelahiran</CardTitle>
                            <Baby className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.total_kelahiran.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kematian</CardTitle>
                            <Heart className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{statistics.total_kematian.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total KK</CardTitle>
                            <Home className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{(statistics.total_kk ?? 0).toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Population by RT/RW Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Populasi per RT/RW</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={populationByRtRw}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Laki-laki" fill="#3b82f6" />
                                    <Bar dataKey="Perempuan" fill="#ec4899" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Trend Line Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tren Populasi (6 Bulan Terakhir)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Laki-laki" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Perempuan" stroke="#ec4899" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Gender Distribution Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribusi Jenis Kelamin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={genderPieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {genderPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Birth/Death Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kelahiran vs Kematian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={birthDeathData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {birthDeathData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filter Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">RT</label>
                                <Select value={filterRt || undefined} onValueChange={(value) => setFilterRt(value || '')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua RT" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rtList.map((rt) => (
                                            <SelectItem key={rt} value={rt}>RT {rt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">RW</label>
                                <Select value={filterRw || undefined} onValueChange={(value) => setFilterRw(value || '')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua RW" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rwList.map((rw) => (
                                            <SelectItem key={rw} value={rw}>RW {rw}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bulan</label>
                                <Select value={filterBulan || undefined} onValueChange={(value) => setFilterBulan(value || '')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tahun</label>
                                <Select value={filterTahun || undefined} onValueChange={(value) => setFilterTahun(value || '')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tahunList.map((tahun) => (
                                            <SelectItem key={tahun} value={tahun.toString()}>{tahun}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters}>Terapkan Filter</Button>
                            <Button variant="outline" onClick={resetFilters}>Reset</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No.</TableHead>
                                <TableHead>RT/RW</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead className="text-right">Jumlah KK</TableHead>
                                <TableHead className="text-right">Laki-laki</TableHead>
                                <TableHead className="text-right">Perempuan</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Kelahiran</TableHead>
                                <TableHead className="text-right">Kematian</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">RT {item.rt} / RW {item.rw}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{item.bulan_name} {item.periode_tahun}</div>
                                        </TableCell>
                                        <TableCell className="text-right text-orange-600 font-medium">
                                            {(item.jumlah_kk ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-blue-600 font-medium">
                                            {(item.jumlah_laki_laki ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-pink-600 font-medium">
                                            {(item.jumlah_perempuan ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {((item.jumlah_laki_laki ?? 0) + (item.jumlah_perempuan ?? 0)).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600">
                                            {(item.jumlah_kelahiran ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {(item.jumlah_kematian ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/data-kependudukan/persebaran-penduduk/detail-kk/${item.rt}/${item.rw}`}>
                                                    <Button variant="ghost" size="icon" title="Detail KK" className="text-orange-500 hover:text-orange-600">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('data-kependudukan.persebaran-penduduk.edit', item.id)}>
                                                    <Button variant="ghost" size="icon" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                        Belum ada data persebaran penduduk.
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
