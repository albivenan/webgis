import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, MapPin } from "lucide-react";

export interface Penduduk {
    id: number;
    nama: string;
    nik: string;
    lat: number;
    lng: number;
}

interface DataTabProps {
    penduduk: Penduduk[];
    onAdd: () => void;
    onEdit: (penduduk: Penduduk) => void;
    onDelete: (id: number) => void;
    onViewOnMap: (penduduk: Penduduk) => void;
}

export default function DataTab({ penduduk, onAdd, onEdit, onDelete, onViewOnMap }: DataTabProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Data Penduduk</CardTitle>
                <Button onClick={onAdd} size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Tambah Data
                </Button>
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">No</th>
                            <th scope="col" className="px-6 py-3">Nama</th>
                            <th scope="col" className="px-6 py-3">NIK</th>
                            <th scope="col" className="px-6 py-3">Latitude</th>
                            <th scope="col" className="px-6 py-3">Longitude</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {penduduk.map((p, index) => (
                            <tr key={p.id} className="bg-white border-b">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">{p.nama}</td>
                                <td className="px-6 py-4">{p.nik}</td>
                                <td className="px-6 py-4">{p.lat.toFixed(5)}</td>
                                <td className="px-6 py-4">{p.lng.toFixed(5)}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => onViewOnMap(p)}>
                                        <MapPin className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => onEdit(p)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => onDelete(p.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
