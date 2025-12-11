import MapLegend from '@/components/maps/MapLegend';
import MarkerPopupContent from '@/components/maps/MarkerPopupContent';

import AppLayout from '@/layouts/app-layout';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polygon, Circle, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
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
import { Search, Plus, AlertTriangle, Edit, Trash2, CheckCircle, Eye } from 'lucide-react';
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
    tipe_lokasi: 'titik' | 'polygon' | 'radius';
    lokasi_data: any;
    luas?: number;
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

// Helper to format area
const formatLuas = (luas?: number): string => {
    if (!luas) return '-';
    if (luas >= 10000) {
        const hectares = luas / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
    return `${Math.round(luas).toLocaleString('id-ID')} m²`;
};

export default function BencanaBerlangsung({ bencana }: { bencana: Bencana[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [batasWilayahData, setBatasWilayahData] = useState<any[]>([]);

    useEffect(() => {
        const fetchBatasWilayah = async () => {
            try {
                const response = await axios.get(route('api.markers.batas-wilayah'));
                setBatasWilayahData(response.data);
            } catch (error) {
                console.error('Error fetching batas wilayah:', error);
            }
        };
        fetchBatasWilayah();
    }, []);

    const filteredBencana = bencana.filter(b =>
        b.nama_bencana.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.jenis_bencana.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelesaikan = (id: number) => {
        if (confirm('Tandai bencana ini sebagai selesai?')) {
            router.post(route('bencana.selesaikan', { bencana: id }), {}, {
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
            router.delete(route('bencana.destroy', { bencana: id }), {
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
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="Satellite (Esri)">
                                        <TileLayer
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="Topographic (OpenTopoMap)">
                                        <TileLayer
                                            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>

                                    {/* Desa Boundary */}
                                    {DESA_SOMAGEDE_BOUNDARY && (
                                        <LayersControl.Overlay checked name="Batas Desa">
                                            <Polygon
                                                positions={DESA_SOMAGEDE_BOUNDARY}
                                                pathOptions={{
                                                    color: '#2563eb',
                                                    fillColor: 'transparent',
                                                    weight: 3,
                                                    dashArray: '5, 5'
                                                }}
                                            />
                                        </LayersControl.Overlay>
                                    )}

                                    {/* Batas Wilayah from API */}
                                    <LayersControl.Overlay name="Batas Wilayah">
                                        <LayerGroup>
                                            {batasWilayahData.map((batas: any) => {
                                                if (!batas.geojson || !batas.geojson.coordinates) return null;

                                                const coordinates = batas.geojson.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]]);

                                                return (
                                                    <Polygon
                                                        key={`batas-wilayah-${batas.id}`}
                                                        positions={coordinates}
                                                        pathOptions={{
                                                            color: '#0000FF', // Blue color for batas wilayah
                                                            fillColor: '#ADD8E6', // Light blue fill
                                                            fillOpacity: 0.3,
                                                            weight: 2,
                                                        }}
                                                    >
                                                        <Popup>
                                                            <div className="p-2">
                                                                <h3 className="font-bold">{batas.nama_lahan}</h3>
                                                                <p className="text-sm">Luas: {batas.luas} m²</p>
                                                                <p className="text-xs text-muted-foreground mt-1">Jenis: {batas.jenis_lahan}</p>
                                                            </div>
                                                        </Popup>
                                                    </Polygon>
                                                );
                                            })}
                                        </LayerGroup>
                                    </LayersControl.Overlay>

                                    <LayersControl.Overlay checked name="Tragedi Berlangsung">
                                        <LayerGroup>
                                            {filteredBencana.map((b) => {
                                    const color = tingkatBahayaMapColors[b.tingkat_bahaya] || '#71717a'; // default to gray
                                    if (b.tipe_lokasi === 'titik' && typeof b.lokasi_data.lat === 'number' && typeof b.lokasi_data.lng === 'number') {
                                        return (
                                            <Marker
                                                key={`marker-${b.id}`}
                                                position={[b.lokasi_data.lat, b.lokasi_data.lng]}
                                                icon={createDisasterIcon(b.jenis_bencana, b.tingkat_bahaya)}
                                            >
                                                <Popup>
                                                    <MarkerPopupContent
                                                        name={b.nama_bencana}
                                                        type="bencana"
                                                        id={b.id}
                                                        additionalInfo={[
                                                            { label: 'Jenis', value: b.jenis_bencana.replace(/_/g, ' ') },
                                                            { label: 'Tingkat Bahaya', value: b.tingkat_bahaya.replace(/_/g, ' ') },
                                                            ...(b.luas ? [{ label: 'Luas', value: formatLuas(b.luas) }] : []),
                                                            { label: 'Tanggal', value: new Date(b.tanggal_mulai).toLocaleDateString('id-ID') },
                                                            ...(b.korban_jiwa ? [{ label: 'Korban Jiwa', value: b.korban_jiwa }] : []),
                                                            ...(b.korban_luka ? [{ label: 'Korban Luka', value: b.korban_luka }] : []),
                                                        ]}
                                                    />
                                                </Popup>
                                            </Marker>
                                        );
                                    }
 else if (b.tipe_lokasi === 'polygon' && Array.isArray(b.lokasi_data)) {
                                        if (b.lokasi_data.length === 0) return null; // Avoid division by zero

                                        const validLocations = b.lokasi_data.filter((loc: any) => typeof loc.lat === 'number' && typeof loc.lng === 'number');
                                        if (validLocations.length === 0) return null;

                                        const polygonCenter = validLocations.reduce(
                                            (acc: { lat: number; lng: number }, curr: { lat: number; lng: number }) => ({
                                                lat: acc.lat + curr.lat,
                                                lng: acc.lng + curr.lng,
                                            }),
                                            { lat: 0, lng: 0 }
                                        );
                                        polygonCenter.lat /= validLocations.length;
                                        polygonCenter.lng /= validLocations.length;

                                        return (
                                            <React.Fragment key={`fragment-${b.id}`}>
                                                <Polygon
                                                    key={`polygon-${b.id}`}
                                                    positions={validLocations.map((loc: { lat: number; lng: number }) => [loc.lat, loc.lng])}
                                                    pathOptions={{
                                                        color: color,
                                                        fillColor: color,
                                                        fillOpacity: 0.4,
                                                        weight: 2,
                                                    }}
                                                >
                                                    <Popup>
                                                        <MarkerPopupContent
                                                            name={b.nama_bencana}
                                                            type="bencana"
                                                            id={b.id}
                                                            additionalInfo={[
                                                                { label: 'Jenis', value: b.jenis_bencana.replace(/_/g, ' ') },
                                                                { label: 'Tingkat Bahaya', value: b.tingkat_bahaya.replace(/_/g, ' ') },
                                                                { label: 'Luas', value: formatLuas(b.luas) },
                                                                { label: 'Tanggal', value: new Date(b.tanggal_mulai).toLocaleDateString('id-ID') },
                                                                ...(b.korban_jiwa ? [{ label: 'Korban Jiwa', value: b.korban_jiwa }] : []),
                                                                ...(b.korban_luka ? [{ label: 'Korban Luka', value: b.korban_luka }] : []),
                                                            ]}
                                                        />
                                                    </Popup>
                                                </Polygon>
                                                <Marker
                                                    key={`marker-polygon-${b.id}`}
                                                    position={[polygonCenter.lat, polygonCenter.lng]}
                                                    icon={createDisasterIcon(b.jenis_bencana, b.tingkat_bahaya)}
                                                >
                                                    <Popup>
                                                        <MarkerPopupContent
                                                            name={b.nama_bencana}
                                                            type="bencana"
                                                            id={b.id}
                                                            additionalInfo={[
                                                                { label: 'Jenis', value: b.jenis_bencana.replace(/_/g, ' ') },
                                                                { label: 'Tingkat Bahaya', value: b.tingkat_bahaya.replace(/_/g, ' ') },
                                                                { label: 'Luas', value: formatLuas(b.luas) },
                                                                { label: 'Tanggal', value: new Date(b.tanggal_mulai).toLocaleDateString('id-ID') },
                                                                ...(b.korban_jiwa ? [{ label: 'Korban Jiwa', value: b.korban_jiwa }] : []),
                                                                ...(b.korban_luka ? [{ label: 'Korban Luka', value: b.korban_luka }] : []),
                                                            ]}
                                                        />
                                                    </Popup>
                                                </Marker>
                                            </React.Fragment>
                                        );
                                    } else if (b.tipe_lokasi === 'radius' && b.lokasi_data.center && b.lokasi_data.radius) {
                                        if (typeof b.lokasi_data.center.lat !== 'number' || typeof b.lokasi_data.center.lng !== 'number') return null;
                                        return (
                                            <React.Fragment key={`fragment-${b.id}`}>
                                                <Circle
                                                    key={`circle-${b.id}`}
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
                                                        <MarkerPopupContent
                                                            name={b.nama_bencana}
                                                            type="bencana"
                                                            id={b.id}
                                                            additionalInfo={[
                                                                { label: 'Jenis', value: b.jenis_bencana.replace(/_/g, ' ') },
                                                                { label: 'Tingkat Bahaya', value: b.tingkat_bahaya.replace(/_/g, ' ') },
                                                                { label: 'Radius', value: `${b.lokasi_data.radius}m` },
                                                                { label: 'Luas', value: formatLuas(b.luas) },
                                                                { label: 'Tanggal', value: new Date(b.tanggal_mulai).toLocaleDateString('id-ID') },
                                                                ...(b.korban_jiwa ? [{ label: 'Korban Jiwa', value: b.korban_jiwa }] : []),
                                                                ...(b.korban_luka ? [{ label: 'Korban Luka', value: b.korban_luka }] : []),
                                                            ]}
                                                        />
                                                    </Popup>
                                                </Circle>
                                                <Marker
                                                    key={`marker-radius-${b.id}`}
                                                    position={[b.lokasi_data.center.lat, b.lokasi_data.center.lng]}
                                                    icon={createDisasterIcon(b.jenis_bencana, b.tingkat_bahaya)}
                                                >
                                                    <Popup>
                                                        <MarkerPopupContent
                                                            name={b.nama_bencana}
                                                            type="bencana"
                                                            id={b.id}
                                                            additionalInfo={[
                                                                { label: 'Jenis', value: b.jenis_bencana.replace(/_/g, ' ') },
                                                                { label: 'Tingkat Bahaya', value: b.tingkat_bahaya.replace(/_/g, ' ') },
                                                                { label: 'Radius', value: `${b.lokasi_data.radius}m` },
                                                                { label: 'Luas', value: formatLuas(b.luas) },
                                                                { label: 'Tanggal', value: new Date(b.tanggal_mulai).toLocaleDateString('id-ID') },
                                                                ...(b.korban_jiwa ? [{ label: 'Korban Jiwa', value: b.korban_jiwa }] : []),
                                                                ...(b.korban_luka ? [{ label: 'Korban Luka', value: b.korban_luka }] : []),
                                                            ]}
                                                        />
                                                    </Popup>
                                                </Marker>
                                            </React.Fragment>
                                        );
                                    }
                                    return null;
                                })}
                                <MapLegend
                                    title="Legenda Bencana"
                                    items={[
                                        // Danger Levels
                                        { label: 'Tingkat Bahaya', color: 'transparent', type: 'point' }, // Header-ish
                                        { label: 'Rendah', color: '#22c55e', type: 'point' },
                                        { label: 'Sedang', color: '#facc15', type: 'point' },
                                        { label: 'Tinggi', color: '#f97316', type: 'point' },
                                        { label: 'Sangat Tinggi', color: '#ef4444', type: 'point' },

                                        // Disaster Types
                                        { label: '-----------------', color: 'transparent', type: 'point' },
                                        { label: 'Jenis Bencana', color: 'transparent', type: 'point' }, // Header-ish
                                        { label: 'Banjir', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('banjir', '#3b82f6', undefined, 24) },
                                        { label: 'Longsor', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('longsor', '#8B4513', undefined, 24) },
                                        { label: 'Gempa', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('gempa', '#FFA500', undefined, 24) },
                                        { label: 'Kebakaran', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('kebakaran', '#EF4444', undefined, 24) },
                                        { label: 'Angin Topan', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('angin_puting_beliung', '#6B7280', undefined, 24) },
                                        { label: 'Kekeringan', color: 'transparent', type: 'point', iconHtml: getFacilityIconSVG('kekeringan', '#FACC15', undefined, 24) },
                                    ]}
                                />
                            </LayerGroup>
                        </LayersControl.Overlay>
                    </LayersControl>
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
                                        <TableHead>Luas</TableHead>
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
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatLuas(b.luas)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Link href={route('bencana.show', { bencana: b.id })}>
                                                            <Button size="sm" variant="outline" className="w-full">
                                                                <Eye className="h-3 w-3 mr-1" /> Detail
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full"
                                                            onClick={() => handleSelesaikan(b.id)}
                                                        >
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Selesai
                                                        </Button>
                                                        <Link href={route('bencana.edit', { bencana: b.id })}>
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
