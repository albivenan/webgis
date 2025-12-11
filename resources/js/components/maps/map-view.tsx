import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, GeoJSON, LayersControl, LayerGroup, Circle, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import { DESA_SOMAGEDE_CENTER } from '@/data/mockMapEvents';
import { fixLeafletDefaultIcon } from '@/lib/leaflet-utils';
import MapLegend from '@/components/maps/MapLegend';
import { getFacilityIconSVG, createFacilityIcon, createDisasterIcon } from '@/lib/map-icons';
import MarkerPopupContent from '@/components/maps/MarkerPopupContent';
import { Button } from '../ui/button';
import { Link } from '@inertiajs/react';

interface LegendItem {
    label: string;
    color: string;
    type?: 'point' | 'line';
    iconHtml?: string | HTMLElement | false;
}

interface BatasWilayahItem {
    id: string | number;
    coordinates: [number, number][];
    warna?: string;
    opacity?: number;
    nama: string;
    jenis: string;
    nama_pemilik?: string;
    luas?: number;
    keterangan?: string;
}

fixLeafletDefaultIcon();

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    desa?: any;
    lokasiPenting?: any[];
    infrastruktur?: any[];
    penggunaanLahan?: any[];
    trafficEvents?: any[];
    accidentEvents?: any[];
    hazardEvents?: any[];
    fasilitasUmum?: any[]; // Fasilitas Umum
    fasilitasPrivat?: any[]; // Fasilitas Privat
    fasilitasJalan?: any[]; // Fasilitas Jalan
    bencanaBerlangsung?: any[]; // Tragedi Berlangsung
    bencanaRiwayat?: any[]; // Riwayat Tragedi
    rumah?: any[];      // Lokasi Penduduk
    batasWilayah?: BatasWilayahItem[]; // Batas Wilayah
    villageBoundary?: [number, number][]; // Village boundary
    activeLayers?: string[];
}

// Component to fit map bounds to the village boundary
function FitBounds({ boundary }: { boundary: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (boundary && boundary.length > 0) {
            const bounds = L.latLngBounds(boundary);
            map.fitBounds(bounds);
        }
    }, [boundary, map]);

    return null;
}

