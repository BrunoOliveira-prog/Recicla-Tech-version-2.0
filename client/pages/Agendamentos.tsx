import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Pencil, Trash2, PauseCircle, PlayCircle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

//Estrutura de um agendamento:
interface Booking {
  id: number;
  status: string;
  scheduled_at: string;
  notes: string | null;
  collector_id: number | null;
  user_id: number;
  point_id: number | null;
  waste_type: string;
  quantity: number;
  weight: number;
  recycler_address: string | null;
  collected_weight: number | null;
}

//Estrutura dos status:
const statusMap: { [key: string]: string } = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  PAUSED: 'Pausado',
};

//Página de Agendamentos:
export default function Agendamentos() {
  const { user } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingToComplete, setBookingToComplete] = useState<Booking | null>(null);
  const [collectedWeightInput, setCollectedWeightInput] = useState<string>('');

  const isRecycler = user?.role === 'RECICLADOR';

  //Função de carregar todos os agendamentos:
  async function load() {
    try {
      const data = await apiFetch<Booking[]>("/api/bookings");
      setItems(data);
    } catch (e) { setItems([]); }
  }

  useEffect(() => { load(); }, []);

  //Função de atualizar o status de um agendamento:
  async function updateStatus(id: number, status: string) {
    try {
      setLoading(true);
      await apiFetch(`/api/bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success('Status atualizado');
      load();
    } catch (e: any) { toast.error(e?.message || 'Erro ao atualizar'); } finally { setLoading(false); }
  }

  //Função de concluir um agendamento:
  async function completeBooking() {
    if (!bookingToComplete) return;

    const weight = parseFloat(collectedWeightInput);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Por favor, insira um peso válido.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        status: 'COMPLETED',
        collected_weight: weight,
      };
      await apiFetch(`/api/bookings/${bookingToComplete.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success('Agendamento concluído com sucesso!');
      load();
      setBookingToComplete(null);
      setCollectedWeightInput('');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao concluir agendamento');
    } finally {
      setLoading(false);
    }
  }

  //Função de atualizar um agendamento:
  async function updateBooking() {
    if (!editingBooking) return;
    try {
      setLoading(true);
      const payload = {
        scheduledAt: new Date(editingBooking.scheduled_at).toISOString(),
        notes: editingBooking.notes,
        wasteType: editingBooking.waste_type,
        quantity: editingBooking.quantity,
        weight: editingBooking.weight,
        recyclerAddress: editingBooking.recycler_address,
      };
      await apiFetch(`/api/bookings/${editingBooking.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success('Agendamento atualizado');
      load();
      setEditingBooking(null);
    } catch (e: any) { toast.error(e?.message || 'Erro ao atualizar'); } finally { setLoading(false); }
  }

  //Função de deletar um agendamento:
  async function deleteBooking(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
    try {
      setLoading(true);
      await apiFetch(`/api/bookings/${id}`, { method: 'DELETE' });
      toast.success('Agendamento excluído');
      load();
    } catch (e: any) { toast.error(e?.message || 'Erro ao excluir'); } finally { setLoading(false); }
  }

  //Função de ativar e desativar um agendamento:
  async function togglePauseBooking(id: number, currentStatus: string) {
    const newStatus = currentStatus === 'PAUSED' ? 'PENDING' : 'PAUSED';
    updateStatus(id, newStatus);
  }

  //Função de atualizar a mudança de status:
  const handleStatusChange = (booking: Booking, newStatus: string) => {
    if (user?.role === 'COLETOR' && newStatus === 'COMPLETED') {
      setBookingToComplete(booking);
    } else {
      updateStatus(booking.id, newStatus);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-heading tracking-tight text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground font-body text-lg">
            {isRecycler
              ? 'Acompanhe o status das suas coletas agendadas.'
              : 'Gerencie o fluxo de coletas e atualize o status dos pedidos.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <span className="text-6xl mb-4 block">📅</span>
            <p className="text-xl font-heading text-muted-foreground">Nenhum agendamento encontrado.</p>
          </div>
        )}

        {items.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()).map((b, index) => (
          <div
            key={b.id}
            className="glass-card p-6 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl border-white/10 flex flex-col lg:flex-row gap-6 items-start lg:items-center"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Decorative Left Border */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${b.status === 'COMPLETED' ? 'bg-emerald-500' :
                b.status === 'CONFIRMED' ? 'bg-blue-500' :
                  b.status === 'PENDING' ? 'bg-amber-500' :
                    b.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'
              }`} />

            {/* Date Badge */}
            <div className="text-center min-w-[100px] p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="block text-3xl font-black font-heading text-primary">
                {new Date(b.scheduled_at).getDate()}
              </span>
              <span className="block text-xs uppercase tracking-wider font-bold text-muted-foreground">
                {new Date(b.scheduled_at).toLocaleString('default', { month: 'short' }).toUpperCase()}
              </span>
              <span className="block text-sm font-medium mt-1 text-foreground/80">
                {new Date(b.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Info Content */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${b.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                    b.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                      b.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                        b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                  }`}>
                  {statusMap[b.status] || b.status}
                </span>
                <h3 className="font-heading font-bold text-xl text-foreground">
                  {b.waste_type} <span className="text-muted-foreground font-body font-normal text-base">({b.quantity} itens)</span>
                </h3>
              </div>

              <p className="text-muted-foreground font-body flex items-center gap-2">
                <span className="font-bold text-foreground/60">Peso Est.:</span> {b.weight}kg
                {b.collected_weight && <span className="ml-2 font-bold text-emerald-500">✅ Coletado: {b.collected_weight}kg</span>}
              </p>

              {b.recycler_address && (
                <p className="text-sm text-muted-foreground/80 italic font-body max-w-2xl">
                  📍 {b.recycler_address}
                </p>
              )}
              {b.notes && (
                <p className="text-sm text-muted-foreground/60 font-body max-w-2xl border-l-2 border-white/10 pl-2">
                  "{b.notes}"
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0">
              {isRecycler ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditingBooking(b)} disabled={loading || b.status === 'COMPLETED' || b.status === 'CANCELLED'} className="hover:bg-white/10">
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => togglePauseBooking(b.id, b.status)} disabled={loading || b.status === 'COMPLETED' || b.status === 'CANCELLED'} className="hover:bg-white/10">
                    {b.status === 'PAUSED' ? <><PlayCircle className="h-4 w-4 mr-2" /> Reativar</> : <><PauseCircle className="h-4 w-4 mr-2" /> Pausar</>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteBooking(b.id)} disabled={loading || b.status === 'COMPLETED' || b.status === 'CANCELLED'} className="text-red-500 hover:bg-red-500/10 hover:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 min-w-[180px]">
                  {b.status === 'PENDING' && b.collector_id == null && (
                    <Button size="sm" onClick={() => updateStatus(b.id, 'CONFIRMED')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      Assumir Coleta
                    </Button>
                  )}
                  <Select
                    value={b.status}
                    onValueChange={(newStatus) => handleStatusChange(b, newStatus)}
                    disabled={loading || b.status === 'CANCELLED'}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'PAUSED'].map(s => (
                        <SelectItem key={s} value={s}>{statusMap[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editar agendamento para o usuário Reciclador */}
      <Dialog open={!!editingBooking} onOpenChange={(isOpen) => !isOpen && setEditingBooking(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingBooking && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Data</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingBooking.scheduled_at.split('T')[0]}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const time = editingBooking.scheduled_at.split('T')[1]?.substring(0, 5) || '00:00';
                      setEditingBooking({ ...editingBooking, scheduled_at: `${newDate}T${time}:00.000Z` });
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-time">Hora</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingBooking.scheduled_at.split('T')[1]?.substring(0, 5)}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      const date = editingBooking.scheduled_at.split('T')[0];
                      setEditingBooking({ ...editingBooking, scheduled_at: `${date}T${newTime}:00.000Z` });
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-wasteType">Tipo de Lixo Eletrônico</Label>
                  <Input
                    id="edit-wasteType"
                    value={editingBooking.waste_type}
                    onChange={(e) => setEditingBooking({ ...editingBooking, waste_type: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">Quantidade</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingBooking.quantity}
                    onChange={(e) => setEditingBooking({ ...editingBooking, quantity: Number(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-weight">Peso Estimado (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    value={editingBooking.weight}
                    onChange={(e) => setEditingBooking({ ...editingBooking, weight: Number(e.target.value) })}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">Seu Endereço para Coleta</Label>
                  <Input
                    id="edit-address"
                    value={editingBooking.recycler_address || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, recycler_address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingBooking.notes || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBooking(null)}>Cancelar</Button>
            <Button onClick={updateBooking} disabled={loading}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registrar peso coletado para o usuário Coletor */}
      <Dialog open={!!bookingToComplete} onOpenChange={(isOpen) => !isOpen && setBookingToComplete(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Concluir Agendamento</DialogTitle>
            <DialogDescription>
              Para concluir a coleta, por favor, insira o peso total coletado em quilogramas (kg).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collected-weight">Peso Coletado (kg)</Label>
              <Input
                id="collected-weight"
                type="number"
                value={collectedWeightInput}
                onChange={(e) => setCollectedWeightInput(e.target.value)}
                placeholder="Ex: 5.5"
                min="0.1"
                step="0.1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingToComplete(null)}>Cancelar</Button>
            <Button onClick={completeBooking} disabled={loading}>Concluir Coleta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}