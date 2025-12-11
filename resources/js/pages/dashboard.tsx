import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DESA_SOMAGEDE_CENTER } from '@/data/mockMapEvents';

interface Stats {
    users: { total: number };
    kependudukan: { total_kk: number; total_penduduk: number };
    fasilitas: { total: number; umum: number; privat: number };
    batas_wilayah: { total: number };
    bencana: { total: number; berlangsung: number; selesai: number };
    lokasi_penting: { total: number };
}

interface FasilitasByType {
    type: string;
    count: number;
}

interface Bencana {
    id: number;
    nama_bencana: string;
    tanggal: string;
    status: string;
    lokasi: string;
}

interface Props {
    stats: Stats;
    recentBencana: Bencana[];
    fasilitasByType: FasilitasByType[];
}
import {
    MapPin,
    Users,
    Home,
    Building,
    AlertTriangle,
    Shield,
    Map as MapIcon,
    Settings,
    UserSquare,
    AlertCircle,
    Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({ stats, recentBencana, fasilitasByType }: Props) {

    const kependudukanData = [
        { name: 'Kartu Keluarga', value: stats.kependudukan.total_kk, fill: '#3b82f6' },
        { name: 'Total Penduduk', value: stats.kependudukan.total_penduduk, fill: '#10b981' },
    ];

    const fasilitasChartData = Array.isArray(fasilitasByType) ? fasilitasByType.map(item => ({
        name: item.type,
        value: item.count,
    })) : [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard WebGIS" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Welcome Card */}
                <div className="rounded-xl border border-sidebar-border/70 p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:border-sidebar-border">
                    <h1 className="text-3xl font-bold">WebGIS Desa Somagede</h1>
                    <p className="text-muted-foreground mt-2">
                        Dashboard Ringkasan Data Desa Somagede
                    </p>
                </div>

                {/* Main Statistics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Kependudukan */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Penduduk / KK</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <div className="text-2xl font-bold">{stats.kependudukan.total_penduduk}</div>
                                <span className="text-sm text-muted-foreground">Jiwa</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.kependudukan.total_kk} Kepala Keluarga
                            </p>
                        </CardContent>
                    </Card>

                    {/* Fasilitas */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fasilitas</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.fasilitas.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.fasilitas.umum} Umum, {stats.fasilitas.privat} Privat
                            </p>
                        </CardContent>
                    </Card>

                    {/* Batas Wilayah */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Batas Wilayah</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.batas_wilayah.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Area terdaftar
                            </p>
                        </CardContent>
                    </Card>

                    {/* Bencana (Current Active) */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bencana Aktif</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{stats.bencana.berlangsung}</div>
                            <p className="text-xs text-muted-foreground">
                                Total {stats.bencana.total} kejadian tercatat
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Lokasi Penting */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lokasi Penting</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.lokasi_penting.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Titik lokasi penting
                            </p>
                        </CardContent>
                    </Card>

                    {/* System Users */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pengguna Sistem</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Akun terdaftar
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Kependudukan Chart */}
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>Statistik Kependudukan</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={kependudukanData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" name="Jumlah" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Fasilitas Chart */}
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>Distribusi Fasilitas</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fasilitasChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {fasilitasChartData.map((entry: { name: string; value: number }, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Bencana List */}
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle>Riwayat Bencana Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentBencana.length > 0 ? (
                                recentBencana.map((bencana) => (
                                    <div key={bencana.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-full ${bencana.status === 'berlangsung' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {bencana.status === 'berlangsung' ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{bencana.nama_bencana}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {bencana.lokasi}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(bencana.tanggal), 'dd MMMM yyyy', { locale: id })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            className={
                                                bencana.status === 'berlangsung'
                                                    ? 'bg-red-500 hover:bg-red-500/80'
                                                    : 'bg-green-500 hover:bg-green-500/80'
                                            }
                                        >
                                            {bencana.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-4">Tidak ada data bencana terbaru.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Shortcuts */}
                <div className="gap-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                    <Link href="/peta-interaktif" className="bg-card border hover:bg-muted transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center">
                        <MapIcon className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Peta Interaktif</span>
                    </Link>
                    <Link href="/data-kependudukan/persebaran-penduduk" className="bg-card border hover:bg-muted transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center">
                        <Users className="h-6 w-6 text-blue-600" />
                        <span className="text-sm font-medium">Data Penduduk</span>
                    </Link>
                    <Link href="/fasilitas" className="bg-card border hover:bg-muted transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center">
                        <Building className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium">Fasilitas</span>
                    </Link>
                    <Link href="/bencana/berlangsung" className="bg-card border hover:bg-muted transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                        <span className="text-sm font-medium">Lapor Bencana</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
