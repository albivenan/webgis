import MapLegend from '@/components/maps/MapLegend';
import BaseMapLayers from '@/components/maps/BaseMapLayers';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_SOMAGEDE_CENTER, DESA_SOMAGEDE_BOUNDARY } from '@/data/mockMapEvents';
import { createDangerIcon, createDisasterIcon, getFacilityIconSVG } from '@/lib/map-icons';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, AlertTriangle, Edit, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Fix for default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Bencana {
    id: number;
    nama_bencana: string;
    jenis_bencana: string;
    tipe_lokasi: 'titik' | 'point' | 'polygon' | 'radius';
    lokasi_data: any;
    tanggal_mulai: string;
    status: string;
    tingkat_bahaya: string;
    korban_jiwa?: number;
    korban_luka?: number;
    keterangan: string;
    warna_penanda: string;
}

const tingkatBahayaColors = {
    rendah: 'bg-green-100 text-green-800',
    sedang: 'bg-yellow-100 text-yellow-800',
    tinggi: 'bg-orange-100 text-orange-800',
    sangat_tinggi: 'bg-red-100 text-red-800',
};

const tingkatBahayaMapColors: { [key: string]: string } = {
    rendah: '#22c55e',      // green-500
    sedang: '#facc15',      // yellow-400
    tinggi: '#f97316',      // orange-500
    sangat_tinggi: '#ef4444', // red-500
};

