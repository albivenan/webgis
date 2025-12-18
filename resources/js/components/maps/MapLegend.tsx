import React, { useMemo, useState } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { Button } from '../ui/button';

interface LegendItem {
    label: string;
    color: string;
    type?: 'point' | 'line';
    iconHtml?: string | HTMLElement | false;
}

import { DivIcon } from 'leaflet';

function toTitleCase(str: string) {
    return str.replace(/_|-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

interface MapLegendProps {
    items?: LegendItem[];
    title?: string;
    facilityIcons?: { [key: string]: DivIcon; };
}

export default function MapLegend({ items, title = "Legenda", facilityIcons }: MapLegendProps) {
    const [isOpen, setIsOpen] = useState(false);
    const legendItems = useMemo(() => {
        if (items && items.length > 0) {
            return items;
        } else if (facilityIcons) {
            return Object.entries(facilityIcons).map(([key, icon]) => ({
                label: toTitleCase(key),
                color: 'transparent', // Color is handled by the icon itself
                type: 'point',
                iconHtml: icon.options.html || '',
            }));
        }
        return [];
    }, [items, facilityIcons]);

    if (legendItems.length === 0) {
        return null;
    }

    return (
        <div className="leaflet-bottom leaflet-left !mb-6 !ml-6 z-[500]">
            {!isOpen ? (
                <div className="leaflet-control">
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="rounded-full shadow-xl w-12 h-12 bg-background/80 backdrop-blur-md border border-border/50 hover:bg-background/100 text-foreground transition-all duration-300"
                        size="icon"
                    >
                        <List className="h-5 w-5" />
                    </Button>
                </div>
            ) : (
                <div className="leaflet-control bg-background/80 backdrop-blur-md p-4 rounded-xl shadow-xl border border-border/50 max-w-[400px] max-h-[450px] overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
                        <h4 className="font-bold text-sm tracking-tight text-foreground/90 flex items-center gap-2">
                            <List className="h-4 w-4 text-muted-foreground" />
                            {title}
                        </h4>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-muted/50 -mr-1"
                            onClick={() => setIsOpen(false)}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                        <div className="grid grid-cols-1 gap-y-2">
                            {legendItems.map((item, index) => {
                                const isHeader = item.color === 'transparent' && !item.iconHtml;

                                if (isHeader) {
                                    return (
                                        <div key={index} className="mt-2 mb-1 first:mt-0">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80">
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={index} className="flex items-center gap-3 py-0.5 group transition-colors">
                                        <div className="flex-shrink-0 w-8 flex justify-center items-center">
                                            {item.type === 'line' ? (
                                                <div
                                                    className="w-full h-1.5 rounded-full shadow-sm"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                            ) : (
                                                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                                                    {item.iconHtml ? (
                                                        <div
                                                            className="flex items-center justify-center"
                                                            dangerouslySetInnerHTML={{ __html: item.iconHtml }}
                                                            style={{ width: '18px', height: '18px' }}
                                                        />
                                                    ) : (
                                                        <div className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/20" style={{ backgroundColor: item.color }}></div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-tight">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                }
            `}} />
        </div>
    );
}
