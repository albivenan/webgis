import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MapFormLayoutProps {
    title: string;
    description?: string;
    backHref?: string;
    formContent: React.ReactNode;
    mapContent: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
    submitButtonText?: string;
    mapHeight?: string;
}

export default function MapFormLayout({
    title,
    description,
    backHref,
    formContent,
    mapContent,
    onSubmit,
    isLoading = false,
    submitButtonText = 'Simpan',
    mapHeight = 'h-[700px]',
}: MapFormLayoutProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                {backHref && (
                    <Link href={backHref}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {description && <p className="text-muted-foreground">{description}</p>}
                </div>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Informasi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formContent}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" /> {submitButtonText}
                        </Button>
                    </CardContent>
                </Card>

                {/* Map Section */}
                <Card className={`lg:col-span-2 ${mapHeight} flex flex-col overflow-hidden`}>
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-lg">Lokasi</CardTitle>
                    </CardHeader>
                    <div className="flex-1 relative z-0">
                        {mapContent}
                    </div>
                </Card>
            </form>
        </div>
    );
}
