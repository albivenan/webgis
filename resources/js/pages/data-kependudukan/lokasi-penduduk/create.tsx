import AppLayout from '@/layouts/app-layout';
import BaseMapLayers from '@/components/maps/BaseMapLayers';
import { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { MapContainer, Marker, useMapEvents, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_SOMAGEDE_CENTER, DESA_SOMAGEDE_BOUNDARY } from '@/data/mockMapEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, MapPin, Home, Users, Check, ChevronsUpDown, Building, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper function to check if a point is inside the boundary polygon
function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > lng) !== (yj > lng)) &&
            (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Component to handle map clicks and update form with boundary validation
function LocationPicker({
    onLocationSelect,
    onAddressFound,
    boundary
}: {
    onLocationSelect: (lat: number, lng: number) => void;
    onAddressFound?: (address: string) => void;
    boundary?: [number, number][];
}) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            // Check if click is inside boundary
            if (boundary && boundary.length > 0) {
                if (!isPointInPolygon(e.latlng.lat, e.latlng.lng, boundary)) {
                    toast.error("Lokasi di luar batas", {
                        description: "Lokasi yang dipilih harus berada di dalam batas wilayah desa.",
                    });
                    return;
                }
            }

            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);

            // Reverse geocoding for auto address
            if (onAddressFound) {
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.display_name) {
                            onAddressFound(data.display_name);
                        }
                    })
                    .catch(err => console.error('Reverse geocoding error:', err));
            }
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
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

interface PendudukResult {
    id: number;
    nama_lengkap: string;
    nik: string;
    alamat: string;
    jenis_kelamin?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    status_perkawinan?: string;
    pekerjaan?: string;
    kartu_keluarga_id: number | null;
    kartu_keluarga?: {
        id: number;
        nomor_kk: string;
        alamat?: string;
        rt?: string;
        rw?: string;
        latitude?: number | null;
        longitude?: number | null;
    };
    latitude?: number | null;
    longitude?: number | null;
}

interface RumahExisting {
    id: number;
    alamat: string;
    rt: string;
    rw: string;
    latitude: number;
    longitude: number;
    keterangan?: string;
}

interface Props {
    kartuKeluargaList?: any[];
}

