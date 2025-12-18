import AppLayout from '@/layouts/app-layout';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Circle, useMap, useMapEvents, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_SOMAGEDE_CENTER, DESA_SOMAGEDE_BOUNDARY } from '@/data/mockMapEvents';
import { Head, Link, useForm } from '@inertiajs/react';
import MapLegend from '@/components/maps/MapLegend';
import { createDisasterIcon, getFacilityIconSVG } from '@/lib/map-icons';
import PolygonDrawer from '@/components/maps/PolygonDrawer';

const tingkatBahayaMapColors: { [key: string]: string } = {
    rendah: '#22c55e',      // green-500
    sedang: '#facc15',      // yellow-400
    tinggi: '#f97316',      // orange-500
    sangat_tinggi: '#ef4444', // red-500
};
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Save, MapPin, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

// Fix for default icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component for point marker
function PointMarker({ onLocationSelect, disasterType, dangerLevel }: { onLocationSelect: (lat: number, lng: number) => void, disasterType: string, dangerLevel: string }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker key={`${disasterType}-${dangerLevel}`} position={position} icon={createDisasterIcon(disasterType, dangerLevel)} /> : null;
}



// Component for radius circle
function RadiusCircle({ onRadiusComplete, color }: {
    onRadiusComplete: (center: { lat: number; lng: number }, radius: number) => void;
    color: string;
}) {
    const [center, setCenter] = useState<L.LatLng | null>(null);
    const [radius, setRadius] = useState(100);
    const controlRef = React.useRef<HTMLDivElement>(null);

    // Disable click propagation on the control to prevent map clicks
    useEffect(() => {
        if (controlRef.current) {
            L.DomEvent.disableClickPropagation(controlRef.current);
            L.DomEvent.disableScrollPropagation(controlRef.current);
        }
    }, []);

    useMapEvents({
        click(e) {
            setCenter(e.latlng);
        },
    });

    const handleComplete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (center) {
            onRadiusComplete({ lat: center.lat, lng: center.lng }, radius);
        }
    };

    return (
        <>
            {center && (
                <>
                    <Circle
                        center={center}
                        radius={isNaN(radius) || radius <= 0 ? 100 : radius}
                        pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: 0.4,
                        }}
                    />
                    <Marker position={center} />
                </>
            )}
            <div
                ref={controlRef}
                className="leaflet-top leaflet-left"
                style={{ marginTop: '10px', marginLeft: '10px', zIndex: 1000 }}
            >
                <div className="leaflet-control leaflet-bar bg-white p-2 rounded shadow-md space-y-2">
                    <p className="text-xs font-medium">Klik peta untuk set center</p>
                    <div>
                        <Label className="text-xs">Radius: {radius}m</Label>
                        <Slider
                            value={[isNaN(radius) ? 100 : radius]}
                            onValueChange={(v) => {
                                if (v && v.length > 0) {
                                    setRadius(v[0]);
                                }
                            }}
                            min={50}
                            max={1000}
                            step={50}
                            className="w-32"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleComplete}
                        size="sm"
                        disabled={!center}
                    >
                        Selesai
                    </Button>
                </div>
            </div>
        </>
    );
}

interface Point {
    lat: number;
    lng: number;
}

interface Radius {
    center: Point;
    radius: number;
}

type Polygon = [number, number][];

type Bencana = {
    id: number;
    nama_bencana: string;
    jenis_bencana: string;
    tipe_lokasi: 'titik' | 'polygon' | 'radius';
    lokasi_data: Point | Polygon | Radius | null;
    tanggal_mulai: string;
    tanggal_selesai?: string;
    status: 'berlangsung' | 'selesai';
    tingkat_bahaya: 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi';
    korban_jiwa: number | null;
    korban_luka: number | null;
    kerusakan_infrastruktur: string;
    keterangan: string;
    warna_penanda: string;
    luas?: string | null;
}

interface Props {
    bencana?: Bencana;
}

