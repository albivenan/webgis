export const getRoadColor = (jenis: string) => {
    switch (jenis) {
        case 'jalan_nasional':
            return '#dc2626'; // Red
        case 'jalan_provinsi':
            return '#ea580c'; // Orange
        case 'jalan_kabupaten':
            return '#eab308'; // Yellow
        case 'jalan_desa':
            return '#2563eb'; // Blue
        case 'jalan_lingkungan':
            return '#16a34a'; // Green
        case 'jalan_setapak':
            return '#71717a'; // Zinc/Gray
        default:
            return '#3b82f6'; // Default Blue
    }
};

export const calculatePolylineLength = (coords: [number, number][]) => {
    if (coords.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        const [lat1, lng1] = coords[i];
        const [lat2, lng2] = coords[i + 1];

        // Haversine formula roughly or use a library if available. 
        // Since we have Leaflet context usually, but this is a pure function.
        // We will implement a simple Haversine calculation here for independence.
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres
        totalDistance += d;
    }
    return totalDistance;
};

export const formatLength = (meters: number) => {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
};
