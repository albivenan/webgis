import L from 'leaflet';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import MapView from '@/components/maps/map-view';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Car, AlertTriangle, Layers, Loader2, Compass, X, Info, ExternalLink, Navigation } from 'lucide-react';
import { DESA_SOMAGEDE_BOUNDARY } from '@/data/mockMapEvents';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Peta Interaktif', href: '/peta-interaktif' },
];

interface LokasiPentingMarker {
    id: number;
    nama: string;
    description?: string;
    latitude: number;
    longitude: number;
    // Tambahkan properti lain jika ada
}

export default function PetaInteraktif() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLayers, setActiveLayers] = useState<string[]>(() => {
        const params = new URLSearchParams(window.location.search);
        const layerParam = params.get('layer');
        if (layerParam) {
            return [layerParam];
        } else {
            // Default: All active except 'riwayat-tragedi'
            return ['lokasi-penduduk', 'fasilitas-umum', 'fasilitas-privat', 'fasilitas-jalan', 'batas-wilayah', 'tragedi-berlangsung'];
        }
    });
    const [lokasiPentingMarkers, setLokasiPentingMarkers] = useState<LokasiPentingMarker[]>([]);
    const [fasilitasUmumMarkers, setFasilitasUmumMarkers] = useState([]);
    const [fasilitasPrivatMarkers, setFasilitasPrivatMarkers] = useState([]);
    const [fasilitasJalanMarkers, setFasilitasJalanMarkers] = useState([]);
    const [bencanaBerlangsungMarkers, setBencanaBerlangsungMarkers] = useState([]);
    const [bencanaRiwayatMarkers, setBencanaRiwayatMarkers] = useState([]);
    const [rumahMarkers, setRumahMarkers] = useState([]);
    const [batasWilayahMarkers, setBatasWilayahMarkers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [flyToLocation, setFlyToLocation] = useState<[number, number] | undefined>(undefined);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [
                    resRumah,
                    resFasUmum,
                    resFasPrivat,
                    resFasJalan,
                    resBatas,
                    resBerlangsung,
                    resRiwayat,
                    resPenting
                ] = await Promise.all([
                    axios.get(route('api.markers.rumah')),
                    axios.get(route('api.markers.fasilitas', { tipe: 'umum' })),
                    axios.get(route('api.markers.fasilitas', { tipe: 'privat' })),
                    axios.get(route('api.markers.fasilitas', { tipe: 'jalan' })),
                    axios.get(route('api.markers.batas-wilayah')),
                    axios.get(route('api.markers.bencana', { status: 'berlangsung' })),
                    axios.get(route('api.markers.bencana', { status: 'riwayat' })),
                    axios.get(route('api.markers.lokasi-penting'))
                ]);

                setRumahMarkers(resRumah.data);
                setFasilitasUmumMarkers(resFasUmum.data);
                setFasilitasPrivatMarkers(resFasPrivat.data);
                setFasilitasJalanMarkers(resFasJalan.data);
                setBatasWilayahMarkers(resBatas.data.map((item: any) => ({
                    ...item,
                    coordinates: Array.isArray(item.coordinates) ? item.coordinates : []
                })));
                setBencanaBerlangsungMarkers(resBerlangsung.data);
                setBencanaRiwayatMarkers(resRiwayat.data);
                setLokasiPentingMarkers(resPenting.data);
            } catch (error) {
                console.error("Error fetching map data:", error);
            } finally {
                // Small delay for smooth transition
                setTimeout(() => setIsLoading(false), 800);
            }
        };

        fetchAllData();
    }, []);

    // Unified list of all locations for search
    const allLocations = useMemo(() => {
        const locations: any[] = [];

        rumahMarkers.forEach((item: any) => locations.push({
            id: item.id,
            nama: item.nama_pemilik || item.alamat,
            type: 'rumah',
            description: `RT ${item.rt} / RW ${item.rw}`,
            location: [item.latitude, item.longitude],
            raw: item
        }));

        fasilitasUmumMarkers.forEach((item: any) => locations.push({
            id: item.id,
            nama: item.nama,
            type: 'fasilitas',
            description: item.jenis,
            location: item.koordinat ? [item.koordinat[1], item.koordinat[0]] : null,
            raw: item
        }));

        fasilitasPrivatMarkers.forEach((item: any) => locations.push({
            id: item.id,
            nama: item.nama,
            type: 'fasilitas',
            description: item.jenis,
            location: item.koordinat ? [item.koordinat[1], item.koordinat[0]] : null,
            raw: item
        }));

        fasilitasJalanMarkers.forEach((item: any) => {
            let loc = null;
            if (item.koordinat?.type === 'LineString' && item.koordinat.coordinates.length > 0) {
                const mid = item.koordinat.coordinates[Math.floor(item.koordinat.coordinates.length / 2)];
                loc = [mid[1], mid[0]];
            }
            locations.push({
                id: item.id,
                nama: item.nama,
                type: 'fasilitas',
                description: item.jenis.replace(/_/g, ' '),
                location: loc,
                raw: item
            });
        });

        bencanaBerlangsungMarkers.forEach((item: any) => {
            let loc = null;
            if (item.lokasi_data?.lat) loc = [item.lokasi_data.lat, item.lokasi_data.lng];
            else if (item.lokasi_data?.center) loc = [item.lokasi_data.center.lat, item.lokasi_data.center.lng];

            locations.push({
                id: item.id,
                nama: item.nama_bencana,
                type: 'bencana',
                description: item.jenis_bencana,
                location: loc,
                raw: item
            });
        });

        batasWilayahMarkers.forEach((item: any) => {
            let loc = null;
            if (item.coordinates && item.coordinates.length > 0) {
                const bounds = L.latLngBounds(item.coordinates);
                const center = bounds.getCenter();
                loc = [center.lat, center.lng];
            }
            locations.push({
                id: item.id,
                nama: item.nama,
                type: 'batas-wilayah',
                description: item.jenis,
                location: loc,
                raw: item
            });
        });

        return locations;
    }, [rumahMarkers, fasilitasUmumMarkers, fasilitasPrivatMarkers, fasilitasJalanMarkers, bencanaBerlangsungMarkers, batasWilayahMarkers]);

    // Handle initial search from query params (Landing Page deep-linking)
    useEffect(() => {
        if (!isLoading && allLocations.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const initialSearch = params.get('search');
            if (initialSearch) {
                const query = initialSearch.toLowerCase();
                const matched = allLocations.find(loc =>
                    loc.nama.toLowerCase().includes(query) ||
                    loc.description?.toLowerCase().includes(query)
                );

                if (matched && matched.location) {
                    setFlyToLocation(matched.location);
                    // Standard mapped element object for side panel
                    const mappedElem = {
                        id: matched.id,
                        nama: matched.nama,
                        type: matched.type,
                        category: matched.description,
                        location: matched.location,
                        image: matched.raw.foto_rumah || matched.raw.foto || matched.raw.foto_bencana,
                        details: matched.type === 'rumah' ? [
                            { label: 'RT/RW', value: `${matched.raw.rt}/${matched.raw.rw}` },
                            ...(matched.raw.keterangan ? [{ label: 'Keterangan', value: matched.raw.keterangan }] : [])
                        ] : matched.type === 'bencana' ? [
                            { label: 'Jenis', value: matched.raw.jenis_bencana },
                            { label: 'Status', value: matched.raw.status }
                        ] : matched.type === 'batas-wilayah' ? [
                            { label: 'Jenis', value: matched.raw.jenis },
                            { label: 'Pemilik', value: matched.raw.nama_pemilik },
                            { label: 'Luas', value: matched.raw.luas ? `${(matched.raw.luas / 10000).toFixed(2)} ha` : '-' }
                        ] : [
                            { label: 'Jenis', value: matched.raw.jenis },
                            { label: 'Kondisi', value: matched.raw.kondisi }
                        ],
                        raw: matched.raw
                    };
                    setSelectedElement(mappedElem);
                }
            }
        }
    }, [isLoading, allLocations]);

    const filteredLocations = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return [];
        const query = searchQuery.toLowerCase();
        return allLocations.filter(loc =>
            loc.nama.toLowerCase().includes(query) ||
            loc.description?.toLowerCase().includes(query)
        ).slice(0, 10);
    }, [searchQuery, allLocations]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const toggleLayer = (layerId: string) => {
        setActiveLayers(prev =>
            prev.includes(layerId)
                ? prev.filter(l => l !== layerId)
                : [...prev, layerId]
        );
    };

    const layerOptions = [
        { id: 'lokasi-penduduk', label: 'Lokasi Penduduk', icon: '🏠' },
        { id: 'fasilitas-umum', label: 'Fasilitas Umum', icon: '🏥' },
        { id: 'fasilitas-privat', label: 'Fasilitas Privat', icon: '🏢' },
        { id: 'fasilitas-jalan', label: 'Fasilitas Jalan', icon: '🛣️' },
        { id: 'batas-wilayah', label: 'Batas Wilayah', icon: '📍' },
        { id: 'tragedi-berlangsung', label: 'Tragedi Berlangsung', icon: '⚠️' },
        { id: 'riwayat-tragedi', label: 'Riwayat Tragedi', icon: '📋' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Interaktif" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 relative">
                <div className="rounded-xl border border-sidebar-border/70 p-0 overflow-hidden h-[calc(100vh-8rem)] dark:border-sidebar-border shadow-md relative">
                    {isLoading ? (
                        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-500">
                            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                    <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-emerald-500 animate-pulse" />
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        Menyiapkan Peta
                                    </h3>
                                    <p className="text-sm text-muted-foreground animate-pulse">
                                        sedang memuat data lokasi...
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <MapView
                            lokasiPenting={lokasiPentingMarkers} // Fetched API data
                            fasilitasUmum={fasilitasUmumMarkers} // Fetched API data
                            fasilitasPrivat={fasilitasPrivatMarkers} // Fetched API data
                            fasilitasJalan={fasilitasJalanMarkers} // Fetched API data
                            bencanaBerlangsung={bencanaBerlangsungMarkers} // Fetched API data
                            bencanaRiwayat={bencanaRiwayatMarkers} // Fetched API data
                            rumah={rumahMarkers}         // Fetched API data
                            batasWilayah={batasWilayahMarkers} // Fetched API data
                            villageBoundary={DESA_SOMAGEDE_BOUNDARY}
                            activeLayers={activeLayers}
                            onElementClick={setSelectedElement}
                            flyToLocation={flyToLocation}
                        />
                    )}
                </div>

                {/* Overlays (Rendered last and with high z-index to be on top) */}

                {/* Search Bar Overlay */}
                <div className="absolute top-8 left-8 z-[1001] w-72 bg-background/90 backdrop-blur shadow-lg rounded-lg border p-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari lokasi di Desa Somagede..."
                            className="w-full pl-8 pr-4 py-2 text-sm bg-transparent border-none focus:ring-0 outline-none"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    {searchQuery && (
                        <div className="mt-2 max-h-80 overflow-y-auto border-t pt-2">
                            {filteredLocations.length > 0 ? (
                                <ul className="space-y-1">
                                    {filteredLocations.map((loc: any) => (
                                        <li
                                            key={`${loc.type}-${loc.id}`}
                                            className="px-3 py-2 hover:bg-muted/80 rounded-md cursor-pointer text-sm flex flex-col transition-colors border border-transparent hover:border-border"
                                            onClick={() => {
                                                setSearchQuery('');
                                                if (loc.location) {
                                                    setFlyToLocation(loc.location);
                                                    // Trigger element click manually to open side panel
                                                    const mappedElem = {
                                                        id: loc.id,
                                                        nama: loc.nama,
                                                        type: loc.type,
                                                        category: loc.description,
                                                        location: loc.location,
                                                        image: loc.raw.foto_rumah || loc.raw.foto || loc.raw.foto_bencana,
                                                        details: loc.type === 'rumah' ? [
                                                            { label: 'RT/RW', value: `${loc.raw.rt}/${loc.raw.rw}` },
                                                            ...(loc.raw.keterangan ? [{ label: 'Keterangan', value: loc.raw.keterangan }] : [])
                                                        ] : loc.type === 'bencana' ? [
                                                            { label: 'Jenis', value: loc.raw.jenis_bencana },
                                                            { label: 'Status', value: loc.raw.status }
                                                        ] : loc.type === 'batas-wilayah' ? [
                                                            { label: 'Jenis', value: loc.raw.jenis },
                                                            { label: 'Pemilik', value: loc.raw.nama_pemilik },
                                                            { label: 'Luas', value: loc.raw.luas ? `${(loc.raw.luas / 10000).toFixed(2)} ha` : '-' }
                                                        ] : [
                                                            { label: 'Jenis', value: loc.raw.jenis },
                                                            { label: 'Kondisi', value: loc.raw.kondisi }
                                                        ],
                                                        raw: loc.raw
                                                    };
                                                    setSelectedElement(mappedElem);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold flex items-center gap-2 text-foreground">
                                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                                    {loc.nama}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">
                                                    {loc.type}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-0.5">{loc.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground px-2 py-3 text-center">Lokasi tidak ditemukan</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                {selectedElement && (
                    <div className="absolute top-8 left-8 bottom-8 z-[1010] w-80 bg-background/95 backdrop-blur shadow-2xl rounded-xl border flex flex-col animate-in slide-in-from-left duration-300 overflow-hidden">
                        {/* Header Image/Pattern */}
                        <div className="h-32 bg-muted relative overflow-hidden shrink-0">
                            {selectedElement.image ? (
                                <img
                                    src={selectedElement.image}
                                    className="w-full h-full object-cover"
                                    alt={selectedElement.nama}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                                    <MapPin className="h-12 w-12 text-emerald-500/30" />
                                </div>
                            )}
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-md"
                                onClick={() => setSelectedElement(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 overflow-y-auto">
                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                    {selectedElement.type.replace(/-/g, ' ')}
                                </span>
                                <h3 className="text-xl font-bold text-foreground mt-2 leading-tight">
                                    {selectedElement.nama}
                                </h3>
                                {selectedElement.category && (
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                        <Info className="h-3.5 w-3.5" />
                                        {selectedElement.category.replace(/_/g, ' ')}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                {selectedElement.details?.map((detail: any, idx: number) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">
                                            {detail.label}
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {detail.value || '-'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t shrink-0 bg-muted/30">
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={() => {
                                        let detailRoute = '';
                                        if (selectedElement.type === 'rumah') {
                                            detailRoute = route('persebaran-penduduk.index');
                                        } else if (selectedElement.type === 'fasilitas') {
                                            detailRoute = route('fasilitas.index');
                                        } else if (selectedElement.type === 'bencana') {
                                            detailRoute = selectedElement.raw?.status === 'berlangsung'
                                                ? route('bencana.berlangsung')
                                                : route('bencana.riwayat');
                                        } else if (selectedElement.type === 'batas-wilayah') {
                                            detailRoute = route('batas-wilayah.index');
                                        }
                                        if (detailRoute) window.location.href = detailRoute;
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Buka Detail
                                </Button>
                                {selectedElement.location && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setFlyToLocation(selectedElement.location)}
                                    >
                                        <Navigation className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
