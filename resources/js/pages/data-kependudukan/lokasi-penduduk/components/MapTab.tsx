import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_SOMAGEDE_CENTER, DESA_SOMAGEDE_BOUNDARY } from '@/data/mockMapEvents';
import { createFacilityIcon } from '@/lib/map-icons';
import { Penduduk } from './DataTab'; // Import the interface
import { fixLeafletDefaultIcon } from '@/lib/leaflet-utils';

fixLeafletDefaultIcon();

interface MapTabProps {
    penduduk: Penduduk[];
    onMapClick: (latlng: L.LatLng) => void;
}

export interface MapTabRef {
    flyTo: (position: [number, number], zoom?: number) => void;
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

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

const MapTab = forwardRef<MapTabRef, MapTabProps>(({ penduduk, onMapClick }, ref) => {
    const [map, setMap] = useState<L.Map | null>(null);
    const maxBounds = DESA_SOMAGEDE_BOUNDARY ? L.latLngBounds(DESA_SOMAGEDE_BOUNDARY) : undefined;

    useImperativeHandle(ref, () => ({
        flyTo(position, zoom = 18) {
            map?.flyTo(position, zoom);
        }
    }));

    return (
        <div style={{ height: '600px', width: '100%' }}>
            <MapContainer
                ref={setMap}
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
                                    fillColor: 'transparent',
                                    weight: 3,
                                    dashArray: '5, 5'
                                }}
                            />
                        </LayersControl.Overlay>
                    )}

                    <LayersControl.Overlay checked name="Lokasi Penduduk">
                        <LayerGroup>
                            {penduduk.map(p => (
                                <Marker key={p.id} position={[p.lat, p.lng]} icon={createFacilityIcon('rumah')}>
                                    <Popup>
                                        <b>{p.nama}</b><br />
                                        NIK: {p.nik}
                                    </Popup>
                                </Marker>
                            ))}
                        </LayerGroup>
                    </LayersControl.Overlay>
                </LayersControl>
                {!map && DESA_SOMAGEDE_BOUNDARY && <FitBounds boundary={DESA_SOMAGEDE_BOUNDARY} />}
                <MapClickHandler onMapClick={onMapClick} />
            </MapContainer>
        </div>
    );
});

export default MapTab;
