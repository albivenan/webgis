import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <>
            {items.map((item, index) => {
                // If item has children, render as a Group with Label
                if (item.items && item.items.length > 0) {
                    return (
                        <SidebarGroup key={item.title} className="py-2">
                            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                            <SidebarMenu>
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={subItem.href ? page.url.startsWith(resolveUrl(subItem.href)) : false}
                                            tooltip={subItem.title}
                                        >
                                            <Link href={subItem.href || '#'}>
                                                {subItem.icon && <subItem.icon />}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                }

                // If item has no children (e.g. Dashboard), render as standalone item
                // We wrap it in a SidebarGroup to maintain spacing consistency, or just SidebarMenu if it's the first item
                return (
                    <SidebarGroup key={item.title} className="py-0 group-data-[collapsible=icon]:hidden">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.href ? page.url === resolveUrl(item.href) : false}
                                    tooltip={item.title}
                                >
                                    <Link href={item.href || '#'}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
