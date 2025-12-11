import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getEventsByType, type MapEvent } from '@/data/mockMapEvents';

import { AlertTriangle, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Data', href: '/manajemen-data' },
    { title: 'Kecelakaan', href: '/manajemen-data/kecelakaan' },
];

export default function Kecelakaan() {
    const [events] = useState<MapEvent[]>(getEventsByType('accident'));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kecelakaan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                                Data Kecelakaan
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola data kecelakaan lalu lintas di Desa Somagede
                            </p>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Data Kecelakaan
                        </button>
                    </div>

                    {/* Stats Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-6 rounded-lg border bg-card">
                            <div className="text-sm text-muted-foreground">Total Kecelakaan</div>
                            <div className="text-3xl font-bold text-orange-600">{events.length}</div>
                            <div className="text-xs text-muted-foreground mt-2">Data tercatat</div>
                        </div>
                        <div className="p-6 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                            <div className="text-sm text-muted-foreground">Dengan Foto</div>
                            <div className="text-3xl font-bold text-orange-600">
                                {events.filter(e => e.image_path).length}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">Dokumentasi tersedia</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Judul</th>
                                    <th className="text-left p-3 font-semibold">Lokasi</th>
                                    <th className="text-left p-3 font-semibold">Radius Dampak</th>
                                    <th className="text-left p-3 font-semibold">Foto</th>
                                    <th className="text-left p-3 font-semibold">Waktu Kejadian</th>
                                    <th className="text-left p-3 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-t hover:bg-muted/30">
                                        <td className="p-3">
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-sm text-muted-foreground">{event.description}</div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {event.latitude}, {event.longitude}
                                        </td>
                                        <td className="p-3">
                                            {event.radius ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                                                    {event.radius}m
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-3">
                                            {event.image_path ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                    <Eye className="h-3 w-3" />
                                                    Tersedia
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {new Date(event.created_at).toLocaleDateString('id-ID')}
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
