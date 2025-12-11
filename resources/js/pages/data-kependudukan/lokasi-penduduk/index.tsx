import AppLayout from '@/layouts/app-layout';
import MapLegend from '@/components/maps/MapLegend';
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, Polygon, useMap, TileLayer, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_SOMAGEDE_CENTER, DESA_SOMAGEDE_BOUNDARY } from '@/data/mockMapEvents';
import { createFacilityIcon } from '@/lib/map-icons';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, MapPin, Home, Users, Trash2, Building, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

interface KartuKeluarga {
    id: number;
    nomor_kk: string;
    alamat?: string;
    anggota_keluarga?: Array<{
        id: number;
        nama_lengkap: string;
        nik: string;
    }>;
}

interface Penduduk {
    id: number;
    nik: string;
    nama_lengkap: string;
}

interface Rumah {
    id: number;
    kartu_keluarga_id: number | null;
    penduduk_id: number | null;
    alamat: string;
    rt: string;
    rw: string;
    latitude: number;
    longitude: number;
    keterangan?: string;
    foto_rumah?: string;
    kartu_keluarga?: KartuKeluarga;
    penduduk?: Penduduk;
}

// Component to control map view programmatically
function MapController({ targetLocation }: { targetLocation: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (targetLocation) {
            map.flyTo(targetLocation, 18, {
                duration: 1.5
            });
        }
    }, [targetLocation, map]);

    return null;
}

// Create stable house icon (only created once)


