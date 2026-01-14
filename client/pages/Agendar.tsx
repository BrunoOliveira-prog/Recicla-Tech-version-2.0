import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

//Estrutura de um ponto de coleta:
interface Point {
  id: number;
  name: string
}

//Página de Agendar:
export default function Agendar() {
  const { user } = useAuth();
  const [points, setPoints] = useState<Point[]>([]);
  const [pointId, setPointId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [quantity, setQuantity] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [recyclerAddress, setRecyclerAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  //Carregar os pontos de coleta:
  useEffect(() => { fetch('/api/points').then(r=>r.json()).then(setPoints).catch(()=>setPoints([])); }, []);

  //Função de agendar:
  async function submit() {
    if (!user || user.role !== 'RECICLADOR') { toast('Apenas Recicladores podem agendar.'); return; }
    if (!date || !time) { toast('Informe data e hora'); return; }
    if (!wasteType) { toast('Informe o tipo de lixo eletrônico'); return; }
    if (quantity === '' || quantity <= 0) { toast('Informe uma quantidade válida'); return; }
    if (weight === '' || weight <= 0) { toast('Informe um peso válido'); return; }
    if (!recyclerAddress) { toast('Informe o seu endereço para coleta'); return; }

    try {
      setLoading(true);
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const payload: any = {
        scheduledAt,
        notes,
        wasteType,
        quantity: Number(quantity),
        weight: Number(weight),
        recyclerAddress
      };
      await apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Coleta agendada!');
      //Limpar os campos do formulário:
      setDate(""); 
      setTime(""); 
      setNotes("");
      setWasteType(""); 
      setQuantity(''); 
      setWeight('');
      setRecyclerAddress('');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao agendar');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agendar Coleta</CardTitle>
          <CardDescription>
            Preencha os detalhes sobre o lixo eletrônico e agende a coleta no seu endereço. Requer perfil Reciclador.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Hora</Label>
              <Input type="time" value={time} onChange={(e)=>setTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wasteType">Tipo de Lixo Eletrônico</Label>
              <Input
                id="wasteType"
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value)}
                placeholder="Ex: Celulares, Baterias, Cabos"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Número de itens"
                min="1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Peso Estimado (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                placeholder="Peso em quilogramas"
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recyclerAddress">Seu Endereço para Coleta</Label>
              <Input
                id="recyclerAddress"
                value={recyclerAddress}
                onChange={(e) => setRecyclerAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 123, Bairro Centro"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Opcional" />
            </div>
            <Button onClick={submit} disabled={loading}>{loading ? 'Agendando...' : 'Agendar'}</Button>
          </div>
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Após agendar, o Coletor receberá sua solicitação e poderá confirmar o agendamento.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
