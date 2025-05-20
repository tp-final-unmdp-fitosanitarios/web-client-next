"use client";

import Link from 'next/link';
import { useLoading } from '@/hooks/useLoading';
import { useRouter } from 'next/navigation';

interface NavigationLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function NavigationLink({ href, children, className, onClick }: NavigationLinkProps) {
    const { withLoading } = useLoading();
    const router = useRouter();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        // Ejecutar el onClick personalizado si existe
        if (onClick) {
            onClick();
        }

        // Navegar a la nueva ruta con loading
        await withLoading(
            new Promise((resolve) => {
                setTimeout(() => {
                    router.push(href);
                    resolve(undefined);
                }, 300);
            }),
            "Cargando..."
        );
    };

    return (
        <Link href={href} onClick={handleClick} className={className}>
            {children}
        </Link>
    );
} 