const RumahMarker = React.memo(({ rumah }: { rumah: Rumah }) => {
    if (!rumah.latitude || !rumah.longitude) return null;

    // Get owner name
    const ownerName = rumah.kartu_keluarga?.anggota_keluarga?.[0]?.nama_lengkap
        || rumah.penduduk?.nama_lengkap
        || 'Tidak diketahui';

    const kkNumber = rumah.kartu_keluarga?.nomor_kk;
    const memberCount = rumah.kartu_keluarga?.anggota_keluarga?.length || 0;

    return (
        <Marker
            position={[rumah.latitude, rumah.longitude]}
            icon={createFacilityIcon('rumah')}
        >
            <Popup>
                <div className="p-2 min-w-[220px]">
                    {rumah.foto_rumah && (
                        <div className="mb-3 rounded-md overflow-hidden aspect-video relative bg-gray-100">
                            <img
                                src={rumah.foto_rumah}
                                alt={`Rumah ${ownerName}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        <Home className="h-4 w-4" /> Rumah
                    </h3>
                    <div className="text-sm space-y-1">
                        <p><span className="font-semibold">Alamat:</span> {rumah.alamat}</p>
                        <p><span className="font-semibold">RT/RW:</span> {rumah.rt}/{rumah.rw}</p>
                        {kkNumber && (
                            <>
                                <p><span className="font-semibold">No. KK:</span> {kkNumber}</p>
                                <p><span className="font-semibold">Anggota:</span> {memberCount} orang</p>
                            </>
                        )}
                        {rumah.keterangan && (
                            <p><span className="font-semibold">Keterangan:</span> {rumah.keterangan}</p>
                        )}
                    </div>
                    {rumah.kartu_keluarga?.anggota_keluarga && rumah.kartu_keluarga.anggota_keluarga.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                            <p className="font-semibold text-xs mb-1">Penghuni:</p>
                            <ul className="text-xs space-y-0.5">
                                {rumah.kartu_keluarga.anggota_keluarga.slice(0, 5).map((anggota) => (
                                    <li key={anggota.id}>• {anggota.nama_lengkap}</li>
                                ))}
                                {rumah.kartu_keluarga.anggota_keluarga.length > 5 && (
                                    <li className="text-muted-foreground">...dan {rumah.kartu_keluarga.anggota_keluarga.length - 5} lainnya</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </Popup>
        </Marker>
    );
});

interface Props {
    rumah: Rumah[];
    penduduk: any[]; // Legacy penduduk with locations
}

export default function LokasiPenduduk({ rumah = [], penduduk = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRumah, setSelectedRumah] = useState<Rumah | null>(null);
    const [targetLocation, setTargetLocation] = useState<[number, number] | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [rumahToDelete, setRumahToDelete] = useState<Rumah | null>(null);

    const maxBounds = useMemo(() => {
        return DESA_SOMAGEDE_BOUNDARY ? L.latLngBounds(DESA_SOMAGEDE_BOUNDARY) : undefined;
    }, []);

    // Create display items from rumah data
    // Each house is a separate entry, showing KK info if available
    const displayItems = useMemo(() => {
        return rumah.map(r => {
            const kepalaKeluarga = r.kartu_keluarga?.anggota_keluarga?.[0];
            return {
                ...r,
                displayName: kepalaKeluarga?.nama_lengkap || r.penduduk?.nama_lengkap || 'Tidak diketahui',
                displayNik: kepalaKeluarga?.nik || r.penduduk?.nik || '-',
                memberCount: r.kartu_keluarga?.anggota_keluarga?.length || 0,
            };
        });
    }, [rumah]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return displayItems;
        const lowerQuery = searchQuery.toLowerCase();
        return displayItems.filter(item =>
            item.displayName.toLowerCase().includes(lowerQuery) ||
            item.alamat.toLowerCase().includes(lowerQuery) ||
            item.kartu_keluarga?.nomor_kk?.includes(lowerQuery) ||
            item.displayNik.includes(lowerQuery)
        );
    }, [displayItems, searchQuery]);

    const handleDeleteClick = (rumah: Rumah, e: React.MouseEvent) => {
        e.stopPropagation();
        setRumahToDelete(rumah);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!rumahToDelete) return;

        router.delete(route('data-kependudukan.rumah.destroy', rumahToDelete.id), {
            onSuccess: () => {
                toast.success("Berhasil", {
                    description: "Lokasi rumah berhasil dihapus.",
                });
                setDeleteDialogOpen(false);
                setRumahToDelete(null);
            },
            onError: () => {
                toast.error("Error", {
                    description: "Gagal menghapus lokasi rumah.",
                });
            }
        });
    };

    // Statistics
    const stats = useMemo(() => ({
        totalRumah: rumah.length,
        totalKK: new Set(rumah.filter(r => r.kartu_keluarga_id).map(r => r.kartu_keluarga_id)).size,
        totalAnggota: rumah.reduce((acc, r) => acc + (r.kartu_keluarga?.anggota_keluarga?.length || 0), 0),
    }), [rumah]);

    return (
        <AppLayout>
            <Head title="Lokasi Penduduk" />
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lokasi Rumah Penduduk</h1>
                        <p className="text-muted-foreground">Peta sebaran rumah dan data kependudukan Desa Somagede</p>
                    </div>
                    <Link href="/data-kependudukan/lokasi-penduduk/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Lokasi
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalRumah}</p>
                                <p className="text-sm text-muted-foreground">Total Rumah</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <Home className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalKK}</p>
                                <p className="text-sm text-muted-foreground">Kartu Keluarga</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalAnggota}</p>
                                <p className="text-sm text-muted-foreground">Total Penduduk</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map Section */}
                    <Card className="lg:col-span-2 h-[600px] flex flex-col overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" /> Peta Sebaran Rumah
                            </CardTitle>
                        </CardHeader>
                        <div className="flex-1 relative z-0">
                            <MapContainer
                                center={DESA_SOMAGEDE_CENTER}
                                zoom={14}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                maxBounds={maxBounds}
                                maxBoundsViscosity={1.0}
                                minZoom={13}
                            >
                                <MapLegend />
                                {DESA_SOMAGEDE_BOUNDARY && <FitBounds boundary={DESA_SOMAGEDE_BOUNDARY} />}
                                <MapController targetLocation={targetLocation} />

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

                                    <LayersControl.Overlay checked name="Lokasi Rumah">
                                        <LayerGroup>
                                            {rumah.map((r) => (
                                                <RumahMarker key={r.id} rumah={r} />
                                            ))}
                                        </LayerGroup>
                                    </LayersControl.Overlay>
                                </LayersControl>
                            </MapContainer>
                        </div>
                    </Card>

                    {/* Data List Section */}
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg">Daftar Rumah</CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama, alamat, atau No. KK..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rumah / Kepala Keluarga</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => {
                                                    if (item.latitude && item.longitude) {
                                                        setTargetLocation([item.latitude, item.longitude]);
                                                    }
                                                }}
                                            >
                                                <TableCell>
                                                    <div className="flex-1">
                                                        <div className="font-medium flex items-center gap-2">
                                                            <Home className="h-4 w-4 text-muted-foreground" />
                                                            {item.displayName}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {item.alamat}, RT {item.rt}/RW {item.rw}
                                                        </div>
                                                        {item.kartu_keluarga && (
                                                            <div className="text-xs text-blue-600 mt-1">
                                                                KK: {item.kartu_keluarga.nomor_kk} ({item.memberCount} anggota)
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={route('data-kependudukan.rumah.show', item.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                title="Detail"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={(e) => handleDeleteClick(item, e)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                                {rumah.length === 0
                                                    ? "Belum ada data rumah. Klik 'Tambah Lokasi' untuk menambahkan."
                                                    : "Tidak ada data ditemukan"
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Hapus Lokasi Rumah</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            Apakah Anda yakin ingin menghapus lokasi rumah ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        {rumahToDelete && (
                            <div className="bg-muted p-3 rounded-lg text-sm mt-2">
                                <p><strong>Alamat:</strong> {rumahToDelete.alamat}</p>
                                <p><strong>RT/RW:</strong> {rumahToDelete.rt}/{rumahToDelete.rw}</p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={!!selectedRumah} onOpenChange={(open) => !open && setSelectedRumah(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Detail Rumah</DialogTitle>
                        </DialogHeader>
                        {selectedRumah && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-bold">Alamat</Label>
                                    <div className="col-span-3">{selectedRumah.alamat}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-bold">RT/RW</Label>
                                    <div className="col-span-3">{selectedRumah.rt}/{selectedRumah.rw}</div>
                                </div>
                                {selectedRumah.kartu_keluarga && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right font-bold">No. KK</Label>
                                        <div className="col-span-3">{selectedRumah.kartu_keluarga.nomor_kk}</div>
                                    </div>
                                )}
                                {selectedRumah.keterangan && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right font-bold">Keterangan</Label>
                                        <div className="col-span-3">{selectedRumah.keterangan}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}