export default function MapView({
    center = DESA_SOMAGEDE_CENTER, // Desa Somagede coordinates
    zoom = 14,
    desa,
    lokasiPenting = [],
    infrastruktur = [],
    penggunaanLahan = [],
    trafficEvents = [],
    accidentEvents = [],
    hazardEvents = [],
    fasilitasUmum = [],
    fasilitasPrivat = [],
    fasilitasJalan = [],
    bencanaBerlangsung = [],
    bencanaRiwayat = [],
    rumah = [],
    batasWilayah = [],
    villageBoundary,
    activeLayers = []
}: MapViewProps) {

    // Helper to parse GeoJSON if it's a string
    const parseGeoJSON = (data: any) => {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error("Invalid GeoJSON:", e);
                return null;
            }
        }
        return data;
    };

    // Create mask polygon (World - Village)
    const maskPolygon = villageBoundary ? [
        // Outer ring (World)
        [
            [90, -180],
            [90, 180],
            [-90, 180],
            [-90, -180]
        ],
        // Inner ring (Village hole)
        villageBoundary
    ] : null;

    // Calculate maxBounds from villageBoundary
    const maxBounds = villageBoundary ? L.latLngBounds(villageBoundary) : undefined;

    const getLegendItems = (): LegendItem[] => {
        const items: LegendItem[] = [];

        if (activeLayers.includes('lokasi-penduduk') && rumah.length > 0) {
            items.push({
                label: 'Lokasi Penduduk',
                color: '#3b82f6', // Default marker color
                iconHtml: getFacilityIconSVG('rumah', '#3b82f6')
            });
        }

        if (activeLayers.includes('fasilitas-umum') && fasilitasUmum.length > 0) {
            // Assuming fasilitasUmum items have a 'jenis' property that maps to an icon type
            const uniqueJenis = [...new Set(fasilitasUmum.map(f => f.jenis))];
            uniqueJenis.forEach(jenis => {
                items.push({
                    label: `Fasilitas Umum (${jenis})`,
                    color: '#3b82f6', // Default color, actual icon color comes from getFacilityIconSVG
                    iconHtml: getFacilityIconSVG(jenis, '#3b82f6')
                });
            });
        }

        if (activeLayers.includes('fasilitas-privat') && fasilitasPrivat.length > 0) {
            const uniqueJenis = [...new Set(fasilitasPrivat.map(f => f.jenis))];
            uniqueJenis.forEach(jenis => {
                items.push({
                    label: `Fasilitas Privat (${jenis})`,
                    color: '#3b82f6', // Default color, actual icon color comes from getFacilityIconSVG
                    iconHtml: getFacilityIconSVG(jenis, '#3b82f6')
                });
            });
        }

        if (activeLayers.includes('fasilitas-jalan') && fasilitasJalan.length > 0) {
            // Check for both point and polyline types
            const hasPolyline = fasilitasJalan.some(item => Array.isArray(item.koordinat) && item.koordinat.length > 2 && Array.isArray(item.koordinat[0]));
            const hasPoint = fasilitasJalan.some(item => Array.isArray(item.koordinat) && item.koordinat.length === 2);

            if (hasPolyline) {
                items.push({
                    label: 'Jalan (Garis)',
                    color: '#333',
                    type: 'line'
                });
            }
            if (hasPoint) {
                items.push({
                    label: 'Jalan (Titik)',
                    color: '#3b82f6', // Default marker color
                    iconHtml: getFacilityIconSVG('default', '#3b82f6')
                });
            }
        }

        if (activeLayers.includes('batas-wilayah') && batasWilayah.length > 0) {
            items.push({
                label: 'Batas Wilayah',
                color: '#2563eb',
                type: 'line' // Representing the polygon outline
            });
        }

        if (activeLayers.includes('tragedi-berlangsung') && bencanaBerlangsung.length > 0) {
            const uniqueDisasters = [...new Set(bencanaBerlangsung.map(b => `${b.jenis_bencana}-${b.tingkat_bahaya}`))];
            uniqueDisasters.forEach(disaster => {
                const [jenis_bencana, tingkat_bahaya] = disaster.split('-');
                let color = '#ef4444'; // Default for 'sangat_tinggi'
                if (tingkat_bahaya === 'rendah') color = '#22c55e';
                else if (tingkat_bahaya === 'sedang') color = '#facc15';
                else if (tingkat_bahaya === 'tinggi') color = '#f97316';

                items.push({
                    label: `Tragedi Berlangsung (${jenis_bencana.replace(/_/g, ' ')} - ${tingkat_bahaya.replace(/_/g, ' ')})`,
                    color: color,
                    iconHtml: createDisasterIcon(jenis_bencana, tingkat_bahaya).options.html
                });
            });
        }

        if (activeLayers.includes('riwayat-tragedi') && bencanaRiwayat.length > 0) {
            const uniqueDisasters = [...new Set(bencanaRiwayat.map(b => `${b.jenis_bencana}-${b.tingkat_bahaya}`))];
            uniqueDisasters.forEach(disaster => {
                const [jenis_bencana, tingkat_bahaya] = disaster.split('-');
                let color = '#71717a'; // Default for 'sangat_tinggi'
                if (tingkat_bahaya === 'rendah') color = '#22c55e';
                else if (tingkat_bahaya === 'sedang') color = '#facc15';
                else if (tingkat_bahaya === 'tinggi') color = '#f97316';

                items.push({
                    label: `Riwayat Tragedi (${jenis_bencana.replace(/_/g, ' ')} - ${tingkat_bahaya.replace(/_/g, ' ')})`,
                    color: color,
                    iconHtml: createDisasterIcon(jenis_bencana, tingkat_bahaya).options.html
                });
            });
        }

        return items;
    };

    const legendItems = getLegendItems();

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem', background: '#e5e7eb' }}
            maxBounds={maxBounds}
            maxBoundsViscosity={1.0} // Prevent dragging outside bounds
            minZoom={13} // Prevent zooming out too far
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


                {/* Fit map to village boundary if provided */}
                {villageBoundary && <FitBounds boundary={villageBoundary} />}

                {/* Render MapLegend */}
                {legendItems.length > 0 && <MapLegend items={legendItems} />}



                {/* Village Boundary Outline */}
                {villageBoundary && (
                    <Polygon
                        positions={villageBoundary}
                        pathOptions={{
                            color: '#2563eb',
                            fillColor: 'transparent',
                            weight: 3,
                            dashArray: '5, 5'
                        }}
                    />
                )}



                {/* Lokasi Penduduk */}
                <LayersControl.Overlay checked={activeLayers.includes('lokasi-penduduk')} name="Lokasi Penduduk">
                    <LayerGroup>
                        {rumah.map((item) => (
                            <Marker key={`rumah-${item.id}`} position={[item.latitude, item.longitude]} icon={createFacilityIcon('rumah')}>
                                <Tooltip>{item.alamat}</Tooltip>
                                <Popup>
                                    <MarkerPopupContent
                                        name={item.alamat}
                                        type="rumah"
                                        id={item.id}
                                        imageUrl={item.foto_rumah}
                                        additionalInfo={[
                                            { label: 'RT/RW', value: `${item.rt}/${item.rw}` },
                                            ...(item.keterangan ? [{ label: 'Keterangan', value: item.keterangan }] : []),
                                        ]}
                                    />
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Fasilitas Umum */}
                <LayersControl.Overlay checked={activeLayers.includes('fasilitas-umum')} name="Fasilitas Umum">
                    <LayerGroup>
                        {fasilitasUmum.map((item) => (
                            item.koordinat && item.koordinat.length === 2 && (
                                <Marker
                                    key={`fasilitas-umum-${item.id}`}
                                    position={[item.koordinat[1], item.koordinat[0]]}
                                    icon={createFacilityIcon(item.jenis)}
                                >
                                    <Tooltip>{item.nama}</Tooltip>
                                    <Popup>
                                        <MarkerPopupContent
                                            name={item.nama}
                                            type="fasilitas"
                                            id={item.id}
                                            imageUrl={item.foto}
                                            additionalInfo={[
                                                { label: 'Jenis', value: item.jenis },
                                                { label: 'Kondisi', value: item.kondisi },
                                                ...(item.alamat_manual ? [{ label: 'Alamat', value: item.alamat_manual }] : []),
                                            ]}
                                        />
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Fasilitas Privat */}
                <LayersControl.Overlay checked={activeLayers.includes('fasilitas-privat')} name="Fasilitas Privat">
                    <LayerGroup>
                        {fasilitasPrivat.map((item) => (
                            item.koordinat && item.koordinat.length === 2 && (
                                <Marker
                                    key={`fasilitas-privat-${item.id}`}
                                    position={[item.koordinat[1], item.koordinat[0]]}
                                    icon={createFacilityIcon(item.jenis)}
                                >
                                    <Tooltip>{item.nama}</Tooltip>
                                    <Popup>
                                        <MarkerPopupContent
                                            name={item.nama}
                                            type="fasilitas"
                                            id={item.id}
                                            imageUrl={item.foto}
                                            additionalInfo={[
                                                { label: 'Jenis', value: item.jenis },
                                                { label: 'Kondisi', value: item.kondisi },
                                                ...(item.alamat_manual ? [{ label: 'Alamat', value: item.alamat_manual }] : []),
                                            ]}
                                        />
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Fasilitas Jalan */}
                <LayersControl.Overlay checked={activeLayers.includes('fasilitas-jalan')} name="Fasilitas Jalan">
                    <LayerGroup>
                        {fasilitasJalan.map((item) => {
                            // Handle jalan as polyline if koordinat is an array of coordinates
                            if (item.koordinat && Array.isArray(item.koordinat) && item.koordinat.length > 2) {
                                // Check if it's a polyline (array of coordinate pairs)
                                const isPolyline = Array.isArray(item.koordinat[0]) && item.koordinat[0].length === 2;
                                if (isPolyline) {
                                    const positions = item.koordinat.map((coord: number[]) => [coord[1], coord[0]]);
                                    return (
                                        <Polyline
                                            key={`fasilitas-jalan-${item.id}`}
                                            positions={positions}
                                            pathOptions={{ color: '#333', weight: 3 }}
                                        >
                                            <Popup>
                                                <div className="font-bold">{item.nama}</div>
                                                <div>Jenis: {item.jenis}</div>
                                                <div>Kondisi: {item.kondisi}</div>
                                            </Popup>
                                        </Polyline>
                                    );
                                }
                            }
                            // Handle as marker if single coordinate
                            if (item.koordinat && item.koordinat.length === 2) {
                                return (
                                    <Marker
                                        key={`fasilitas-jalan-${item.id}`}
                                        position={[item.koordinat[1], item.koordinat[0]]}
                                        icon={createFacilityIcon(item.jenis)}
                                    >
                                        <Popup>
                                            <div className="font-bold">{item.nama}</div>
                                            <div>Jenis: {item.jenis}</div>
                                            <div>Kondisi: {item.kondisi}</div>
                                        </Popup>
                                    </Marker>
                                );
                            }
                            return null;
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>


                {/* Batas Wilayah */}
                <LayersControl.Overlay checked={activeLayers.includes('batas-wilayah')} name="Batas Wilayah">
                    <LayerGroup>
                        {batasWilayah.map((item) => {
                            // Convert [lat, lng] to [lng, lat] for GeoJSON
                            const geoCoordinates = item.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                            const geoData: GeoJSON.Polygon = {
                                type: "Polygon",
                                coordinates: [geoCoordinates]
                            };

                            return (
                                <GeoJSON
                                    key={`batas-wilayah-${item.id}`}
                                    data={geoData}
                                    style={{
                                        color: item.warna || '#3388ff',
                                        weight: 2,
                                        opacity: item.opacity || 0.7,
                                        fillColor: item.warna || '#3388ff',
                                        fillOpacity: item.opacity ? item.opacity * 0.5 : 0.35,
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[220px]">
                                            <h3 className="font-bold text-sm mb-2">{item.nama}</h3>
                                            <div className="text-xs space-y-1 mb-3">
                                                <p><span className="font-semibold">Jenis:</span> {item.jenis}</p>
                                                {item.nama_pemilik && <p><span className="font-semibold">Pemilik:</span> {item.nama_pemilik}</p>}
                                                {item.luas && <p><span className="font-semibold">Luas:</span> {(item.luas / 10000).toFixed(2)} ha</p>}
                                                {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                            </div>
                                            <Link href={route('batas-wilayah.index')}>
                                                <Button size="sm" className="w-full">Detail</Button>
                                            </Link>
                                        </div>
                                    </Popup>
                                </GeoJSON>
                            );
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Tragedi Berlangsung */}
                <LayersControl.Overlay checked={activeLayers.includes('tragedi-berlangsung')} name="Tragedi Berlangsung">
                    <LayerGroup>
                        {bencanaBerlangsung.map((item) => {
                            const color = item.warna_penanda || '#ef4444';
                            // Handle different location types
                            if (item.tipe_lokasi === 'titik' && item.lokasi_data?.lat && item.lokasi_data?.lng) {
                                return (
                                    <Circle
                                        key={`bencana-berlangsung-${item.id}`}
                                        center={[item.lokasi_data.lat, item.lokasi_data.lng]}
                                        radius={50}
                                        pathOptions={{
                                            color: color,
                                            fillColor: color,
                                            fillOpacity: 0.4
                                        }}
                                    >
                                        <Tooltip>{item.nama_bencana}</Tooltip>
                                        <Marker
                                            position={[item.lokasi_data.lat, item.lokasi_data.lng]}
                                            icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                        />
                                        <Popup>
                                            <div className="p-2 min-w-[220px]">
                                                <h3 className="font-bold text-sm mb-2">{item.nama_bencana}</h3>
                                                <div className="text-xs space-y-1 mb-3">
                                                    <p><span className="font-semibold">Jenis:</span> {item.jenis_bencana.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Tanggal:</span> {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                                                    <p><span className="font-semibold">Tingkat Bahaya:</span> {item.tingkat_bahaya.replace(/_/g, ' ')}</p>
                                                    {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                                </div>
                                                <Link href={route('bencana.berlangsung')}>
                                                    <Button size="sm" className="w-full">Detail</Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Circle>
                                );
                            }
                            if (item.tipe_lokasi === 'radius' && item.lokasi_data?.center && item.lokasi_data?.radius) {
                                return (
                                    <Circle
                                        key={`bencana-berlangsung-${item.id}`}
                                        center={[item.lokasi_data.center.lat, item.lokasi_data.center.lng]}
                                        radius={item.lokasi_data.radius}
                                        pathOptions={{
                                            color: color,
                                            fillColor: color,
                                            fillOpacity: 0.2
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2 min-w-[220px]">
                                                <h3 className="font-bold text-sm mb-2">{item.nama_bencana}</h3>
                                                <div className="text-xs space-y-1 mb-3">
                                                    <p><span className="font-semibold">Jenis:</span> {item.jenis_bencana.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Tanggal:</span> {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                                                    <p><span className="font-semibold">Tingkat Bahaya:</span> {item.tingkat_bahaya.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Radius:</span> {item.lokasi_data.radius}m</p>
                                                    {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                                </div>
                                                <Link href={route('bencana.berlangsung')}>
                                                    <Button size="sm" className="w-full">Detail</Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Circle>
                                );
                            }
                            if (item.tipe_lokasi === 'polygon' && item.lokasi_data && Array.isArray(item.lokasi_data)) {
                                return (
                                    <Polygon
                                        key={`bencana-berlangsung-${item.id}`}
                                        positions={item.lokasi_data}
                                        pathOptions={{
                                            color: color,
                                            fillColor: color,
                                            fillOpacity: 0.2
                                        }}
                                    >
                                        <Tooltip>{item.nama_bencana}</Tooltip>
                                        {item.lokasi_data && item.lokasi_data.length > 0 && (
                                            <Marker
                                                position={item.lokasi_data[0]}
                                                icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                            />
                                        )}
                                        <Popup>
                                            <div className="p-2 min-w-[220px]">
                                                <h3 className="font-bold text-sm mb-2">{item.nama_bencana}</h3>
                                                <div className="text-xs space-y-1 mb-3">
                                                    <p><span className="font-semibold">Jenis:</span> {item.jenis_bencana.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Tanggal:</span> {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                                                    <p><span className="font-semibold">Tingkat Bahaya:</span> {item.tingkat_bahaya.replace(/_/g, ' ')}</p>
                                                    {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                                </div>
                                                <Link href={route('bencana.berlangsung')}>
                                                    <Button size="sm" className="w-full">Detail</Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Polygon>
                                );
                            }
                            return null;
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Riwayat Tragedi */}
                <LayersControl.Overlay checked={activeLayers.includes('riwayat-tragedi')} name="Riwayat Tragedi">
                    <LayerGroup>
                        {bencanaRiwayat.map((item) => {
                            const color = item.warna_penanda || '#71717a';
                            // Handle different location types
                            if (item.tipe_lokasi === 'titik' && item.lokasi_data?.lat && item.lokasi_data?.lng) {
                                return (
                                    <Circle
                                        key={`bencana-riwayat-${item.id}`}
                                        center={[item.lokasi_data.lat, item.lokasi_data.lng]}
                                        radius={50}
                                        pathOptions={{
                                            color: color,
                                            fillColor: color,
                                            fillOpacity: 0.3
                                        }}
                                    >
                                        <Tooltip>{item.nama_bencana}</Tooltip>
                                        <Marker
                                            position={[item.lokasi_data.lat, item.lokasi_data.lng]}
                                            icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                        />
                                        <Popup>
                                            <div className="p-2 min-w-[220px]">
                                                <h3 className="font-bold text-sm mb-2">{item.nama_bencana}</h3>
                                                <div className="text-xs space-y-1 mb-3">
                                                    <p><span className="font-semibold">Jenis:</span> {item.jenis_bencana.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Tanggal Mulai:</span> {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                                                    {item.tanggal_selesai && (
                                                        <p><span className="font-semibold">Tanggal Selesai:</span> {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                                                    )}
                                                    <p><span className="font-semibold">Tingkat Bahaya:</span> {item.tingkat_bahaya.replace(/_/g, ' ')}</p>
                                                    {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                                </div>
                                                <Link href={route('bencana.riwayat')}>
                                                    <Button size="sm" className="w-full">Detail</Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Circle>
                                );
                            }
                            if (item.tipe_lokasi === 'radius' && item.lokasi_data?.center && item.lokasi_data?.radius) {
                                return (
                                    <Circle
                                        key={`bencana-riwayat-${item.id}`}
                                        center={[item.lokasi_data.center.lat, item.lokasi_data.center.lng]}
                                        radius={item.lokasi_data.radius}
                                        pathOptions={{
                                            color: color,
                                            fillColor: color,
                                            fillOpacity: 0.15
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2 min-w-[220px]">
                                                <h3 className="font-bold text-sm mb-2">{item.nama_bencana}</h3>
                                                <div className="text-xs space-y-1 mb-3">
                                                    <p><span className="font-semibold">Jenis:</span> {item.jenis_bencana.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Tanggal Mulai:</span> {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                                                    {item.tanggal_selesai && (
                                                        <p><span className="font-semibold">Tanggal Selesai:</span> {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                                                    )}
                                                    <p><span className="font-semibold">Tingkat Bahaya:</span> {item.tingkat_bahaya.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Radius:</span> {item.lokasi_data.radius}m</p>
                                                    {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                                </div>
                                                <Link href={route('bencana.riwayat')}>
                                                    <Button size="sm" className="w-full">Detail</Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Circle>
                                );
                            }
                            if (item.tipe_lokasi === 'polygon' && item.lokasi_data && Array.isArray(item.lokasi_data)) {
                                return (
                                    <Polygon
                                        key={`bencana-riwayat-${item.id}`}
                                        positions={item.lokasi_data}
                                        pathOptions={{
                                            color: color,
                                            fillColor: color,
                                            fillOpacity: 0.15
                                        }}
                                    >
                                        <Tooltip>{item.nama_bencana}</Tooltip>
                                        <Popup>
                                            <div className="p-2 min-w-[220px]">
                                                <h3 className="font-bold text-sm mb-2">{item.nama_bencana}</h3>
                                                <div className="text-xs space-y-1 mb-3">
                                                    <p><span className="font-semibold">Jenis:</span> {item.jenis_bencana.replace(/_/g, ' ')}</p>
                                                    <p><span className="font-semibold">Tanggal Mulai:</span> {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                                                    {item.tanggal_selesai && (
                                                        <p><span className="font-semibold">Tanggal Selesai:</span> {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                                                    )}
                                                    <p><span className="font-semibold">Tingkat Bahaya:</span> {item.tingkat_bahaya.replace(/_/g, ' ')}</p>
                                                    {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                                </div>
                                                <Link href={route('bencana.riwayat')}>
                                                    <Button size="sm" className="w-full">Detail</Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Polygon>
                                );
                            }
                            return null;
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
}