export default function CreateLokasiPenduduk({ kartuKeluargaList = [] }: Props) {
    const [activeTab, setActiveTab] = useState('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PendudukResult[]>([]);
    const [selectedPenduduk, setSelectedPenduduk] = useState<PendudukResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [existingRumah, setExistingRumah] = useState<RumahExisting[]>([]);
    const [autoAddress, setAutoAddress] = useState('');
    const [newFotoPreview, setNewFotoPreview] = useState<string | null>(null);
    const [rumahFotoPreview, setRumahFotoPreview] = useState<string | null>(null);

    // Form for new entry with complete fields
    const { data: newData, setData: setNewData, post: postNew, processing: processingNew, errors: errorsNew, reset: resetNew } = useForm({
        nama_lengkap: '',
        nik: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        alamat: '',
        alamat_auto: '',
        rt: '',
        rw: '',
        status_perkawinan: '',
        pekerjaan: '',
        keterangan: '',
        latitude: '',
        longitude: '',
        foto_rumah: null as File | null,
    });

    // Form for adding new house for existing resident (Warga Lokal)
    const { data: rumahData, setData: setRumahData, post: postRumah, processing: processingRumah, errors: errorsRumah, reset: resetRumah } = useForm({
        kartu_keluarga_id: '',
        penduduk_id: '',
        alamat: '',
        rt: '',
        rw: '',
        latitude: '',
        longitude: '',
        keterangan: '',
        foto_rumah: null as File | null,
    });

    const maxBounds = DESA_SOMAGEDE_BOUNDARY ? L.latLngBounds(DESA_SOMAGEDE_BOUNDARY) : undefined;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const response = await axios.get(route('api.penduduk.search'), {
                params: { query: query }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching penduduk:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
    };

    const handleSelectPenduduk = async (penduduk: PendudukResult) => {
        setSelectedPenduduk(penduduk);
        setOpen(false);
        setAutoAddress('');

        // Set form data for new house
        setRumahData({
            kartu_keluarga_id: penduduk.kartu_keluarga_id?.toString() || '',
            penduduk_id: penduduk.kartu_keluarga_id ? '' : penduduk.id.toString(), // Only set if no KK
            alamat: penduduk.kartu_keluarga?.alamat || penduduk.alamat || '',
            rt: penduduk.kartu_keluarga?.rt || '',
            rw: penduduk.kartu_keluarga?.rw || '',
            latitude: '',
            longitude: '',
            keterangan: '',
        });

        // Fetch existing houses for this KK
        if (penduduk.kartu_keluarga_id) {
            try {
                const response = await axios.get(route('api.rumah.by-kk', penduduk.kartu_keluarga_id));
                setExistingRumah(response.data);
            } catch (error) {
                console.error('Error fetching existing houses:', error);
                setExistingRumah([]);
            }
        } else {
            setExistingRumah([]);
        }
    };

    const handleNewLocationSelect = (lat: number, lng: number) => {
        setNewData(data => ({
            ...data,
            latitude: lat.toString(),
            longitude: lng.toString()
        }));
    };

    const handleNewAddressFound = (address: string) => {
        setNewData(data => ({
            ...data,
            alamat_auto: address
        }));
    };

    const handleRumahLocationSelect = (lat: number, lng: number) => {
        setRumahData(data => ({
            ...data,
            latitude: lat.toString(),
            longitude: lng.toString()
        }));
        // Reverse geocoding for display
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
            .then(res => res.json())
            .then(data => {
                if (data && data.display_name) {
                    setAutoAddress(data.display_name);
                }
            })
            .catch(err => console.error('Reverse geocoding error:', err));
    };

    const handleNewFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Gagal", {
                    description: "Ukuran foto tidak boleh lebih dari 2MB.",
                });
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                toast.error("Gagal", {
                    description: "Format foto harus JPG, JPEG, atau PNG.",
                });
                return;
            }

            setNewData('foto_rumah', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setNewFotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveNewFoto = () => {
        setNewData('foto_rumah', null);
        setNewFotoPreview(null);
    };

    const handleRumahFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Gagal", {
                    description: "Ukuran foto tidak boleh lebih dari 2MB.",
                });
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                toast.error("Gagal", {
                    description: "Format foto harus JPG, JPEG, atau PNG.",
                });
                return;
            }

            setRumahData('foto_rumah', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setRumahFotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveRumahFoto = () => {
        setRumahData('foto_rumah', null);
        setRumahFotoPreview(null);
    };

    const handleNewSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Remove alamat_auto and prepare data
        const { alamat_auto, ...formData } = newData;

        // Convert latitude and longitude to numbers
        const dataToSubmit = {
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
        };

        router.post(route('data-kependudukan.lokasi-penduduk.store'), dataToSubmit, {
            onSuccess: () => {
                toast.success("Berhasil", {
                    description: "Data penduduk baru berhasil ditambahkan.",
                });
                resetNew();
                setNewFotoPreview(null);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                const errorMessages = Object.values(errors).flat().join(', ');
                toast.error("Error", {
                    description: errorMessages || "Gagal menambahkan data penduduk.",
                });
            }
        });
    };

    const handleRumahSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPenduduk) {
            toast.error("Error", {
                description: "Pilih penduduk terlebih dahulu.",
            });
            return;
        }

        postRumah(route('data-kependudukan.rumah.store'), {
            onSuccess: () => {
                toast.success("Berhasil", {
                    description: "Lokasi rumah baru berhasil ditambahkan.",
                });
                // Refresh existing houses
                if (selectedPenduduk.kartu_keluarga_id) {
                    axios.get(route('api.rumah.by-kk', selectedPenduduk.kartu_keluarga_id))
                        .then(response => setExistingRumah(response.data))
                        .catch(console.error);
                }
                // Reset location fields only
                setRumahData(data => ({
                    ...data,
                    latitude: '',
                    longitude: '',
                    keterangan: '',
                    foto_rumah: null,
                }));
                setAutoAddress('');
                setRumahFotoPreview(null);
            },
            onError: (errors) => {
                console.error('Error saving house:', errors);
                toast.error("Error", {
                    description: "Gagal menyimpan lokasi rumah.",
                });
            }
        });
    };

    const currentLatitude = activeTab === 'new' ? newData.latitude : rumahData.latitude;
    const currentLongitude = activeTab === 'new' ? newData.longitude : rumahData.longitude;

    return (
        <AppLayout>
            <Head title="Tambah Lokasi Rumah" />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/data-kependudukan/lokasi-penduduk">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah Lokasi Rumah</h1>
                        <p className="text-muted-foreground">Tambahkan penduduk baru atau pilih warga lokal yang sudah terdaftar</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <Card className="h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Data Penduduk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="new">
                                        <Home className="h-4 w-4 mr-2" />
                                        Penduduk Baru
                                    </TabsTrigger>
                                    <TabsTrigger value="existing">
                                        <Users className="h-4 w-4 mr-2" />
                                        Warga Lokal
                                    </TabsTrigger>
                                </TabsList>

                                {/* New Entry Form */}
                                <TabsContent value="new" className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Untuk penduduk baru atau bukan warga lokal
                                    </p>
                                    <form onSubmit={handleNewSubmit} className="space-y-6">
                                        {/* Data Pribadi Section */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm border-b pb-2">Data Pribadi</h4>

                                            <div className="space-y-2">
                                                <Label htmlFor="nama_lengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="nama_lengkap"
                                                    value={newData.nama_lengkap}
                                                    onChange={(e) => setNewData('nama_lengkap', e.target.value)}
                                                    placeholder="Nama lengkap sesuai KTP"
                                                    required
                                                />
                                                {errorsNew.nama_lengkap && <p className="text-sm text-red-500">{errorsNew.nama_lengkap}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nik">NIK <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="nik"
                                                    value={newData.nik}
                                                    onChange={(e) => setNewData('nik', e.target.value)}
                                                    placeholder="16 digit NIK"
                                                    maxLength={16}
                                                    required
                                                />
                                                {errorsNew.nik && <p className="text-sm text-red-500">{errorsNew.nik}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                                                    <Select value={newData.jenis_kelamin} onValueChange={(v) => setNewData('jenis_kelamin', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="L">Laki-laki</SelectItem>
                                                            <SelectItem value="P">Perempuan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="status_perkawinan">Status Perkawinan</Label>
                                                    <Select value={newData.status_perkawinan} onValueChange={(v) => setNewData('status_perkawinan', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                                                            <SelectItem value="Kawin">Kawin</SelectItem>
                                                            <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                                                            <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                                                    <Input
                                                        id="tempat_lahir"
                                                        value={newData.tempat_lahir}
                                                        onChange={(e) => setNewData('tempat_lahir', e.target.value)}
                                                        placeholder="Kota/Kabupaten"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                                                    <Input
                                                        id="tanggal_lahir"
                                                        type="date"
                                                        value={newData.tanggal_lahir}
                                                        onChange={(e) => setNewData('tanggal_lahir', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="pekerjaan">Pekerjaan</Label>
                                                <Input
                                                    id="pekerjaan"
                                                    value={newData.pekerjaan}
                                                    onChange={(e) => setNewData('pekerjaan', e.target.value)}
                                                    placeholder="Contoh: Wiraswasta, PNS, dll"
                                                />
                                            </div>
                                        </div>

                                        {/* Alamat Section */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm border-b pb-2">Informasi Alamat</h4>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="rt">RT <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="rt"
                                                        value={newData.rt}
                                                        onChange={(e) => setNewData('rt', e.target.value)}
                                                        placeholder="001"
                                                        maxLength={3}
                                                        required
                                                    />
                                                    {errorsNew.rt && <p className="text-sm text-red-500">{errorsNew.rt}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="rw">RW <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="rw"
                                                        value={newData.rw}
                                                        onChange={(e) => setNewData('rw', e.target.value)}
                                                        placeholder="001"
                                                        maxLength={3}
                                                        required
                                                    />
                                                    {errorsNew.rw && <p className="text-sm text-red-500">{errorsNew.rw}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="alamat_auto">Alamat (Dari Peta)</Label>
                                                <Input
                                                    id="alamat_auto"
                                                    value={newData.alamat_auto}
                                                    readOnly
                                                    className="bg-muted"
                                                    placeholder="Klik peta untuk mengisi otomatis"
                                                />
                                                <p className="text-xs text-muted-foreground">Alamat ini terisi otomatis dari lokasi yang Anda pilih di peta</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="alamat">Alamat (Manual) <span className="text-red-500">*</span></Label>
                                                <Textarea
                                                    id="alamat"
                                                    value={newData.alamat}
                                                    onChange={(e) => setNewData('alamat', e.target.value)}
                                                    placeholder="Alamat lengkap sesuai KTP"
                                                    required
                                                />
                                                {errorsNew.alamat && <p className="text-sm text-red-500">{errorsNew.alamat}</p>}
                                            </div>
                                        </div>

                                        {/* Lokasi Section */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm border-b pb-2">Koordinat Lokasi</h4>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Latitude</Label>
                                                    <Input
                                                        value={newData.latitude}
                                                        readOnly
                                                        className="bg-muted"
                                                        placeholder="Klik peta"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Longitude</Label>
                                                    <Input
                                                        value={newData.longitude}
                                                        readOnly
                                                        className="bg-muted"
                                                        placeholder="Klik peta"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Koordinat akan terisi otomatis saat Anda klik lokasi di peta</p>
                                        </div>

                                        {/* Keterangan Section */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm border-b pb-2">Informasi Tambahan</h4>

                                            <div className="space-y-2">
                                                <Label htmlFor="keterangan">Keterangan</Label>
                                                <Textarea
                                                    id="keterangan"
                                                    value={newData.keterangan}
                                                    onChange={(e) => setNewData('keterangan', e.target.value)}
                                                    placeholder="Catatan tambahan (opsional)"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="foto_rumah">Foto Rumah (Opsional)</Label>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <label htmlFor="foto_rumah" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                                            <div className="text-center">
                                                                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                                                <p className="text-sm font-medium">Klik untuk upload foto</p>
                                                                <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 2MB)</p>
                                                            </div>
                                                            <input
                                                                id="foto_rumah"
                                                                type="file"
                                                                accept="image/jpeg,image/jpg,image/png"
                                                                onChange={handleNewFotoChange}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                    {newFotoPreview && (
                                                        <div className="relative w-24 h-24">
                                                            <img src={newFotoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveNewFoto}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={processingNew || !newData.latitude}>
                                            <Save className="mr-2 h-4 w-4" /> Simpan Data Penduduk
                                        </Button>
                                    </form>
                                </TabsContent>

                                {/* Existing Resident - Add New House */}
                                <TabsContent value="existing" className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Tambahkan lokasi rumah baru untuk warga lokal yang sudah terdaftar dalam Kartu Keluarga.
                                    </p>

                                    <div className="space-y-6">
                                        {/* Search Section */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm border-b pb-2">Cari Penduduk</h4>
                                            <div className="flex flex-col space-y-2">
                                                <Label>Cari Berdasarkan Nama</Label>
                                                <Popover open={open} onOpenChange={setOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={open}
                                                            className="w-full justify-between"
                                                        >
                                                            {selectedPenduduk
                                                                ? selectedPenduduk.nama_lengkap
                                                                : "Cari nama penduduk..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[300px] p-0" align="start">
                                                        <Command shouldFilter={false}>
                                                            <CommandInput
                                                                placeholder="Ketik nama penduduk..."
                                                                value={searchQuery}
                                                                onValueChange={handleSearchInput}
                                                            />
                                                            <CommandList>
                                                                {isSearching && <CommandEmpty>Mencari...</CommandEmpty>}
                                                                {!isSearching && searchResults.length === 0 && searchQuery.length > 0 && (
                                                                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                                )}
                                                                {!isSearching && searchResults.length === 0 && searchQuery.length === 0 && (
                                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                                        Ketik minimal 2 karakter
                                                                    </div>
                                                                )}
                                                                <CommandGroup>
                                                                    {searchResults.map((penduduk) => (
                                                                        <CommandItem
                                                                            key={penduduk.id}
                                                                            value={penduduk.nama_lengkap}
                                                                            onSelect={() => handleSelectPenduduk(penduduk)}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    selectedPenduduk?.id === penduduk.id
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            <div className="flex flex-col">
                                                                                <span>{penduduk.nama_lengkap}</span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    NIK: {penduduk.nik} • KK: {penduduk.kartu_keluarga?.nomor_kk}
                                                                                </span>
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        {/* Selected Resident Detail */}
                                        {selectedPenduduk && (
                                            <>
                                                {/* Data Pribadi (Read-only) */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-sm border-b pb-2">Data Pribadi</h4>

                                                    <div className="space-y-2">
                                                        <Label>Nama Lengkap</Label>
                                                        <Input value={selectedPenduduk.nama_lengkap} readOnly className="bg-muted" />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>NIK</Label>
                                                            <Input value={selectedPenduduk.nik} readOnly className="bg-muted" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Jenis Kelamin</Label>
                                                            <Input
                                                                value={selectedPenduduk.jenis_kelamin === 'L' ? 'Laki-laki' : selectedPenduduk.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                                                                readOnly
                                                                className="bg-muted"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Nomor KK</Label>
                                                        <Input value={selectedPenduduk.kartu_keluarga?.nomor_kk || '-'} readOnly className="bg-muted" />
                                                    </div>
                                                </div>

                                                {/* Existing Houses */}
                                                {existingRumah.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-sm border-b pb-2 flex items-center gap-2">
                                                            <Building className="h-4 w-4" />
                                                            Rumah Terdaftar ({existingRumah.length})
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {existingRumah.map((rumah, index) => (
                                                                <div key={rumah.id} className="p-3 bg-muted rounded-lg text-sm">
                                                                    <div className="font-medium">Rumah #{index + 1}</div>
                                                                    <div className="text-muted-foreground">
                                                                        {rumah.alamat} RT {rumah.rt}/RW {rumah.rw}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        Koordinat: {rumah.latitude}, {rumah.longitude}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* New House Form */}
                                                <form onSubmit={handleRumahSubmit} className="space-y-4">
                                                    <h4 className="font-semibold text-sm border-b pb-2">Tambah Rumah Baru</h4>

                                                    {autoAddress && (
                                                        <div className="space-y-2">
                                                            <Label>Alamat (Dari Peta)</Label>
                                                            <Input value={autoAddress} readOnly className="bg-muted text-sm" />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label htmlFor="rumah_alamat">Alamat Rumah <span className="text-red-500">*</span></Label>
                                                        <Textarea
                                                            id="rumah_alamat"
                                                            value={rumahData.alamat}
                                                            onChange={(e) => setRumahData('alamat', e.target.value)}
                                                            placeholder="Alamat lengkap rumah"
                                                            required
                                                        />
                                                        {errorsRumah.alamat && <p className="text-sm text-red-500">{errorsRumah.alamat}</p>}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="rumah_rt">RT <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                id="rumah_rt"
                                                                value={rumahData.rt}
                                                                onChange={(e) => setRumahData('rt', e.target.value)}
                                                                placeholder="001"
                                                                maxLength={3}
                                                                required
                                                            />
                                                            {errorsRumah.rt && <p className="text-sm text-red-500">{errorsRumah.rt}</p>}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="rumah_rw">RW <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                id="rumah_rw"
                                                                value={rumahData.rw}
                                                                onChange={(e) => setRumahData('rw', e.target.value)}
                                                                placeholder="001"
                                                                maxLength={3}
                                                                required
                                                            />
                                                            {errorsRumah.rw && <p className="text-sm text-red-500">{errorsRumah.rw}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Latitude <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                value={rumahData.latitude}
                                                                readOnly
                                                                className="bg-muted"
                                                                placeholder="Klik peta"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Longitude <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                value={rumahData.longitude}
                                                                readOnly
                                                                className="bg-muted"
                                                                placeholder="Klik peta"
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Klik pada peta untuk menentukan lokasi rumah baru.</p>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="rumah_keterangan">Keterangan</Label>
                                                        <Textarea
                                                            id="rumah_keterangan"
                                                            value={rumahData.keterangan}
                                                            onChange={(e) => setRumahData('keterangan', e.target.value)}
                                                            placeholder="Catatan tambahan (opsional)"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="rumah_foto">Foto Rumah (Opsional)</Label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <label htmlFor="rumah_foto" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                                                    <div className="text-center">
                                                                        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                                                        <p className="text-sm font-medium">Klik untuk upload foto</p>
                                                                        <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 2MB)</p>
                                                                    </div>
                                                                    <input
                                                                        id="rumah_foto"
                                                                        type="file"
                                                                        accept="image/jpeg,image/jpg,image/png"
                                                                        onChange={handleRumahFotoChange}
                                                                        className="hidden"
                                                                    />
                                                                </label>
                                                            </div>
                                                            {rumahFotoPreview && (
                                                                <div className="relative w-24 h-24">
                                                                    <img src={rumahFotoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleRemoveRumahFoto}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button type="submit" className="w-full" disabled={processingRumah || !rumahData.latitude}>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Tambah Rumah Baru
                                                    </Button>
                                                </form>
                                            </>
                                        )}

                                        {!selectedPenduduk && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>Pilih penduduk dari pencarian di atas untuk menambahkan lokasi rumah baru.</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Map Section */}
                    <Card className="lg:col-span-2 h-[700px] flex flex-col overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" /> Pilih Lokasi di Peta
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">Klik pada peta untuk menandai lokasi rumah. Lokasi harus berada di dalam batas wilayah desa.</p>
                        </CardHeader>
                        <div className="flex-1 relative z-0">
                            <MapContainer
                                center={DESA_SOMAGEDE_CENTER}
                                zoom={15}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                maxBounds={maxBounds}
                                maxBoundsViscosity={1.0}
                                minZoom={14}
                            >
                                <BaseMapLayers />
                                {DESA_SOMAGEDE_BOUNDARY && <FitBounds boundary={DESA_SOMAGEDE_BOUNDARY} />}
                                {DESA_SOMAGEDE_BOUNDARY && (
                                    <Polygon
                                        positions={DESA_SOMAGEDE_BOUNDARY}
                                        pathOptions={{
                                            color: '#2563eb',
                                            fillColor: '#3b82f6',
                                            fillOpacity: 0.1,
                                            weight: 2,
                                            dashArray: '5, 5'
                                        }}
                                    />
                                )}
                                <LocationPicker
                                    onLocationSelect={activeTab === 'new' ? handleNewLocationSelect : handleRumahLocationSelect}
                                    onAddressFound={activeTab === 'new' ? handleNewAddressFound : undefined}
                                    boundary={DESA_SOMAGEDE_BOUNDARY}
                                />
                                {currentLatitude && currentLongitude && (
                                    <Marker position={[parseFloat(currentLatitude), parseFloat(currentLongitude)]} />
                                )}
                                {/* Show existing houses on map */}
                                {activeTab === 'existing' && existingRumah.map((rumah) => (
                                    <Marker
                                        key={rumah.id}
                                        position={[rumah.latitude, rumah.longitude]}
                                        opacity={0.6}
                                    />
                                ))}
                            </MapContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
