import React from 'react';
import { Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FotoUploadFieldProps {
    label?: string;
    value?: File | null;
    preview?: string | null;
    onChange: (file: File | null) => void;
    onPreviewChange: (preview: string | null) => void;
    maxSize?: number; // bytes, default 2MB
    accept?: string;
    error?: string;
}

export default function FotoUploadField({
    label = 'Foto',
    value,
    preview,
    onChange,
    onPreviewChange,
    maxSize = 2 * 1024 * 1024,
    accept = 'image/jpeg,image/jpg,image/png',
    error,
}: FotoUploadFieldProps) {
    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > maxSize) {
                alert(`Ukuran foto tidak boleh lebih dari ${maxSize / (1024 * 1024)}MB.`);
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert('Format foto harus JPG, JPEG, atau PNG.');
                return;
            }

            onChange(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                onPreviewChange(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFoto = () => {
        onChange(null);
        onPreviewChange(null);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="foto">{label} (Opsional)</Label>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label
                        htmlFor="foto"
                        className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition"
                    >
                        <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">Klik untuk upload foto</p>
                            <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max {maxSize / (1024 * 1024)}MB)</p>
                        </div>
                        <input
                            id="foto"
                            type="file"
                            accept={accept}
                            onChange={handleFotoChange}
                            className="hidden"
                        />
                    </label>
                </div>
                {preview && (
                    <div className="relative w-24 h-24">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button
                            type="button"
                            onClick={handleRemoveFoto}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
