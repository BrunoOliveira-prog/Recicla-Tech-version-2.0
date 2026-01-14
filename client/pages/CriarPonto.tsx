import { useEffect, useRef, useState, useCallback } from "react";
import L from "@/lib/leaflet"; // Importa Leaflet com ícones e CSS já configurados
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { MapPin } from "lucide-react";

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

//Estrutura de localização:
interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function CriarPonto() {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const [latlng, setLatlng] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [geocodeTimeout, setGeocodeTimeout] = useState<NodeJS.Timeout | null>(null);

  //Estados do formulário:
  const [nameInput, setNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [typesInput, setTypesInput] = useState('');
  const [hoursInput, setHoursInput] = useState('');

  const [addressToGeocode, setAddressToGeocode] = useState('');

  //Impedir que outro usuário acesse se não for coletor:
  if (!user || user.role !== 'COLETOR') {
    return (
      <div className="flex items-center justify-center h-[60vh">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Esta página é exclusiva para usuários Coletores.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Por favor, faça login com uma conta de Coletor para acessar esta funcionalidade.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  //Função de localizar endereço:
  const geocodeAddress = useCallback(async () => {
    const address = addressInput;

    if (!address) {
      if (markerRef.current) markerRef.current.remove();
      if (tempMarkerRef.current) tempMarkerRef.current.remove();
      setLatlng(null);
      toast.warning('Por favor, insira um endereço para localizar.');
      return;
    }

    const streetAndNeighborhood = address.split(',')[0].trim();
    const query = `${streetAndNeighborhood}, São Borja, RS, Brasil`;

    //Limites de  São Borja:
    const sanBorjaBounds = '-56.12,-28.68,-55.7,-28.62';

    //URL da API para o mapa:
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br&viewbox=${sanBorjaBounds}&bounded=1`;

    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Geocoding fetch failed with status:", response.status, response.statusText);
        throw new Error('Falha na geocodificação.');
      }
      const data: GeocodingResult[] = await response.json();

      console.log('Geocoding results for:', query, 'URL:', url, 'Data:', data);

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        //Verificar se a cidade é São Borja:
        if (display_name.toLowerCase().includes('são borja') && display_name.toLowerCase().includes('rio grande do sul')) {
          setLatlng({ lat: newLat, lng: newLng });

          if (leafletRef.current) {
            if (tempMarkerRef.current) tempMarkerRef.current.remove();
            if (markerRef.current) markerRef.current.remove();

            leafletRef.current.setView([newLat, newLng], 15);

            //Ícone temporário no mapa:
            tempMarkerRef.current = L.marker([newLat, newLng], { icon: customIcon }).addTo(leafletRef.current);
            tempMarkerRef.current.bindPopup(`<b>${display_name}</b><br/><i>Sugestão de localização. Clique no mapa para confirmar.</i>`).openPopup();

            toast.info(`Mapa centralizado em: ${display_name}. Clique no mapa para definir o ponto exato.`);
          }
        } else {
          toast.warning('Endereço encontrado, mas parece estar fora de São Borja. Tente refinar a busca ou clique no mapa.');
          setLatlng(null);
          if (tempMarkerRef.current) tempMarkerRef.current.remove();
          if (markerRef.current) markerRef.current.remove();
        }
      } else {
        toast.warning('Endereço não encontrado em São Borja. Tente refinar a busca ou clique no mapa.');
        setLatlng(null);
        if (tempMarkerRef.current) tempMarkerRef.current.remove();
        if (markerRef.current) markerRef.current.remove();
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error('Erro ao geocodificar o endereço.');
      setLatlng(null);
      if (tempMarkerRef.current) tempMarkerRef.current.remove();
      if (markerRef.current) markerRef.current.remove();
    } finally {
      setLoading(false);
    }
  }, [addressToGeocode]);

  const debouncedGeocode = useCallback((address: string) => {
    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout);
    }
    const timeout = setTimeout(() => {
      if (address) {
        geocodeAddress();
      } else {
        if (geocodeTimeout) clearTimeout(geocodeTimeout);
        if (markerRef.current) markerRef.current.remove();
        if (tempMarkerRef.current) tempMarkerRef.current.remove();
        setLatlng(null);
      }
    }, 500);
    setGeocodeTimeout(timeout);
  }, [geocodeAddress, geocodeTimeout]);

  useEffect(() => {
    if (mapRef.current && !leafletRef.current) {
      const centerCoords: [number, number] = [-28.65998361878308, -56.006636446551234]; //Centro de São Borja.
      const initialZoom = 14;
      const maxMapZoom = 18;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        maxBoundsViscosity: 1.0,
        minZoom: initialZoom - 1,
        maxZoom: maxMapZoom,
      }).setView(centerCoords, initialZoom);

      //Limites do mapa para São Borja:
      const bounds = L.latLngBounds(L.latLng(-28.68, -56.12), L.latLng(-28.62, -55.7));
      map.setMaxBounds(bounds);

      leafletRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      setTimeout(() => map.invalidateSize(), 50);
      window.addEventListener('resize', () => map.invalidateSize());

      //Função para cliques manuais no mapa para selecionar a localização final.
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setLatlng({ lat, lng }); //Coordenadas para serem salvas.
        if (tempMarkerRef.current) tempMarkerRef.current.remove();
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        markerRef.current.bindPopup(`<b>Local selecionado</b><br/>${lat}, ${lng}`).openPopup();
        toast.success('Localização exata definida pelo clique no mapa.');
      });
    }
  }, []);

  //Função para o addressToGeocode mudar após clique no botão de ver localização.
  useEffect(() => {
    if (addressToGeocode) {
      geocodeAddress();
    } else {
      //Limpa tudo se o endereço não estiver preenchido.
      if (markerRef.current) markerRef.current.remove();
      if (tempMarkerRef.current) tempMarkerRef.current.remove();
      setLatlng(null);
    }
  }, [addressToGeocode]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!latlng) { toast("Por favor, defina um local no mapa clicando nele."); return; }

    const payload = {
      name: nameInput,
      description: descriptionInput,
      address: addressInput,
      lat: latlng.lat,
      lng: latlng.lng,
      types: typesInput,
      hours: hoursInput,
    };

    try {
      setLoading(true);
      await apiFetch('/api/points', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Ponto criado!');
      //Limpar todo o formulário depois dele ter concluído:
      setNameInput('');
      setDescriptionInput('');
      setAddressInput('');
      setTypesInput('');
      setHoursInput('');
      setLatlng(null);
      if (markerRef.current) markerRef.current.remove();
      if (tempMarkerRef.current) tempMarkerRef.current.remove();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar ponto');
    } finally { setLoading(false); }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] p-4">
      <div className="w-full max-w-6xl glass p-8 rounded-3xl relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2" />

        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Left Column: Form */}
          <div className="lg:w-1/3 space-y-6 flex flex-col">
            <div className="space-y-2">
              <h1 className="text-3xl font-black font-heading tracking-tight">Novo Ponto</h1>
              <p className="text-muted-foreground font-body">
                Cadastre um novo local de coleta para ajudar a comunidade.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-heading font-bold text-primary">Nome do Local</Label>
                <Input id="name" name="name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required className="glass-input" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="font-heading font-bold text-primary">Endereço</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    name="address"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    required
                    placeholder="Rua, Bairro..."
                    className="glass-input"
                  />
                  <Button
                    type="button"
                    onClick={() => setAddressToGeocode(addressInput)}
                    disabled={loading || !addressInput}
                    size="icon"
                    className="shrink-0"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Clique no ícone para localizar no mapa.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="types" className="font-bold">Tipos Aceitos</Label>
                  <Input id="types" value={typesInput} onChange={(e) => setTypesInput(e.target.value)} placeholder="Ex: Vidro, Papel" className="glass-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours" className="font-bold">Horário</Label>
                  <Input id="hours" value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} placeholder="08h - 18h" className="glass-input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold">Descrição (Opcional)</Label>
                <Textarea id="description" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="glass-input resize-none h-24" />
              </div>

              <Button type="submit" disabled={loading || !latlng} size="lg" className="w-full font-heading font-bold shadow-lg hover:shadow-primary/25 mt-4">
                {loading ? 'Salvando...' : (!latlng ? 'Selecione no Mapa' : 'Confirmar Cadastro')}
              </Button>
            </form>
          </div>

          {/* Right Column: Map */}
          <div className="lg:w-2/3 h-[500px] lg:h-auto rounded-3xl overflow-hidden glass shadow-2xl relative border-4 border-white/10 group">
            <div ref={mapRef} className="h-full w-full z-0 opacity-90 group-hover:opacity-100 transition-opacity" />

            {!latlng && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none z-10 transition-opacity duration-500" style={{ opacity: addressToGeocode ? 0 : 1 }}>
                <div className="text-center text-white p-6 glass rounded-xl">
                  <MapPin className="h-12 w-12 mx-auto mb-2 animate-bounce" />
                  <p className="font-heading font-bold text-lg">Localize o endereço ou clique no mapa</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
