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
    const { showLoader } = useLoading();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        showLoader("Cargando...");
        
        // Ejecutar el onClick personalizado si existe
        if (onClick) {
            onClick();
        }

        // Navegar a la nueva ruta
        router.push(href);
    };

    return (
        <Link href={href} onClick={handleClick} className={className}>
            {children}
        </Link>
    );
} 