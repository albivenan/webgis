import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    users: {
        data: User[];
        links: any[]; // You might want to type this properly if using pagination links
        meta: any;
    };
    filters: {
        search: string;
    };
    auth: {
        user: User;
    };
}

export default function Daftar({ users, filters, auth }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isInternalUpdate, setIsInternalUpdate] = useState(false);

    // Create/Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Delete Alert State
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Form Hook
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Handle Search Debounce
    useEffect(() => {
        if (isInternalUpdate) {
            const timer = setTimeout(() => {
                router.get(
                    route('pengguna.daftar'),
                    { search: searchQuery },
                    { preserveState: true, replace: true }
                );
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, isInternalUpdate]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsInternalUpdate(true);
    };

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            put(route('pengguna.update', editingUser.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('User berhasil diperbarui');
                },
                onError: () => toast.error('Gagal memperbarui user, periksa inputan anda.'),
            });
        } else {
            post(route('pengguna.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('User berhasil ditambahkan');
                },
                onError: () => toast.error('Gagal menambahkan user, periksa inputan anda.'),
            });
        }
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
    };

    const handleDelete = () => {
        if (!userToDelete) return;

        router.delete(route('pengguna.destroy', userToDelete.id), {
            onSuccess: () => {
                setUserToDelete(null);
                toast.success('User berhasil dihapus');
            },
            onError: (err) => {
                // Handle specific error messages if passed from backend session flash
                // Since this uses standard inertia delete, we might need verify how errors come back.
                // Assuming global error handling or page flash props are handled by layout.
                // If specific 403, Inertia handles it.
                toast.error('Gagal menghapus user.');
                setUserToDelete(null);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Manajemen User', href: '/pengguna/daftar' }]}>
            <Head title="Manajemen User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Pengguna</h1>
                        <p className="text-muted-foreground">
                            Kelola pengguna yang memiliki akses ke sistem.
                        </p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah User
                    </Button>
                </div>

                <div className="flex items-center py-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Terdaftar Sejak</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                users.data.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(user)}
                                                    disabled={user.id === 1 && auth.user.id !== 1}
                                                    title={user.id === 1 ? "User Utama tidak dapat diedit" : "Edit User"}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => confirmDelete(user)}
                                                    disabled={user.id === 1 || user.id === auth.user.id}
                                                    title={
                                                        user.id === 1
                                                            ? "User Utama tidak dapat dihapus"
                                                            : user.id === auth.user.id
                                                                ? "Tidak dapat menghapus akun sendiri"
                                                                : "Hapus User"
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Tidak ada data user.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? 'Perbarui informasi pengguna di bawah ini.'
                                : 'Isi form di bawah ini untuk menambahkan pengguna baru.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Jhon Doe"
                                required
                            />
                            {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                            {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {editingUser ? 'Password Baru (Opsional)' : 'Password'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={editingUser ? 'Biarkan kosong jika tidak diubah' : '********'}
                                required={!editingUser}
                            />
                            {errors.password && <span className="text-sm text-red-500">{errors.password}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="********"
                                required={!editingUser || data.password.length > 0}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!userToDelete} onOpenChange={(open: boolean) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. User <strong>{userToDelete?.name}</strong> akan dihapus secara permanen dari sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