// Helper function to calculate polygon area in square meters
function calculatePolygonArea(coordinates: [number, number][]): string {
    if (!coordinates || coordinates.length < 3) return '-';

    // Shoelace formula
    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i][0] * coordinates[j][1];
        area -= coordinates[j][0] * coordinates[i][1];
    }

    area = Math.abs(area) / 2;

    // Convert to meters (approximate)
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * 0.991;

    const areaInSquareMeters = area * metersPerDegreeLat * metersPerDegreeLng;

    if (areaInSquareMeters >= 10000) {
        const hectares = areaInSquareMeters / 10000;
        return `${hectares.toFixed(2)} ha`;
    }

    return `${Math.round(areaInSquareMeters).toLocaleString('id-ID')} m²`;
}

// Helper function to calculate radius area in square meters
function calculateRadiusArea(radiusData: any): string {
    if (!radiusData || !radiusData.radius) return '-';

    const radius = radiusData.radius;
    const areaInSquareMeters = Math.PI * radius * radius;

    if (areaInSquareMeters >= 10000) {
        const hectares = areaInSquareMeters / 10000;
        return `${hectares.toFixed(2)} ha`;
    }

    return `${Math.round(areaInSquareMeters).toLocaleString('id-ID')} m²`;
}

export default function CreateBencana({ bencana }: Props) {
    const isEdit = !!bencana;
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors } = useForm({
        nama_bencana: bencana?.nama_bencana || '',
        jenis_bencana: bencana?.jenis_bencana || 'banjir',
        tipe_lokasi: bencana?.tipe_lokasi || 'titik',
        lokasi_data: (() => {
            if (bencana?.lokasi_data) {
                if (bencana.tipe_lokasi === 'polygon' && !Array.isArray(bencana.lokasi_data)) {
                    // If it's a polygon but stored as a single point, convert it to an array of arrays
                    const point = bencana.lokasi_data as Point;
                    return [[point.lat, point.lng]];
                }
            }
            return bencana?.lokasi_data || null;
        })(),
        luas: bencana?.luas || null,
        tanggal_mulai: bencana?.tanggal_mulai ? new Date(bencana.tanggal_mulai).toISOString().slice(0, 16) : '',
        tanggal_selesai: bencana?.tanggal_selesai ? new Date(bencana.tanggal_selesai).toISOString().slice(0, 16) : '',
        status: bencana?.status || 'berlangsung',
        tingkat_bahaya: bencana?.tingkat_bahaya || 'sedang',
        korban_jiwa: bencana?.korban_jiwa ?? 0,
        korban_luka: bencana?.korban_luka ?? 0,
        kerusakan_infrastruktur: bencana?.kerusakan_infrastruktur || '',
        keterangan: bencana?.keterangan || '',
        warna_penanda: bencana?.warna_penanda || '#ef4444',
        foto: null as File | null,
    });




    const handlePointSelect = (lat: number, lng: number) => {
        setData('lokasi_data', { lat, lng });
    };

    const handlePolygonComplete = (coords: [number, number][]) => {
        console.log('Polygon completed with coords:', coords);
        setData('lokasi_data', coords);
    };

    const handleRadiusComplete = (center: { lat: number; lng: number }, radius: number) => {
        setData('lokasi_data', { center, radius });
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Gagal", {
                    description: "Ukuran foto tidak boleh lebih dari 2MB.",
                });
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                toast.error("Gagal", {
                    description: "Format foto harus JPG, JPEG, atau PNG.",
                });
                return;
            }

            setData('foto', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setFotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFoto = () => {
        setData('foto', null);
        setFotoPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(route('bencana.update', { id: bencana.id }), {
                onSuccess: () => {
                    toast.success("Berhasil", {
                        description: "Data bencana berhasil diperbarui.",
                    });
                },
            });
        } else {
            post(route('bencana.store'), {
                onSuccess: () => {
                    toast.success("Berhasil", {
                        description: "Data bencana berhasil ditambahkan.",
                    });
                },
            });
        }
    };

    const maxBounds = DESA_SOMAGEDE_BOUNDARY ? L.latLngBounds(DESA_SOMAGEDE_BOUNDARY) : undefined;

    return (
        <AppLayout>
            <Head title={isEdit ? "Edit Bencana" : "Tambah Bencana"} />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('bencana.berlangsung')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit" : "Tambah"} Bencana</h1>
                        <p className="text-muted-foreground">Tandai lokasi bencana dengan titik, polygon, atau radius</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Informasi Bencana</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_bencana">Nama Bencana</Label>
                                <Input
                                    id="nama_bencana"
                                    value={data.nama_bencana}
                                    onChange={e => setData('nama_bencana', e.target.value)}
                                    required
                                />
                                {errors.nama_bencana && <p className="text-sm text-red-500">{errors.nama_bencana}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis_bencana">Jenis Bencana</Label>
                                <Select value={data.jenis_bencana} onValueChange={(value) => setData('jenis_bencana', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="banjir">Banjir</SelectItem>
                                        <SelectItem value="longsor">Longsor</SelectItem>
                                        <SelectItem value="gempa">Gempa</SelectItem>
                                        <SelectItem value="kebakaran">Kebakaran</SelectItem>
                                        <SelectItem value="angin_puting_beliung">Angin Puting Beliung</SelectItem>
                                        <SelectItem value="kekeringan">Kekeringan</SelectItem>
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipe_lokasi">Tipe Penandaan</Label>
                                <Select value={data.tipe_lokasi} onValueChange={(value) => {
                                    setData(d => ({
                                        ...d,
                                        tipe_lokasi: value as 'titik' | 'polygon' | 'radius',
                                        lokasi_data: null
                                    }));
                                }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="titik">Titik (Marker)</SelectItem>
                                        <SelectItem value="polygon">Polygon (Area)</SelectItem>
                                        <SelectItem value="radius">Radius (Circle)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(data.tipe_lokasi === 'polygon' || data.tipe_lokasi === 'radius') && (
                                <div className="space-y-2">
                                    <Label>Luas Area</Label>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm font-medium text-blue-900">
                                            {data.tipe_lokasi === 'polygon' && data.lokasi_data ? calculatePolygonArea(data.lokasi_data as [number, number][]) : 'Belum ada data lokasi'}
                                            {data.tipe_lokasi === 'radius' && data.lokasi_data ? calculateRadiusArea(data.lokasi_data as any) : 'Belum ada data lokasi'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="tingkat_bahaya">Tingkat Bahaya</Label>
                                <Select value={data.tingkat_bahaya} onValueChange={(value) => setData('tingkat_bahaya', value as 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rendah">Rendah</SelectItem>
                                        <SelectItem value="sedang">Sedang</SelectItem>
                                        <SelectItem value="tinggi">Tinggi</SelectItem>
                                        <SelectItem value="sangat_tinggi">Sangat Tinggi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                                <Input
                                    id="tanggal_mulai"
                                    type="datetime-local"
                                    value={data.tanggal_mulai}
                                    onChange={e => setData('tanggal_mulai', e.target.value)}
                                    required
                                />
                            </div>

                            {isEdit && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                                        <Input
                                            id="tanggal_selesai"
                                            type="datetime-local"
                                            value={data.tanggal_selesai}
                                            onChange={e => setData('tanggal_selesai', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value as 'berlangsung' | 'selesai')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="berlangsung">Berlangsung</SelectItem>
                                                <SelectItem value="selesai">Selesai</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="korban_jiwa">Korban Jiwa</Label>
                                    <Input
                                        id="korban_jiwa"
                                        type="number"
                                        min="0"
                                        value={data.korban_jiwa === null ? '' : String(data.korban_jiwa)}
                                        onChange={e => setData('korban_jiwa', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="korban_luka">Korban Luka</Label>
                                    <Input
                                        id="korban_luka"
                                        type="number"
                                        min="0"
                                        value={data.korban_luka === null ? '' : String(data.korban_luka)}
                                        onChange={e => setData('korban_luka', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kerusakan_infrastruktur">Kerusakan Infrastruktur</Label>
                                <Textarea
                                    id="kerusakan_infrastruktur"
                                    value={data.kerusakan_infrastruktur}
                                    onChange={e => setData('kerusakan_infrastruktur', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Textarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={e => setData('keterangan', e.target.value)}
                                    required
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foto">Foto Bencana (Opsional)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="foto" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                            <div className="text-center">
                                                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm font-medium">Klik untuk upload foto</p>
                                                <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 2MB)</p>
                                            </div>
                                            <input
                                                id="foto"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={handleFotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {fotoPreview && (
                                        <div className="relative w-24 h-24">
                                            <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={handleRemoveFoto}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {data.lokasi_data && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-800">✓ Lokasi berhasil ditandai</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={processing || !data.lokasi_data}>
                                <Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Simpan"} Bencana
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Map Section */}
                    <Card className="lg:col-span-2 h-[700px] flex flex-col overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-red-500" /> Tandai Lokasi Bencana
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {data.tipe_lokasi === 'titik' && 'Klik pada peta untuk menandai lokasi'}
                                {data.tipe_lokasi === 'polygon' && 'Klik beberapa titik untuk membuat area polygon'}
                                {data.tipe_lokasi === 'radius' && 'Klik untuk set center, atur radius, lalu klik selesai'}
                            </p>
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

                                    {DESA_SOMAGEDE_BOUNDARY && (
                                        <LayersControl.Overlay checked name="Batas Desa">
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
                                        </LayersControl.Overlay>
                                    )}

                                    <LayersControl.Overlay checked name="Penanda Bencana">
                                        <LayerGroup>
                                            {data.tipe_lokasi === 'polygon' && data.lokasi_data && (
                                                <Polygon
                                                    positions={data.lokasi_data as L.LatLngTuple[]}
                                                    pathOptions={{
                                                        color: data.warna_penanda,
                                                        fillColor: data.warna_penanda,
                                                        fillOpacity: 0.4,
                                                        weight: 2,
                                                    }}
                                                />
                                            )}

                                            {data.tipe_lokasi === 'radius' && data.lokasi_data && (data.lokasi_data as any).radius && (data.lokasi_data as any).center && (
                                                <Circle
                                                    center={(data.lokasi_data as Radius).center}
                                                    radius={(data.lokasi_data as Radius).radius}
                                                    pathOptions={{
                                                        color: data.warna_penanda,
                                                        fillColor: data.warna_penanda,
                                                        fillOpacity: 0.4,
                                                    }}
                                                />
                                            )}

                                            {data.tipe_lokasi === 'titik' && data.lokasi_data && (
                                                <Marker
                                                    position={data.lokasi_data as Point}
                                                    icon={createDisasterIcon(data.jenis_bencana, data.tingkat_bahaya)}
                                                />
                                            )}
                                        </LayerGroup>
                                    </LayersControl.Overlay>
                                </LayersControl>

                                {data.tipe_lokasi === 'titik' && (
                                    <PointMarker
                                        onLocationSelect={handlePointSelect}
                                        disasterType={data.jenis_bencana}
                                        dangerLevel={data.tingkat_bahaya}
                                    />
                                )}

                                {data.tipe_lokasi === 'polygon' && (
                                    <PolygonDrawer
                                        onPolygonComplete={handlePolygonComplete}
                                        color={data.warna_penanda}
                                        opacity={0.4}
                                    />
                                )}

                                {data.tipe_lokasi === 'radius' && (
                                    <RadiusCircle
                                        onRadiusComplete={handleRadiusComplete}
                                        color={data.warna_penanda}
                                    />
                                )}
                                <MapLegend
                                    title="Legenda Bencana"
                                    items={[{
                                        label: `${data.jenis_bencana.replace(/_/g, ' ')} (${data.tingkat_bahaya.replace(/_/g, ' ')})`,
                                        color: 'transparent',
                                        type: 'point',
                                        iconHtml: getFacilityIconSVG(data.jenis_bencana, tingkatBahayaMapColors[data.tingkat_bahaya] || '#3b82f6', undefined, 24)
                                    }]}
                                />
                            </MapContainer>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
