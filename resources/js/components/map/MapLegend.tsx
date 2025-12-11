import { Card } from "@/components/ui/card";

const legendItems = [
    { level: "Rendah", color: "#22c55e" },
    { level: "Sedang", color: "#facc15" },
    { level: "Tinggi", color: "#f97316" },
    { level: "Sangat Tinggi", color: "#ef4444" },
];

export function MapLegend() {
    return (
        <div className="leaflet-bottom leaflet-right p-4" style={{ zIndex: 1000 }}>
            <Card className="p-3 bg-white/80 backdrop-blur-sm">
                <h4 className="font-bold text-sm mb-2">Legenda</h4>
                <div className="space-y-1">
                    {legendItems.map(item => (
                        <div key={item.level} className="flex items-center gap-2">
                            <span
                                className="inline-block w-4 h-4 rounded-full"
                                style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="text-xs">{item.level}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
