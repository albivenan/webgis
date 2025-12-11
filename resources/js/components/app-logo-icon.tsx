import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Rumah/Desa Icon */}
            <path
                d="M12 2L2 8V22H22V8L12 2Z"
                fill="currentColor"
                opacity="0.8"
            />
            <path
                d="M12 2L2 8V22H22V8L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />
            {/* Pintu */}
            <rect x="10" y="12" width="4" height="6" fill="currentColor" opacity="0.5" />
            {/* Jendela kiri */}
            <rect x="4" y="10" width="3" height="3" fill="currentColor" opacity="0.5" />
            {/* Jendela kanan */}
            <rect x="17" y="10" width="3" height="3" fill="currentColor" opacity="0.5" />
            {/* Atap */}
            <path
                d="M12 2L2 8H22L12 2Z"
                fill="currentColor"
                opacity="0.6"
            />
        </svg>
    );
}
