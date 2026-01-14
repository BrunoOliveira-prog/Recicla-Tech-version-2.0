import { useEffect, useRef, useState } from "react";
import L from "@/lib/leaflet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Navigation, Info, Phone, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Ícones personalizados
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface Point {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  type?: string; // Ex: 'battery', 'electronics', 'glass'
}

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Carregar pontos
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/points');
        if (!r.ok) throw new Error('points');
        const data = await r.json();
        setPoints(data);
      } catch { setPoints([]); }
    })();
  }, []);

  // Inicializar Mapa
  useEffect(() => {
    if (mapRef.current && !leafletRef.current) {
      const centerCoords = [-28.65998361878308, -56.006636446551234];

      const map = L.map(mapRef.current, {
        zoomControl: false, // Custom zoom control position
        attributionControl: false
      }).setView(centerCoords, 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletRef.current = map;
      setTimeout(() => map.invalidateSize(), 50);
    }
  }, []);

  // Atualizar Marcadores
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    // Limpar marcadores antigos (exceto tiles)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    points.forEach(p => {
      const marker = L.marker([p.lat, p.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedPoint(p);
        map.flyTo([p.lat, p.lng], 16, { duration: 1.5 });
      });

      marker.addTo(map);
    });

  }, [points]);

  const filteredPoints = points.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col md:flex-row">

      {/* Sidebar Flutuante (Desktop) / Drawer (Mobile) */}
      <div className="absolute top-4 left-4 bottom-4 w-full md:w-[400px] z-[1000] pointer-events-none flex flex-col gap-4">

        {/* Search Card */}
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pontos de coleta..."
              className="pl-9 bg-transparent border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List / Details Card */}
        <div className="flex-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col transition-all duration-300">
          {selectedPoint ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border/50 bg-primary/5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPoint(null)}
                  className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                >
                  ← Voltar para lista
                </Button>
                <h2 className="text-2xl font-bold text-primary">{selectedPoint.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {selectedPoint.address || "Endereço não informado"}
                </p>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" /> Sobre
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedPoint.description || "Este ponto de coleta aceita diversos tipos de resíduos eletrônicos. Entre em contato para mais detalhes."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Horário
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Segunda a Sexta: 08:00 - 18:00<br />
                      Sábado: 08:00 - 12:00
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Contato
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      (55) 3431-0000
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50 bg-muted/20">
                <Button className="w-full shadow-lg shadow-primary/20" size="lg">
                  <Navigation className="mr-2 h-4 w-4" /> Traçar Rota
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold text-muted-foreground">
                  {filteredPoints.length} pontos encontrados
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="divide-y divide-border/50">
                  {filteredPoints.map(point => (
                    <button
                      key={point.id}
                      onClick={() => {
                        setSelectedPoint(point);
                        leafletRef.current?.flyTo([point.lat, point.lng] as [number, number], 16, { duration: 1.5 });
                      }}
                      className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-start gap-3 group"
                    >
                      <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">{point.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{point.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Mapa Container */}
      <div ref={mapRef} className="h-full w-full z-0" />
    </div>
  );
}
