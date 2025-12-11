import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Informasi Desa', href: '/informasi-desa' },
];

export default function InformasiDesa({ desa }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informasi Desa" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold mb-6">Informasi Desa {desa?.nama_desa || 'Sukamaju'}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Kode Desa</label>
                                <p className="text-lg">{desa?.kode_desa || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                                <p className="text-lg">{desa?.kecamatan || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Kabupaten</label>
                                <p className="text-lg">{desa?.kabupaten || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                                <p className="text-lg">{desa?.provinsi || '-'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Luas Wilayah</label>
                                <p className="text-lg">{desa?.luas_wilayah || '0'} km²</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Jumlah Penduduk</label>
                                <p className="text-lg">{desa?.jumlah_penduduk?.toLocaleString() || '0'} jiwa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
