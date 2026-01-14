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
  useEffect(() => { fetch('/api/points').then(r => r.json()).then(setPoints).catch(() => setPoints([])); }, []);

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
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-3xl glass p-8 rounded-3xl relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2" />

        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight">Agendar Coleta</h1>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            Preencha os detalhes do seu lixo eletrônico. Nós cuidamos do resto para garantir um destino sustentável.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Coluna Esquerda: Dados Principais */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="font-heading font-bold text-primary">Quando?</Label>
              <div className="flex gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/50 dark:bg-black/20 border-white/20" />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-white/50 dark:bg-black/20 border-white/20" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wasteType" className="font-heading font-bold text-primary">O que será coletado?</Label>
              <Input
                id="wasteType"
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value)}
                placeholder="Ex: Celulares, Baterias, Cabos"
                className="glass-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="font-heading font-bold text-accent">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Itens"
                  min="1"
                  className="glass-input"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight" className="font-heading font-bold text-accent">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  placeholder="Kg"
                  min="0.1"
                  step="0.1"
                  className="glass-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Coluna Direita: Localização e Finalização */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="recyclerAddress" className="font-heading font-bold text-primary">Onde retirar?</Label>
                <Input
                  id="recyclerAddress"
                  value={recyclerAddress}
                  onChange={(e) => setRecyclerAddress(e.target.value)}
                  placeholder="Endereço completo"
                  className="glass-input"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-heading font-bold text-muted-foreground">Observações</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções adicionais (opcional)"
                  className="glass-input"
                />
              </div>
            </div>

            <Button onClick={submit} disabled={loading} size="lg" className="w-full font-heading font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-1">
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
