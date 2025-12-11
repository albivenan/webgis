import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

interface LocationSearchProps {
    onLocationSelect?: (lat: number, lng: number) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
    const map = useMap();

    // This component could be expanded to use a geocoding service or search local data
    // For now, it's a placeholder for future implementation or can be used to fly to coordinates

    return null;
}
