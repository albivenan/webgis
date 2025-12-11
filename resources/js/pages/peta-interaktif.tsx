import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import MapView from '@/components/maps/map-view';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Car, AlertTriangle, Layers } from 'lucide-react';
import { getEventsByType, DESA_SOMAGEDE_BOUNDARY } from '@/data/mockMapEvents';
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
            return ['lokasi-penduduk', 'fasilitas-umum', 'fasilitas-privat', 'fasilitas-jalan', 'batas-wilayah', 'tragedi-berlangsung', 'riwayat-tragedi'];
        }
    });
    const [showLayerPanel, setShowLayerPanel] = useState(false);
    const [lokasiPentingMarkers, setLokasiPentingMarkers] = useState<LokasiPentingMarker[]>([]);
    const [fasilitasUmumMarkers, setFasilitasUmumMarkers] = useState([]);
    const [fasilitasPrivatMarkers, setFasilitasPrivatMarkers] = useState([]);
    const [fasilitasJalanMarkers, setFasilitasJalanMarkers] = useState([]);
    const [bencanaBerlangsungMarkers, setBencanaBerlangsungMarkers] = useState([]);
    const [bencanaRiwayatMarkers, setBencanaRiwayatMarkers] = useState([]);
    const [rumahMarkers, setRumahMarkers] = useState([]);
    const [batasWilayahMarkers, setBatasWilayahMarkers] = useState([]);

    useEffect(() => {
        const fetchLokasiPenting = async () => {
            try {
                const response = await axios.get(route('api.markers.lokasi-penting'));
                setLokasiPentingMarkers(response.data);
            } catch (error) {
                console.error('Error fetching lokasi penting:', error);
            }
        };
        fetchLokasiPenting();
    }, []);

    useEffect(() => {
        const fetchBatasWilayah = async () => {
            try {
                const response = await axios.get(route('api.markers.batas-wilayah'));
                console.log('Batas Wilayah Data:', response.data);
                // Transform data to ensure coordinates are in correct format
                const transformedData = response.data.map((item: any) => ({
                    ...item,
                    coordinates: Array.isArray(item.coordinates) ? item.coordinates : []
                }));
                setBatasWilayahMarkers(transformedData);
            } catch (error) {
                console.error('Error fetching batas wilayah:', error);
            }
        };
        fetchBatasWilayah();
    }, []);

    useEffect(() => {
        const fetchRumah = async () => {
            try {
                const response = await axios.get(route('api.markers.rumah'));
                setRumahMarkers(response.data);
            } catch (error) {
                console.error('Error fetching rumah:', error);
            }
        };
        fetchRumah();
    }, []);

    useEffect(() => {
        const fetchBencanaRiwayat = async () => {
            try {
                const response = await axios.get(route('api.markers.bencana', { status: 'riwayat' }));
                setBencanaRiwayatMarkers(response.data);
            } catch (error) {
                console.error('Error fetching bencana riwayat:', error);
            }
        };
        fetchBencanaRiwayat();
    }, []);

    useEffect(() => {
        const fetchBencanaBerlangsung = async () => {
            try {
                const response = await axios.get(route('api.markers.bencana', { status: 'berlangsung' }));
                setBencanaBerlangsungMarkers(response.data);
            } catch (error) {
                console.error('Error fetching bencana berlangsung:', error);
            }
        };
        fetchBencanaBerlangsung();
    }, []);

    useEffect(() => {
        const fetchFasilitasJalan = async () => {
            try {
                const response = await axios.get(route('api.markers.fasilitas', { tipe: 'jalan' }));
                setFasilitasJalanMarkers(response.data);
            } catch (error) {
                console.error('Error fetching fasilitas jalan:', error);
            }
        };
        fetchFasilitasJalan();
    }, []);

    useEffect(() => {
        const fetchFasilitasPrivat = async () => {
            try {
                const response = await axios.get(route('api.markers.fasilitas', { tipe: 'privat' }));
                setFasilitasPrivatMarkers(response.data);
            } catch (error) {
                console.error('Error fetching fasilitas privat:', error);
            }
        };
        fetchFasilitasPrivat();
    }, []);

    useEffect(() => {
        const fetchFasilitasUmum = async () => {
            try {
                const response = await axios.get(route('api.markers.fasilitas', { tipe: 'umum' }));
                setFasilitasUmumMarkers(response.data);
            } catch (error) {
                console.error('Error fetching fasilitas umum:', error);
            }
        };
        fetchFasilitasUmum();
    }, []);





    // Get events by type from mock data
    const trafficEvents: MapEvent[] = useMemo(() => getEventsByType('traffic'), []);
    const accidentEvents: MapEvent[] = useMemo(() => getEventsByType('accident'), []);
    const hazardEvents: MapEvent[] = useMemo(() => getEventsByType('hazard'), []);
    // const locationEvents = useMemo(() => getEventsByType('location'), []); // No longer needed, using API data

    // Filter locations based on search (now using API data for lokasiPenting)
    const filteredLokasiPenting = useMemo(() => {
        if (!searchQuery) return lokasiPentingMarkers;
        const query = searchQuery.toLowerCase();
        return lokasiPentingMarkers.filter((loc: LokasiPentingMarker) =>
            loc.nama.toLowerCase().includes(query) || loc.description?.toLowerCase().includes(query)
        );
    }, [searchQuery, lokasiPentingMarkers]);

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
                {/* Search Bar Overlay */}
                <div className="absolute top-8 left-8 z-[400] w-72 bg-background/90 backdrop-blur shadow-lg rounded-lg border p-2">
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
                        <div className="mt-2 max-h-60 overflow-y-auto border-t pt-2">
                            {filteredLokasiPenting.length > 0 ? (
                                <ul className="space-y-1">
                                    {filteredLokasiPenting.map((loc: LokasiPentingMarker) => (
                                        <li
                                            key={loc.id}
                                            className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer text-sm flex flex-col"
                                            onClick={() => {
                                                setSearchQuery(loc.nama);
                                            }}
                                        >
                                            <span className="font-medium flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {loc.nama}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{loc.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground px-2 py-1">Tidak ditemukan</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Layer Panel Toggle Button */}
                <div className="absolute bottom-8 right-8 z-[400]">
                    <Button
                        onClick={() => setShowLayerPanel(!showLayerPanel)}
                        className="rounded-full shadow-lg"
                        size="icon"
                    >
                        <Layers className="h-4 w-4" />
                    </Button>
                </div>

                {/* Layer Panel */}
                {showLayerPanel && (
                    <div className="absolute bottom-20 right-8 z-[400] bg-background/95 backdrop-blur shadow-lg rounded-lg border p-4 w-72 max-h-96 overflow-y-auto">
                        <h4 className="font-semibold text-sm mb-3">Pilih Layer</h4>
                        <div className="space-y-2">
                            {layerOptions.map(layer => (
                                <div key={layer.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={layer.id}
                                        checked={activeLayers.includes(layer.id)}
                                        onCheckedChange={() => toggleLayer(layer.id)}
                                    />
                                    <Label htmlFor={layer.id} className="text-sm cursor-pointer flex items-center gap-2">
                                        <span>{layer.icon}</span>
                                        {layer.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend Overlay */}
                <div className="absolute top-8 right-8 z-[400] bg-background/90 backdrop-blur shadow-lg rounded-lg border p-3 max-w-xs max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-sm mb-2">Legenda</h4>
                    <div className="space-y-2 text-xs">
                        {/* Lokasi Penduduk */}
                        {activeLayers.includes('lokasi-penduduk') && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>Lokasi Penduduk</span>
                            </div>
                        )}

                        {/* Fasilitas Umum */}
                        {activeLayers.includes('fasilitas-umum') && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span>Fasilitas Umum</span>
                            </div>
                        )}

                        {/* Fasilitas Privat */}
                        {activeLayers.includes('fasilitas-privat') && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                <span>Fasilitas Privat</span>
                            </div>
                        )}

                        {/* Fasilitas Jalan */}
                        {activeLayers.includes('fasilitas-jalan') && (
                            <div className="flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-gray-800" />
                                <span>Fasilitas Jalan</span>
                            </div>
                        )}

                        {/* Batas Wilayah */}
                        {activeLayers.includes('batas-wilayah') && (
                            <>
                                <div className="border-t pt-2 mt-2">
                                    <p className="font-semibold text-xs mb-1">Batas Wilayah (Jenis):</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-lime-500" />
                                    <span>Pertanian</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-amber-500" />
                                    <span>Pemukiman</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-600" />
                                    <span>Hutan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500" />
                                    <span>Perkebunan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-600" />
                                    <span>Industri</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500" />
                                    <span>Fasilitas Umum</span>
                                </div>
                            </>
                        )}

                        {/* Tragedi Berlangsung */}
                        {activeLayers.includes('tragedi-berlangsung') && (
                            <>
                                <div className="border-t pt-2 mt-2">
                                    <p className="font-semibold text-xs mb-1">Tragedi Berlangsung:</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span>Rendah</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <span>Sedang</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span>Tinggi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span>Sangat Tinggi</span>
                                </div>
                            </>
                        )}

                        {/* Riwayat Tragedi */}
                        {activeLayers.includes('riwayat-tragedi') && (
                            <>
                                <div className="border-t pt-2 mt-2">
                                    <p className="font-semibold text-xs mb-1">Riwayat Tragedi:</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                                    <span>Selesai</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-0 overflow-hidden h-[calc(100vh-8rem)] dark:border-sidebar-border shadow-md">
                    <MapView
                        trafficEvents={trafficEvents}
                        accidentEvents={accidentEvents}
                        hazardEvents={hazardEvents}
                        lokasiPenting={filteredLokasiPenting} // Fetched API data
                        fasilitasUmum={fasilitasUmumMarkers} // Fetched API data
                        fasilitasPrivat={fasilitasPrivatMarkers} // Fetched API data
                        fasilitasJalan={fasilitasJalanMarkers} // Fetched API data
                        bencanaBerlangsung={bencanaBerlangsungMarkers} // Fetched API data
                        bencanaRiwayat={bencanaRiwayatMarkers} // Fetched API data
                        rumah={rumahMarkers}         // Fetched API data
                        batasWilayah={batasWilayahMarkers} // Fetched API data
                        villageBoundary={DESA_SOMAGEDE_BOUNDARY}
                        activeLayers={activeLayers}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
