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
import { LAND_USE_COLORS, landUseTypes, tingkatBahayaMapColors } from '@/lib/map-constants';
import { getRoadColor } from '@/lib/road-utils';

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
    onElementClick?: (element: any) => void;
    flyToLocation?: [number, number];
}

// Component to fit map bounds to the village boundary
function MapEvents({ boundary, flyToLocation }: { boundary?: [number, number][], flyToLocation?: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (boundary && boundary.length > 0) {
            const bounds = L.latLngBounds(boundary);
            map.fitBounds(bounds);
        }
    }, [boundary, map]);

    useEffect(() => {
        if (flyToLocation) {
            map.flyTo(flyToLocation, 18, {
                animate: true,
                duration: 1.5
            });
        }
    }, [flyToLocation, map]);

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
    activeLayers = [],
    onElementClick,
    flyToLocation
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

        const formatLabel = (str: string) => {
            return str.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        };

        if (activeLayers.includes('lokasi-penduduk') && rumah.length > 0) {
            items.push({
                label: 'Lokasi Penduduk',
                color: '#3b82f6',
                iconHtml: getFacilityIconSVG('rumah', '#3b82f6')
            });
        }

        if (activeLayers.includes('fasilitas-umum') && fasilitasUmum.length > 0) {
            const uniqueJenis = [...new Set(fasilitasUmum.map(f => f.jenis))];
            uniqueJenis.forEach(jenis => {
                items.push({
                    label: formatLabel(jenis),
                    color: '#3b82f6',
                    iconHtml: getFacilityIconSVG(jenis, '#3b82f6')
                });
            });
        }

        if (activeLayers.includes('fasilitas-privat') && fasilitasPrivat.length > 0) {
            const uniqueJenis = [...new Set(fasilitasPrivat.map(f => f.jenis))];
            uniqueJenis.forEach(jenis => {
                items.push({
                    label: formatLabel(jenis),
                    color: '#3b82f6',
                    iconHtml: getFacilityIconSVG(jenis, '#3b82f6')
                });
            });
        }

        if (activeLayers.includes('fasilitas-jalan') && fasilitasJalan.length > 0) {
            const roadTypes = [
                { id: 'jalan_nasional', label: 'Jalan Nasional' },
                { id: 'jalan_provinsi', label: 'Jalan Provinsi' },
                { id: 'jalan_kabupaten', label: 'Jalan Kabupaten' },
                { id: 'jalan_desa', label: 'Jalan Desa' },
                { id: 'jalan_lingkungan', label: 'Jalan Lingkungan' },
                { id: 'jalan_setapak', label: 'Jalan Setapak' },
            ];

            let headerAdded = false;
            roadTypes.forEach(type => {
                const hasThisType = fasilitasJalan.some(f => f.jenis === type.id);
                if (hasThisType) {
                    if (!headerAdded) {
                        items.push({ label: 'Fasilitas Jalan', color: 'transparent', type: 'point' });
                        headerAdded = true;
                    }
                    items.push({
                        label: type.label,
                        color: getRoadColor(type.id),
                        type: 'line'
                    });
                }
            });
        }

        if (activeLayers.includes('batas-wilayah') && batasWilayah.length > 0) {
            const activeLandUseTypes = [...new Set(batasWilayah.map(bw => bw.jenis))];
            if (activeLandUseTypes.length > 0) {
                items.push({ label: 'Batas Wilayah', color: 'transparent', type: 'point' });
                activeLandUseTypes.forEach(type => {
                    items.push({
                        label: type,
                        color: LAND_USE_COLORS[type] || '#000000',
                        type: 'point',
                    });
                });
            }
        }

        if (activeLayers.includes('tragedi-berlangsung') && bencanaBerlangsung.length > 0) {
            items.push({ label: 'Tragedi Berlangsung', color: 'transparent', type: 'point' });
            bencanaBerlangsung.forEach(item => {
                items.push({
                    label: item.nama_bencana,
                    color: tingkatBahayaMapColors[item.tingkat_bahaya] || '#71717a',
                    type: 'point',
                    iconHtml: createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya).options.html
                });
            });
        }

        if (activeLayers.includes('riwayat-tragedi') && bencanaRiwayat.length > 0) {
            items.push({ label: 'Riwayat Tragedi', color: 'transparent', type: 'point' });
            bencanaRiwayat.forEach(item => {
                items.push({
                    label: item.nama_bencana,
                    color: tingkatBahayaMapColors[item.tingkat_bahaya] || '#71717a',
                    type: 'point',
                    iconHtml: createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya).options.html
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
                <MapEvents boundary={villageBoundary} flyToLocation={flyToLocation} />

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
                            <Marker
                                key={`rumah-${item.id}`}
                                position={[item.latitude, item.longitude]}
                                icon={createFacilityIcon('rumah')}
                                eventHandlers={{
                                    click: () => onElementClick?.({
                                        id: item.id,
                                        nama: item.nama_pemilik || item.alamat,
                                        type: 'rumah',
                                        details: [
                                            { label: 'RT/RW', value: `${item.rt}/${item.rw}` },
                                            ...(item.keterangan ? [{ label: 'Keterangan', value: item.keterangan }] : []),
                                        ],
                                        image: item.foto_rumah,
                                        location: [item.latitude, item.longitude]
                                    })
                                }}
                            >
                                <Tooltip permanent direction="top" offset={[0, -10]} className="google-label">
                                    {item.nama_pemilik || item.alamat}
                                </Tooltip>
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
                                    eventHandlers={{
                                        click: () => onElementClick?.({
                                            id: item.id,
                                            nama: item.nama,
                                            type: 'fasilitas',
                                            category: item.jenis,
                                            details: [
                                                { label: 'Jenis', value: item.jenis },
                                                { label: 'Kondisi', value: item.kondisi },
                                                ...(item.alamat_manual ? [{ label: 'Alamat', value: item.alamat_manual }] : []),
                                            ],
                                            image: item.foto,
                                            location: [item.koordinat[1], item.koordinat[0]]
                                        })
                                    }}
                                >
                                    <Tooltip permanent direction="top" offset={[0, -10]} className="google-label">
                                        {item.nama}
                                    </Tooltip>
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
                                    eventHandlers={{
                                        click: () => onElementClick?.({
                                            id: item.id,
                                            nama: item.nama,
                                            type: 'fasilitas',
                                            category: item.jenis,
                                            details: [
                                                { label: 'Jenis', value: item.jenis },
                                                { label: 'Kondisi', value: item.kondisi },
                                                ...(item.alamat_manual ? [{ label: 'Alamat', value: item.alamat_manual }] : []),
                                            ],
                                            image: item.foto,
                                            location: [item.koordinat[1], item.koordinat[0]]
                                        })
                                    }}
                                >
                                    <Tooltip permanent direction="top" offset={[0, -10]} className="google-label">
                                        {item.nama}
                                    </Tooltip>
                                </Marker>
                            )
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Fasilitas Jalan */}
                <LayersControl.Overlay checked={activeLayers.includes('fasilitas-jalan')} name="Fasilitas Jalan">
                    <LayerGroup>
                        {fasilitasJalan.map((item) => {
                            let coords = item.koordinat;

                            // Check for GeoJSON LineString
                            if (coords && coords.type === 'LineString' && Array.isArray(coords.coordinates)) {
                                const positions = coords.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                                return (
                                    <Polyline
                                        key={`fasilitas-jalan-${item.id}`}
                                        positions={positions}
                                        pathOptions={{ color: getRoadColor(item.jenis), weight: 4 }}
                                        eventHandlers={{
                                            click: () => onElementClick?.({
                                                id: item.id,
                                                nama: item.nama,
                                                type: 'fasilitas',
                                                category: item.jenis,
                                                details: [
                                                    { label: 'Jenis', value: item.jenis.replace(/_/g, ' ') },
                                                    { label: 'Kondisi', value: item.kondisi.replace(/_/g, ' ') }
                                                ],
                                                location: positions[Math.floor(positions.length / 2)]
                                            })
                                        }}
                                    >
                                        <Tooltip permanent direction="center" className="google-label">
                                            {item.nama}
                                        </Tooltip>
                                    </Polyline>
                                );
                            }

                            // Handle jalan as manual array of coordinates if they are more than 2 (old format/helper)
                            if (Array.isArray(coords) && coords.length > 2) {
                                const isPolyline = Array.isArray(coords[0]) && coords[0].length === 2;
                                if (isPolyline) {
                                    const positions = coords.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                                    return (
                                        <Polyline
                                            key={`fasilitas-jalan-${item.id}`}
                                            positions={positions}
                                            pathOptions={{ color: getRoadColor(item.jenis), weight: 4 }}
                                        >
                                            <Tooltip permanent direction="center" className="google-label">
                                                {item.nama}
                                            </Tooltip>
                                            <Popup>
                                                <div className="font-bold">{item.nama}</div>
                                                <div>Jenis: {item.jenis.replace(/_/g, ' ')}</div>
                                                <div>Kondisi: {item.kondisi.replace(/_/g, ' ')}</div>
                                            </Popup>
                                        </Polyline>
                                    );
                                }
                            }

                            // Handle as marker if single coordinate (point format)
                            if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
                                return (
                                    <Marker
                                        key={`fasilitas-jalan-${item.id}`}
                                        position={[coords[1], coords[0]]}
                                        icon={createFacilityIcon(item.jenis)}
                                        eventHandlers={{
                                            click: () => onElementClick?.({
                                                id: item.id,
                                                nama: item.nama,
                                                type: 'fasilitas',
                                                category: item.jenis,
                                                details: [
                                                    { label: 'Jenis', value: item.jenis.replace(/_/g, ' ') },
                                                    { label: 'Kondisi', value: item.kondisi.replace(/_/g, ' ') }
                                                ],
                                                location: [coords[1], coords[0]]
                                            })
                                        }}
                                    >
                                        <Tooltip permanent direction="top" offset={[0, -10]} className="google-label">
                                            {item.nama}
                                        </Tooltip>
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
                            if (!item.coordinates || item.coordinates.length === 0) return null;
                            const polygonCenter = L.latLngBounds(item.coordinates).getCenter();

                            return (
                                <React.Fragment key={`batas-wilayah-group-${item.id}`}>
                                    <Polygon
                                        positions={item.coordinates}
                                        pathOptions={{
                                            color: LAND_USE_COLORS[item.jenis] || '#3388ff',
                                            fillColor: LAND_USE_COLORS[item.jenis] || '#3388ff',
                                            fillOpacity: 0.5,
                                            weight: 2
                                        }}
                                        eventHandlers={{
                                            click: () => onElementClick?.({
                                                id: item.id,
                                                nama: item.nama,
                                                type: 'batas-wilayah',
                                                category: item.jenis,
                                                details: [
                                                    { label: 'Jenis', value: item.jenis },
                                                    { label: 'Pemilik', value: item.nama_pemilik },
                                                    { label: 'Luas', value: item.luas ? `${(item.luas / 10000).toFixed(2)} ha` : '-' }
                                                ],
                                                location: polygonCenter
                                            })
                                        }}
                                    >
                                        <Tooltip permanent direction="center" className="google-label !text-blue-800">
                                            {item.nama}
                                        </Tooltip>
                                    </Polygon>
                                    <Marker
                                        position={polygonCenter}
                                        icon={createFacilityIcon(item.jenis)}
                                        eventHandlers={{
                                            click: () => onElementClick?.({
                                                id: item.id,
                                                nama: item.nama,
                                                type: 'batas-wilayah',
                                                category: item.jenis,
                                                details: [
                                                    { label: 'Jenis', value: item.jenis },
                                                    { label: 'Pemilik', value: item.nama_pemilik },
                                                    { label: 'Luas', value: item.luas ? `${(item.luas / 10000).toFixed(2)} ha` : '-' }
                                                ],
                                                location: [polygonCenter.lat, polygonCenter.lng]
                                            })
                                        }}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>



                {/* Riwayat Tragedi */}
                <LayersControl.Overlay name="Riwayat Tragedi">
                    <LayerGroup>
                        {bencanaRiwayat.map((item) => {
                            const color = tingkatBahayaMapColors[item.tingkat_bahaya] || '#71717a';
                            const parsedLokasiData = parseGeoJSON(item.lokasi_data);
                            const isPoint = item.tipe_lokasi === 'titik' || item.tipe_lokasi === 'point';

                            if (isPoint && parsedLokasiData && (parsedLokasiData.lat || Array.isArray(parsedLokasiData))) {
                                const lat = parsedLokasiData.lat ?? parsedLokasiData[0];
                                const lng = parsedLokasiData.lng ?? parsedLokasiData[1];
                                return (
                                    <Marker
                                        key={`bencana-riwayat-marker-${item.id}`}
                                        position={[lat, lng]}
                                        icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                        eventHandlers={{
                                            click: () => onElementClick?.({
                                                id: item.id,
                                                nama: item.nama_bencana,
                                                type: 'bencana',
                                                category: item.jenis_bencana,
                                                details: [
                                                    { label: 'Jenis', value: item.jenis_bencana.replace(/_/g, ' ') },
                                                    { label: 'Tingkat Bahaya', value: item.tingkat_bahaya.replace(/_/g, ' ') },
                                                    { label: 'Tanggal Mulai', value: new Date(item.tanggal_mulai).toLocaleDateString('id-ID') },
                                                ],
                                                location: [lat, lng]
                                            })
                                        }}
                                    >
                                        <Tooltip permanent direction="top" offset={[0, -15]} className="google-label !text-red-700">
                                            {item.nama_bencana}
                                        </Tooltip>
                                    </Marker>
                                );
                            }
                            else if (item.tipe_lokasi === 'radius' && parsedLokasiData?.center && parsedLokasiData?.radius) {
                                const centerLat = parsedLokasiData.center.lat ?? parsedLokasiData.center[0];
                                const centerLng = parsedLokasiData.center.lng ?? parsedLokasiData.center[1];

                                if (centerLat == null || centerLng == null) return null;

                                return (
                                    <React.Fragment key={`bencana-riwayat-radius-fragment-${item.id}`}>
                                        <Circle
                                            key={`bencana-riwayat-${item.id}`}
                                            center={[centerLat, centerLng]}
                                            radius={parsedLokasiData.radius}
                                            pathOptions={{
                                                color: color,
                                                fillColor: color,
                                                fillOpacity: 0.15,
                                                weight: 2
                                            }}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana.replace(/_/g, ' ') },
                                                        { label: 'Status', value: item.status },
                                                        { label: 'Radius', value: `${parsedLokasiData.radius}m` },
                                                    ],
                                                    location: [centerLat, centerLng]
                                                })
                                            }}
                                        />
                                        <Marker
                                            key={`bencana-riwayat-radius-marker-${item.id}`}
                                            position={[centerLat, centerLng]}
                                            icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana.replace(/_/g, ' ') },
                                                        { label: 'Status', value: item.status },
                                                        { label: 'Radius', value: `${parsedLokasiData.radius}m` },
                                                    ],
                                                    location: [centerLat, centerLng]
                                                })
                                            }}
                                        >
                                            <Tooltip permanent direction="top" offset={[0, -15]} className="google-label !text-red-700">
                                                {item.nama_bencana}
                                            </Tooltip>
                                        </Marker>
                                    </React.Fragment>
                                );
                            }
                            else if (item.tipe_lokasi === 'polygon' && parsedLokasiData && Array.isArray(parsedLokasiData)) {
                                const polygonPositions = parsedLokasiData.map((coord: any) => Array.isArray(coord) ? coord : [coord.lat, coord.lng]);

                                if (polygonPositions.length === 0) return null;

                                const leafletPositions = polygonPositions as L.LatLngExpression[];
                                const polygonCenter = L.latLngBounds(leafletPositions).getCenter();

                                return (
                                    <React.Fragment key={`bencana-riwayat-polygon-fragment-${item.id}`}>
                                        <Polygon
                                            key={`bencana-riwayat-polygon-${item.id}`}
                                            positions={leafletPositions}
                                            pathOptions={{ color: color, fillColor: color, fillOpacity: 0.4, weight: 2 }}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana },
                                                        { label: 'Status', value: item.status },
                                                    ],
                                                    location: polygonCenter
                                                })
                                            }}
                                        >
                                        </Polygon>
                                        <Marker
                                            key={`bencana-riwayat-polygon-marker-${item.id}`}
                                            position={polygonCenter}
                                            icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana },
                                                        { label: 'Status', value: item.status },
                                                    ],
                                                    location: polygonCenter
                                                })
                                            }}
                                        >
                                            <Tooltip permanent direction="top" offset={[0, -15]} className="google-label !text-red-700">
                                                {item.nama_bencana}
                                            </Tooltip>
                                        </Marker>
                                    </React.Fragment>
                                );
                            }
                            return null;
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Tragedi Berlangsung */}
                <LayersControl.Overlay checked={activeLayers.includes('tragedi-berlangsung')} name="Tragedi Berlangsung">
                    <LayerGroup>
                        {bencanaBerlangsung.map((item) => {
                            const color = tingkatBahayaMapColors[item.tingkat_bahaya] || '#71717a'; // default to gray
                            if (item.tipe_lokasi === 'point' && item.lokasi_data && item.lokasi_data.lat && item.lokasi_data.lng) {
                                return (
                                    <Marker
                                        key={`berlangsung-tragedi-marker-${item.id}`}
                                        position={[item.lokasi_data.lat, item.lokasi_data.lng]}
                                        icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                        eventHandlers={{
                                            click: () => onElementClick?.({
                                                id: item.id,
                                                nama: item.nama_bencana,
                                                type: 'bencana',
                                                category: item.jenis_bencana,
                                                details: [
                                                    { label: 'Jenis', value: item.jenis_bencana },
                                                    { label: 'Tingkat Bahaya', value: item.tingkat_bahaya.replace(/_/g, ' ') },
                                                    { label: 'Status', value: item.status },
                                                ],
                                                image: item.foto_bencana,
                                                location: [item.lokasi_data.lat, item.lokasi_data.lng]
                                            })
                                        }}
                                    >
                                        <Tooltip permanent direction="top" offset={[0, -15]} className="google-label !text-red-700">
                                            {item.nama_bencana}
                                        </Tooltip>
                                    </Marker>
                                );
                            } else if (item.tipe_lokasi === 'polygon' && Array.isArray(item.lokasi_data)) {
                                const polygonPositions = item.lokasi_data.map((coord: number[]) => [coord[0], coord[1]]); // Assuming [lat, lng]
                                const polygonCenter = L.latLngBounds(polygonPositions).getCenter();

                                return (
                                    <React.Fragment key={`berlangsung-tragedi-polygon-${item.id}`}>
                                        <Polygon
                                            positions={polygonPositions}
                                            pathOptions={{
                                                color: color,
                                                fillColor: color,
                                                fillOpacity: 0.5,
                                                weight: 2
                                            }}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana },
                                                        { label: 'Status', value: item.status },
                                                    ],
                                                    image: item.foto_bencana,
                                                    location: polygonCenter
                                                })
                                            }}
                                        >
                                            <Tooltip permanent direction="center" className="google-label !text-red-700">{item.nama_bencana}</Tooltip>
                                        </Polygon>
                                        <Marker
                                            position={polygonCenter}
                                            icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana },
                                                        { label: 'Status', value: item.status },
                                                    ],
                                                    image: item.foto_bencana,
                                                    location: polygonCenter
                                                })
                                            }}
                                        />
                                    </React.Fragment>
                                );
                            } else if (item.tipe_lokasi === 'radius' && item.lokasi_data && item.lokasi_data.center && item.lokasi_data.radius) {
                                return (
                                    <React.Fragment key={`berlangsung-tragedi-radius-${item.id}`}>
                                        <Circle
                                            center={[item.lokasi_data.center.lat, item.lokasi_data.center.lng]}
                                            radius={item.lokasi_data.radius}
                                            pathOptions={{
                                                color: color,
                                                fillColor: color,
                                                fillOpacity: 0.4,
                                                weight: 2,
                                            }}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana },
                                                        { label: 'Status', value: item.status },
                                                        { label: 'Radius', value: `${item.lokasi_data.radius}m` },
                                                    ],
                                                    image: item.foto_bencana,
                                                    location: [item.lokasi_data.center.lat, item.lokasi_data.center.lng]
                                                })
                                            }}
                                        >
                                            <Tooltip permanent direction="center" className="google-label !text-red-700">{item.nama_bencana}</Tooltip>
                                        </Circle>
                                        <Marker
                                            position={[item.lokasi_data.center.lat, item.lokasi_data.center.lng]}
                                            icon={createDisasterIcon(item.jenis_bencana, item.tingkat_bahaya)}
                                            eventHandlers={{
                                                click: () => onElementClick?.({
                                                    id: item.id,
                                                    nama: item.nama_bencana,
                                                    type: 'bencana',
                                                    category: item.jenis_bencana,
                                                    details: [
                                                        { label: 'Jenis', value: item.jenis_bencana },
                                                        { label: 'Status', value: item.status },
                                                        { label: 'Radius', value: `${item.lokasi_data.radius}m` },
                                                    ],
                                                    image: item.foto_bencana,
                                                    location: [item.lokasi_data.center.lat, item.lokasi_data.center.lng]
                                                })
                                            }}
                                        />
                                    </React.Fragment>
                                );
                            }
                            return null;
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>

            <style dangerouslySetInnerHTML={{
                __html: `
                .google-label {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: #334155 !important; /* slate-700 */
                    padding: 0 !important;
                    white-space: nowrap;
                    pointer-events: none;
                }
                .leaflet-tooltip-top:before,
                .leaflet-tooltip-bottom:before,
                .leaflet-tooltip-left:before,
                .leaflet-tooltip-right:before {
                    display: none !important;
                }
                `
            }} />
        </MapContainer >
    );
}
