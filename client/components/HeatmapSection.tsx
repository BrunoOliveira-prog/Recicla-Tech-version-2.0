import { useEffect, useRef } from 'react';
import L from '@/lib/leaflet';
import 'leaflet/dist/leaflet.css';

// Dados simulados de "calor" (densidade de coletas)
const heatPoints = [
    { lat: -28.659983, lng: -56.006636, intensity: 0.8, name: "Centro" }, // Centro
    { lat: -28.665, lng: -56.01, intensity: 0.6, name: "Zona Sul" },
    { lat: -28.655, lng: -56.00, intensity: 0.5, name: "Zona Norte" },
    { lat: -28.662, lng: -55.995, intensity: 0.7, name: "Zona Leste" },
    { lat: -28.658, lng: -56.02, intensity: 0.4, name: "Zona Oeste" },
];

export function HeatmapSection({ stats }: { stats: any }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Inicializar o mapa
        const map = L.map(mapRef.current, {
            center: [-28.659983, -56.006636],
            zoom: 14,
            zoomControl: false,
            scrollWheelZoom: false,
            dragging: false,
            doubleClickZoom: false,
            attributionControl: false
        });

        // Adicionar TileLayer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Adicionar Círculos de Calor
        heatPoints.forEach(point => {
            // Círculo principal
            L.circleMarker([point.lat, point.lng], {
                radius: 40 * point.intensity,
                fillColor: '#10b981',
                fillOpacity: point.intensity * 0.6,
                color: 'transparent',
                weight: 0
            }).addTo(map).bindTooltip(point.name, {
                permanent: true,
                direction: 'top',
                offset: [0, -10],
                className: 'custom-tooltip font-bold text-xs bg-white/90 px-2 py-1 rounded shadow text-emerald-800 border-none'
            });

            // Brilho central
            L.circleMarker([point.lat, point.lng], {
                radius: 15 * point.intensity,
                fillColor: '#34d399',
                fillOpacity: 0.8,
                color: 'transparent',
                weight: 0
            }).addTo(map);
        });

        mapInstanceRef.current = map;

        // Cleanup
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div className="w-full py-16 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-10 space-y-2">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Impacto em Tempo Real</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Acompanhe as zonas de maior atividade de reciclagem na sua cidade.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
                    {/* Mapa */}
                    <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 relative group">
                        <div ref={mapRef} className="h-full w-full z-0" />

                        {/* Overlay Glassmorphism */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    </div>

                    {/* Stats Cards - Floating Sidebar */}
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl hover:transform hover:scale-105 transition-all duration-300">
                            <h3 className="text-4xl font-extrabold text-primary mb-1">
                                {stats ? (stats.estimated_kg >= 1000 ? `${(stats.estimated_kg / 1000).toFixed(1)}T` : `${stats.estimated_kg}kg`) : '...'}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resíduos Coletados</p>
                            <div className="w-full bg-muted h-1.5 mt-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: stats ? '75%' : '0%' }}
                                />
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl hover:transform hover:scale-105 transition-all duration-300 delay-100">
                            <h3 className="text-4xl font-extrabold text-accent mb-1">
                                {stats ? `${stats.total_points}+` : '...'}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pontos Ativos</p>
                            <div className="w-full bg-muted h-1.5 mt-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-accent h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: stats ? '85%' : '0%' }}
                                />
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl hover:transform hover:scale-105 transition-all duration-300 delay-200">
                            <h3 className="text-4xl font-extrabold text-blue-500 mb-1">89%</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Taxa de Reciclagem</p>
                            <div className="w-full bg-muted h-1.5 mt-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: '89%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
