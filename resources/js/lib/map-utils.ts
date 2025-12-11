/**
 * Map Utilities - Shared functions for map-related operations
 */

// Format area display
export const formatLuas = (luas?: number): string => {
    if (!luas) return '-';
    if (luas >= 10000) {
        const hectares = luas / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
    return `${Math.round(luas).toLocaleString('id-ID')} m²`;
};

// Calculate area from polygon coordinates using Shoelace formula
export const calculateArea = (coordinates: [number, number][]): number => {
    if (coordinates.length < 3) return 0;

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

    return area * metersPerDegreeLat * metersPerDegreeLng;
};

// Land use colors
export const LAND_USE_COLORS: { [key: string]: string } = {
    'Pertanian': '#84cc16',      // Lime
    'Pemukiman': '#f59e0b',      // Amber
    'Perkebunan': '#22c55e',     // Green
    'Hutan': '#15803d',          // Dark Green
    'Industri': '#64748b',       // Slate
    'Fasilitas Umum': '#3b82f6', // Blue
    'Lainnya': '#9ca3af',        // Gray
};

// Danger level colors
export const DANGER_LEVEL_COLORS: { [key: string]: string } = {
    'rendah': '#22c55e',         // green-500
    'sedang': '#facc15',         // yellow-400
    'tinggi': '#f97316',         // orange-500
    'sangat_tinggi': '#ef4444',  // red-500
};

// Danger level badge colors
export const DANGER_LEVEL_BADGE_COLORS: { [key: string]: string } = {
    'rendah': 'bg-green-100 text-green-800',
    'sedang': 'bg-yellow-100 text-yellow-800',
    'tinggi': 'bg-orange-100 text-orange-800',
    'sangat_tinggi': 'bg-red-100 text-red-800',
};
