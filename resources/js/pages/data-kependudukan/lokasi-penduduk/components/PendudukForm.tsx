import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Penduduk } from "./DataTab";
import { useEffect, useState } from "react";

interface PendudukFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (penduduk: Omit<Penduduk, 'id' | 'lat' | 'lng'> & { id?: number }) => void;
    penduduk: Omit<Penduduk, 'id' | 'lat' | 'lng'> | null;
}

export default function PendudukForm({ isOpen, onClose, onSave, penduduk }: PendudukFormProps) {
    const [nama, setNama] = useState('');
    const [nik, setNik] = useState('');
    const [errors, setErrors] = useState({ nama: '', nik: '' });

    useEffect(() => {
        if (isOpen) {
            if (penduduk) {
                setNama(penduduk.nama);
                setNik(penduduk.nik);
            } else {
                setNama('');
                setNik('');
            }
            setErrors({ nama: '', nik: '' }); // Reset errors when form opens or penduduk changes
        }
    }, [penduduk, isOpen]);

    const validate = () => {
        const newErrors = { nama: '', nik: '' };
        let isValid = true;
        if (!nama) {
            newErrors.nama = 'Nama tidak boleh kosong.';
            isValid = false;
        }
        if (!nik) {
            newErrors.nik = 'NIK tidak boleh kosong.';
            isValid = false;
        } else if (!/^\d{16}$/.test(nik)) {
            newErrors.nik = 'NIK harus terdiri dari 16 digit angka.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };


    const handleSubmit = () => {
        if (!validate()) {
            return;
        }
        onSave({ nama, nik });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{penduduk ? 'Edit' : 'Tambah'} Data Penduduk</DialogTitle>
                    <DialogDescription>
                        Isi informasi penduduk di bawah ini. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nama" className="text-right">
                            Nama
                        </Label>
                        <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="col-span-3" />
                    </div>
                     {errors.nama && <p className="col-span-5 text-red-500 text-sm text-right -mt-2">{errors.nama}</p>}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nik" className="text-right">
                            NIK
                        </Label>
                        <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} className="col-span-3" />
                    </div>
                    {errors.nik && <p className="col-span-5 text-red-500 text-sm text-right -mt-2">{errors.nik}</p>}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