export default function BencanaBerlangsung({ bencana }: { bencana: Bencana[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    console.log("Data Bencana dari Controller:", bencana);
    const filteredBencana = bencana.filter(b =>
        b.nama_bencana.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.jenis_bencana.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log("Filtered Bencana:", filteredBencana);

    const handleSelesaikan = (id: number) => {
        if (confirm('Tandai bencana ini sebagai selesai?')) {
            router.post(route('bencana.selesaikan', { id: id }), {}, {
                onSuccess: () => {
                    toast.success("Berhasil", {
                        description: "Bencana telah ditandai selesai.",
                    });
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('bencana.destroy', { id: id }), {
                onSuccess: () => {
                    toast.success("Berhasil", {
                        description: "Data bencana berhasil dihapus.",
                    });
                }
            });
        }
    };

    const maxBounds = DESA_SOMAGEDE_BOUNDARY ? L.latLngBounds(DESA_SOMAGEDE_BOUNDARY) : undefined;

    return (
        <AppLayout>
            <Head title="Tragedi Berlangsung" />
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            Tragedi Berlangsung
                        </h1>
                        <p className="text-muted-foreground">Bencana alam yang sedang terjadi di Desa Somagede</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('bencana.riwayat')}>
                            <Button variant="outline">
                                Riwayat Tragedi
                            </Button>
                        </Link>
                        <Link href={route('bencana.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Bencana
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map Section */}
                    <Card className="lg:col-span-2 h-[600px] flex flex-col overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg">Peta Bencana Berlangsung</CardTitle>
                        </CardHeader>
                        <div className="flex-1 relative z-0">
                            <MapContainer
                                center={DESA_SOMAGEDE_CENTER}
                                zoom={14}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                maxBounds={maxBounds}
                                maxBoundsViscosity={1.0}
                                minZoom={13}
                            >
                                <BaseMapLayers />

                                {DESA_SOMAGEDE_BOUNDARY && (
                                    <Polygon
                                        positions={DESA_SOMAGEDE_BOUNDARY}
                                        pathOptions={{
                                            color: '#2563eb',
                                            fillColor: '#3b82f6',
                                            fillOpacity: 0.1,
                                            weight: 2,
                                            dashArray: '5, 5'
                                        }}
                                    />
                                )}

                                {filteredBencana.map((b) => {
                                    const color = tingkatBahayaMapColors[b.tingkat_bahaya] || '#71717a'; // default to gray
                                    const isPoint = b.tipe_lokasi === 'titik' || b.tipe_lokasi === 'point';

                                    if (isPoint && b.lokasi_data && b.lokasi_data.lat && b.lokasi_data.lng) {
                                        return (
                                            <Marker
                                                key={b.id}
                                                position={[b.lokasi_data.lat, b.lokasi_data.lng]}
                                                icon={createDisasterIcon(b.jenis_bencana, b.tingkat_bahaya)}
                                            >
                                                <Popup>
                                                    <div className="p-2">
                                                        <h3 className="font-bold">{b.nama_bencana}</h3>
                                                        <p className="text-sm">{b.jenis_bencana.replace(/_/g, ' ')}</p>
                                                        <div className="mt-1">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${tingkatBahayaColors[b.tingkat_bahaya as keyof typeof tingkatBahayaColors]}`}>
                                                                {b.tingkat_bahaya.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(b.tanggal_mulai).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    } else if (b.tipe_lokasi === 'polygon' && Array.isArray(b.lokasi_data)) {
                                        const polygonPositions = b.lokasi_data.map((coord: any) => Array.isArray(coord) ? coord : [coord.lat, coord.lng]);
                                        // Ensure we have valid positions for getCenter
                                        if (polygonPositions.length === 0) return null;

                                        // Explicitly cast to LatLngExpression[] for Leaflet
                                        const leafletPositions = polygonPositions as L.LatLngExpression[];
                                        const polygonCenter = L.latLngBounds(leafletPositions).getCenter();

                                        return (
                                            <div key={b.id}>
                                                <Polygon
                                                    positions={leafletPositions}
                                                    pathOptions={{
                                                        color: color,
                                                        fillColor: color,
                                                        fillOpacity: 0.4,
                                                        weight: 2,
                                                    }}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h3 className="font-bold">{b.nama_bencana}</h3>
                                                            <p className="text-sm">{b.jenis_bencana.replace(/_/g, ' ')}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(b.tanggal_mulai).toLocaleDateString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </Popup>
                                                </Polygon>
                                                <Marker
                                                    position={polygonCenter}
                                                    icon={createDisasterIcon(b.jenis_bencana, b.tingkat_bahaya)}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h3 className="font-bold">{b.nama_bencana}</h3>
                                                            <p className="text-sm">{b.jenis_bencana.replace(/_/g, ' ')}</p>
                                                            <div className="mt-1">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${tingkatBahayaColors[b.tingkat_bahaya as keyof typeof tingkatBahayaColors]}`}>
                                                                    {b.tingkat_bahaya.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            </div>
                                        );
                                    } else if (b.tipe_lokasi === 'radius' && b.lokasi_data.center && b.lokasi_data.radius) {
                                        return (
                                            <div key={b.id}>
                                                <Circle
                                                    center={[b.lokasi_data.center.lat, b.lokasi_data.center.lng]}
                                                    radius={b.lokasi_data.radius}
                                                    pathOptions={{
                                                        color: color,
                                                        fillColor: color,
                                                        fillOpacity: 0.4,
                                                        weight: 2,
                                                    }}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h3 className="font-bold">{b.nama_bencana}</h3>
                                                            <p className="text-sm">{b.jenis_bencana.replace(/_/g, ' ')}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Radius: {b.lokasi_data.radius}m
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(b.tanggal_mulai).toLocaleDateString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </Popup>
                                                </Circle>
                                                <Marker
                                                    position={[b.lokasi_data.center.lat, b.lokasi_data.center.lng]}
                                                    icon={createDisasterIcon(b.jenis_bencana, b.tingkat_bahaya)}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h3 className="font-bold">{b.nama_bencana}</h3>
                                                            <p className="text-sm">{b.jenis_bencana.replace(/_/g, ' ')}</p>
                                                            <div className="mt-1">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${tingkatBahayaColors[b.tingkat_bahaya as keyof typeof tingkatBahayaColors]}`}>
                                                                    {b.tingkat_bahaya.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                                <MapLegend
                                    title="Legenda Bencana"
                                    items={[
                                        // Danger Levels (Color)
                                        { label: 'Tingkat Bahaya (Warna)', color: 'transparent', type: 'point', iconHtml: '' },
                                        { label: 'Rendah', color: '#22c55e', type: 'point' },
                                        { label: 'Sedang', color: '#facc15', type: 'point' },
                                        { label: 'Tinggi', color: '#f97316', type: 'point' },
                                        { label: 'Sangat Tinggi', color: '#ef4444', type: 'point' },

                                        // Disaster Types (Icon)
                                        { label: '-----------------', color: 'transparent', type: 'point', iconHtml: '' },
                                        { label: 'Jenis Bencana (Ikon)', color: 'transparent', type: 'point', iconHtml: '' },
                                        { label: 'Banjir', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('banjir', '#6b7280', undefined, 24) },
                                        { label: 'Longsor', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('longsor', '#6b7280', undefined, 24) },
                                        { label: 'Gempa', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('gempa', '#6b7280', undefined, 24) },
                                        { label: 'Kebakaran', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('kebakaran', '#6b7280', undefined, 24) },
                                        { label: 'Angin Topan', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('angin_puting_beliung', '#6b7280', undefined, 24) },
                                        { label: 'Kekeringan', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('kekeringan', '#6b7280', undefined, 24) },
                                    ]}
                                />
                            </MapContainer>
                        </div>
                    </Card>

                    {/* List Section */}
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg">Daftar Bencana</CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari bencana..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bencana</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBencana.length > 0 ? (
                                        filteredBencana.map((b) => (
                                            <TableRow key={b.id}>
                                                <TableCell>
                                                    <div className="font-medium">{b.nama_bencana}</div>
                                                    <div className="text-xs text-muted-foreground">{b.jenis_bencana}</div>
                                                    <div className="flex gap-1 mt-1">
                                                        <Badge variant="outline" className={tingkatBahayaColors[b.tingkat_bahaya as keyof typeof tingkatBahayaColors]}>
                                                            {b.tingkat_bahaya.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {new Date(b.tanggal_mulai).toLocaleDateString('id-ID')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full"
                                                            onClick={() => handleSelesaikan(b.id)}
                                                        >
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Selesai
                                                        </Button>
                                                        <Link href={route('bencana.edit', { id: b.id })}>
                                                            <Button size="sm" variant="outline" className="w-full">
                                                                <Edit className="h-3 w-3 mr-1" /> Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="w-full"
                                                            onClick={() => handleDelete(b.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" /> Hapus
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                                Tidak ada bencana berlangsung
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
