import { useEffect, useRef } from 'react';
import L from '@/lib/leaflet';
import 'leaflet/dist/leaflet.css';
import { MaterialDonutChart } from '@/components/charts/MaterialDonutChart';

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

        // Adicionar Marcadores de Pulso (Clusters)
        heatPoints.forEach(point => {
            // Ícone Personalizado com Pulso
            const pulseIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `
                    <div class="relative flex items-center justify-center w-12 h-12">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
                        <div class="relative flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full border border-primary/50 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <div class="w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_#fff]"></div>
                        </div>
                    </div>
                `,
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            });

            L.marker([point.lat, point.lng], { icon: pulseIcon }).addTo(map)
                .bindTooltip(point.name, {
                    permanent: false,
                    direction: 'top',
                    offset: [0, -20],
                    className: 'glass px-3 py-1 rounded-full text-xs font-bold font-heading text-primary border-primary/20'
                });
        });

        mapInstanceRef.current = map;

        // Cleanup
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div className="w-full py-16 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-10 space-y-2">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading tracking-tight">Impacto em Tempo Real</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
                        Acompanhe as zonas de maior atividade de reciclagem na sua cidade.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
                    {/* Mapa Tangível */}
                    <div className="h-[600px] w-full rounded-3xl overflow-hidden glass shadow-2xl relative group">
                        <div ref={mapRef} className="h-full w-full z-0 mix-blend-multiply dark:mix-blend-normal opacity-90" />

                        {/* Noise Texture Overlay for Map */}
                        <div className="absolute inset-0 pointer-events-none bg-noise opacity-10" />
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] border-4 border-white/5 rounded-3xl" />
                    </div>

                    {/* Dashboard Widgets Sidebar */}
                    <div className="space-y-6">
                        {/* Widget 1: Resíduos (Card) */}
                        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 bg-noise w-full h-full pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="text-5xl font-black font-heading text-primary mb-1 tracking-tighter drop-shadow-sm">
                                    {stats ? (stats.estimated_kg >= 1000 ? `${(stats.estimated_kg / 1000).toFixed(1)}T` : `${stats.estimated_kg}kg`) : '...'}
                                </h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-body">Resíduos Coletados</p>
                                <div className="w-full bg-muted/50 h-2 mt-4 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                                        style={{ width: stats ? '75%' : '0%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Widget 2: Pontos Ativos */}
                        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group" style={{ animationDelay: '100ms' }}>
                            <div className="relative z-10">
                                <h3 className="text-5xl font-black font-heading text-accent mb-1 tracking-tighter drop-shadow-sm">
                                    {stats ? `${stats.total_points}+` : '...'}
                                </h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-body">Pontos Ativos</p>
                                <div className="w-full bg-muted/50 h-2 mt-4 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="bg-accent h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                                        style={{ width: stats ? '85%' : '0%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Widget 3: Taxa de Reciclagem (Com Mini-Graph talvez? Manter simples por enquanto) */}
                        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group" style={{ animationDelay: '200ms' }}>
                            <div className="relative z-10">
                                <h3 className="text-5xl font-black font-heading text-blue-500 mb-1 tracking-tighter drop-shadow-sm">89%</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-body">Taxa de Reciclagem</p>
                                <div className="w-full bg-muted/50 h-2 mt-4 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                                        style={{ width: '89%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
