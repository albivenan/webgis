import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Map, Database, BarChart3, Layers, Compass, Target, Shield, Sun, Moon, ArrowRight } from 'lucide-react';
import { type SharedData } from '@/types';
import { dashboard, login, register } from '@/routes';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const [theme, setTheme] = useState('light'); // Default to light mode

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Definisi tema HANYA menggunakan skala abu-abu, hitam, dan putih.
    const s = {
        // Background & Text Dasar
        bgMain: theme === 'light' ? 'bg-white' : 'bg-[#121212]', // #121212 sedikit lebih lembut dari hitam pekat
        textMain: theme === 'light' ? 'text-gray-900' : 'text-white',
        textMuted: theme === 'light' ? 'text-gray-600' : 'text-gray-400',

        // Header & Footer
        headerBg: theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-[#121212]/80 border-gray-800',
        footerBg: theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-900 border-gray-800',

        // Komponen Kartu & Aksen
        cardBg: theme === 'light' ? 'bg-white border-gray-200 hover:border-gray-400' : 'bg-gray-900 border-gray-800 hover:border-gray-600',
        accentBg: theme === 'light' ? 'bg-gray-100' : 'bg-gray-800', // Untuk background ikon dll

        // Tombol
        btnPrimary: theme === 'light'
            ? 'bg-gray-900 text-white hover:bg-gray-700'
            : 'bg-white text-gray-900 hover:bg-gray-200',
        btnOutline: theme === 'light'
            ? 'border-gray-300 text-gray-900 hover:bg-gray-100'
            : 'border-gray-700 text-white hover:bg-gray-800',
    };

    return (
        <>
            <Head title="WebGIS Desa" />
            <div className={`min-h-screen ${s.bgMain} ${s.textMain} transition-colors duration-300 font-sans selection:bg-gray-300 selection:text-gray-900`}>

                {/* Theme Toggle Button (Fixed Top Right) */}
                <button
                    onClick={toggleTheme}
                    className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 shadow-sm border ${theme === 'light' ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-gray-900 border-gray-700 hover:bg-gray-800'}`}
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <Moon size={20} className="text-gray-700" /> : <Sun size={20} className="text-white" />}
                </button>

                {/* Navigation Header */}
                <header className={`fixed top-0 w-full z-40 border-b backdrop-blur-md ${s.headerBg}`}>
                    <div className="container mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                                <Compass size={24} strokeWidth={1.5} />
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase">WebGIS <span className={s.textMuted}>Desa</span></span>
                        </div>

                        {/* Nav Items */}
                        <nav className="hidden md:flex items-center gap-4">
                            {auth.user ? (
                                <Link href={dashboard()} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${s.btnPrimary}`}>
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-70`}>
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()} className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${s.btnOutline}`}>
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    {/* Hero Section - Menggunakan GRID untuk tata letak */}
                    <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 container mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                            {/* Kolom Teks (Kiri) */}
                            <div className="lg:col-span-7 flex flex-col gap-8">
                                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
                                    Analisis Wilayah <br className="hidden lg:block" />
                                    & Data Spasial.
                                </h1>
                                <p className={`text-lg lg:text-2xl ${s.textMuted} font-medium max-w-2xl leading-relaxed`}>
                                    Platform terpadu untuk visualisasi, analisis, dan pengelolaan data geografis serta kependudukan desa secara presisi.
                                </p>

                                <div className="flex flex-wrap gap-4 mt-4">
                                    <Link
                                        href="/peta-interaktif"
                                        className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold transition-all ${s.btnPrimary}`}
                                    >
                                        <Map size={20} />
                                        Buka Peta Interaktif
                                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        href="/data-kependudukan"
                                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold border transition-all ${s.btnOutline}`}
                                    >
                                        <Database size={20} />
                                        Data Kependudukan
                                    </Link>
                                </div>
                            </div>

                            {/* Kolom Visual Abstrak (Kanan) - Placeholder GIS Estetik */}
                            <div className="lg:col-span-5 hidden lg:block relative">
                                <div className={`aspect-square rounded-[3rem] overflow-hidden border ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-800 bg-gray-900'} relative`}>
                                    {/* Pola Peta Abstrak SVG (Monokrom) */}
                                    <svg className={`absolute inset-0 w-full h-full opacity-50 ${theme === 'light' ? 'text-gray-200' : 'text-gray-800'}`} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                                        <defs>
                                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                            </pattern>
                                            <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                                                 <circle cx="2" cy="2" r="1" fill="currentColor" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                        <circle cx="30%" cy="40%" r="15%" fill="url(#dots)" className={theme === 'light' ? 'text-gray-300' : 'text-gray-700'} />
                                        <path d="M 100 350 Q 250 200 400 300 T 600 250" stroke="currentColor" strokeWidth="2" fill="none" className={theme === 'light' ? 'text-gray-900' : 'text-white'} />
                                        <path d="M 50 400 Q 200 250 350 350 T 550 300" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="5,5" />
                                        <Target size={32} className={`absolute top-1/4 left-1/4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section - Menggunakan Grid 3 Kolom */}
                    <section className={`py-32 px-6 lg:px-12 border-t ${theme === 'light' ? 'border-gray-100' : 'border-gray-800/50'}`}>
                        <div className="container mx-auto">
                            <div className="mb-16 md:w-1/2">
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4">Fitur Utama Sistem.</h2>
                                <p className={`text-lg ${s.textMuted}`}>Didesain untuk efisiensi dan keakuratan data wilayah.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                                {/* Feature 1 */}
                                <div className={`p-8 rounded-3xl border transition-all duration-300 group ${s.cardBg}`}>
                                    <div className={`h-14 w-14 rounded-2xl ${s.accentBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <Layers className="h-7 w-7" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-black mb-4">Layer Peta Interaktif</h3>
                                    <p className={`${s.textMuted} leading-relaxed`}>
                                        Visualisasi multi-layer batas wilayah, penggunaan lahan, dan infrastruktur dalam satu kanvas digital.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div className={`p-8 rounded-3xl border transition-all duration-300 group ${s.cardBg}`}>
                                    <div className={`h-14 w-14 rounded-2xl ${s.accentBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <Database className="h-7 w-7" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-black mb-4">Basis Data Terintegrasi</h3>
                                    <p className={`${s.textMuted} leading-relaxed`}>
                                        Sentralisasi data kependudukan yang terhubung langsung secara spasial dengan lokasi tempat tinggal.
                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div className={`p-8 rounded-3xl border transition-all duration-300 group ${s.cardBg}`}>
                                    <div className={`h-14 w-14 rounded-2xl ${s.accentBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <BarChart3 className="h-7 w-7" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-black mb-4">Statistik Wilayah</h3>
                                    <p className={`${s.textMuted} leading-relaxed`}>
                                        Dashboard ringkasan demografi dan potensi desa yang disajikan dalam visualisasi data yang bersih.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer Minimalis */}
                <footer className={`border-t py-16 ${s.footerBg}`}>
                    <div className="container mx-auto px-6 lg:px-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="flex items-center gap-3">
                                <Compass size={20} strokeWidth={1.5} />
                                <span className="text-lg font-black tracking-tighter uppercase">WebGIS <span className={s.textMuted}>Desa</span></span>
                            </div>
                            <div className={`md:text-right text-sm ${s.textMuted} font-medium`}>
                                <p>&copy; 2025 Pemerintah Desa Somagede.</p>
                                <p className="mt-1">Kecamatan Sempor, Kabupaten Kebumen.</p>
                            </div>
                         </div>
                    </div>
                </footer>
            </div>
        </>
    );
}