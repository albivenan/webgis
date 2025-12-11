import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface DataListColumn {
    key: string;
    label: string;
    width?: string;
    render?: (value: any, item: any) => React.ReactNode;
}

export interface DataListAction {
    icon?: React.ReactNode;
    label?: string;
    onClick: (item: any, e: React.MouseEvent) => void;
    variant?: 'default' | 'outline' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
}

interface DataListCardProps {
    title: string;
    searchPlaceholder?: string;
    data: any[];
    columns: DataListColumn[];
    onRowClick?: (item: any) => void;
    actions?: DataListAction[];
    emptyMessage?: string;
    height?: string;
    searchableFields?: string[];
}

export default function DataListCard({
    title,
    searchPlaceholder = 'Cari...',
    data,
    columns,
    onRowClick,
    actions,
    emptyMessage = 'Tidak ada data ditemukan',
    height = 'h-[600px]',
    searchableFields,
}: DataListCardProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;

        const lowerQuery = searchQuery.toLowerCase();
        const fieldsToSearch = searchableFields || columns.map(col => col.key);

        return data.filter(item =>
            fieldsToSearch.some(field => {
                const value = item[field];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(lowerQuery);
            })
        );
    }, [data, searchQuery, searchableFields, columns]);

    return (
        <Card className={`${height} flex flex-col`}>
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg">{title}</CardTitle>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
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
                            {columns.map((col) => (
                                <TableHead key={col.key} className={col.width}>
                                    {col.label}
                                </TableHead>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <TableRow
                                    key={item.id || idx}
                                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.key} className={col.width}>
                                            {col.render
                                                ? col.render(item[col.key], item)
                                                : item[col.key]}
                                        </TableCell>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <TableCell>
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                {actions.map((action, idx) => (
                                                    <Button
                                                        key={idx}
                                                        size={action.size || 'sm'}
                                                        variant={action.variant || 'outline'}
                                                        title={action.label}
                                                        onClick={(e) => action.onClick(item, e)}
                                                    >
                                                        {action.icon}
                                                        {action.label && <span className="ml-1">{action.label}</span>}
                                                    </Button>
                                                ))}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
