import React from 'react';

interface LegendItem {
    label: string;
    color: string;
    type?: 'point' | 'line';
    iconHtml?: string | HTMLElement | false;
}

interface MapLegendProps {
    items?: LegendItem[];
    title?: string;
}

export default function MapLegend({ items, title = "Legenda" }: MapLegendProps) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control leaflet-bar bg-white p-2 rounded-md shadow-md max-h-[300px] overflow-y-auto">
                <h4 className="font-bold text-sm mb-2">{title}</h4>
                <ul>
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center mb-1 last:mb-0">
                            {item.type === 'line' ? (
                                <div className="w-6 h-1 mr-2" style={{ backgroundColor: item.color }}></div>
                            ) : (
                                <div className="mr-2 flex items-center justify-center w-6 h-6">
                                    {item.iconHtml ? (
                                        <div dangerouslySetInnerHTML={{ __html: item.iconHtml }} style={{ width: '24px', height: '24px' }} />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    )}
                                </div>
                            )}
                            <span className="text-xs capitalize">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
