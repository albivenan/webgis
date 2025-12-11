import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getEventsByType, type MapEvent } from '@/data/mockMapEvents';
import { Car, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Data', href: '/manajemen-data' },
    { title: 'Kemacetan', href: '/manajemen-data/kemacetan' },
];

export default function Kemacetan() {
    const [events] = useState<MapEvent[]>(getEventsByType('traffic'));

    const getLevelBadgeColor = (level?: string) => {
        switch (level) {
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kemacetan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Car className="h-6 w-6" />
                                Data Kemacetan
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola data kemacetan lalu lintas di Desa Somagede
                            </p>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Data Kemacetan
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-lg border bg-card">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="text-2xl font-bold">{events.length}</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                            <div className="text-sm text-muted-foreground">Low</div>
                            <div className="text-2xl font-bold text-green-600">{events.filter(e => e.level === 'low').length}</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                            <div className="text-sm text-muted-foreground">Medium</div>
                            <div className="text-2xl font-bold text-yellow-600">{events.filter(e => e.level === 'medium').length}</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/20">
                            <div className="text-sm text-muted-foreground">High</div>
                            <div className="text-2xl font-bold text-red-600">{events.filter(e => e.level === 'high').length}</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Judul</th>
                                    <th className="text-left p-3 font-semibold">Level</th>
                                    <th className="text-left p-3 font-semibold">Tipe</th>
                                    <th className="text-left p-3 font-semibold">Koordinat</th>
                                    <th className="text-left p-3 font-semibold">Deskripsi</th>
                                    <th className="text-left p-3 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-t hover:bg-muted/30">
                                        <td className="p-3 font-medium">{event.title}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(event.level)}`}>
                                                {event.level?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {event.polyline ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                    Polyline
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                                    Circle
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {event.latitude && event.longitude ? (
                                                <>{event.latitude}, {event.longitude}</>
                                            ) : (
                                                'Multiple points'
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                                            {event.description}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-muted rounded">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 hover:bg-muted rounded text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
