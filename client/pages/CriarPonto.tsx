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
      const centerCoords = [-28.65998361878308, -56.006636446551234]; //Centro de São Borja.
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Ponto de Coleta</CardTitle>
          <CardDescription>Insira o endereço, clique em "Localizar no Mapa". Depois, clique no mapa para definir a localização exata.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <form onSubmit={onSubmit} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Ponto</Label>
              <Input id="name" name="name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço (Rua, Bairro)</Label>
              <Input
                id="address"
                name="address"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                required
                placeholder="Ex: Rua das Flores, Centro"
              />
            </div>
            <Button
              type="button"
              onClick={() => setAddressToGeocode(addressInput)} // Dispara a geolocalização
              disabled={loading || !addressInput}
              className="mt-2"
            >
              {loading ? 'Localizando...' : 'Localizar Endereço'}
            </Button>
            <div className="grid gap-2">
              <Label htmlFor="types">Tipos aceitos (ex.: baterias, celulares, cabos)</Label>
              <Input id="types" name="types" value={typesInput} onChange={(e) => setTypesInput(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Horário de funcionamento</Label>
              <Input id="hours" name="hours" value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading || !latlng}>
              {loading ? 'Salvando...' : (!latlng ? 'Clique no mapa para salvar' : 'Salvar Ponto')}
            </Button>
          </form>
          <div className="min-h-[50vh] w-full">
            <div ref={mapRef} className="h-full w-full rounded-md border" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
