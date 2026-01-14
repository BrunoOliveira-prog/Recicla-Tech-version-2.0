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
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>
            {isRecycler ? 'Gerencie os detalhes dos seus agendamentos.' : 'Gerencie as solicitações de coleta.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {items.length === 0 && <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>}
          {items.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).map((b, index) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <div className="space-y-1 w-full lg:w-1/2">
                <p className="font-medium">Agendamento #{index + 1} • {new Date(b.scheduled_at).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Status: <span className="font-semibold">{statusMap[b.status] || b.status}</span></p>
                {b.recycler_address && <p className="text-sm text-muted-foreground">Endereço: {b.recycler_address}</p>}
                <p className="text-sm text-muted-foreground">Tipo: {b.waste_type}</p>
                <p className="text-sm text-muted-foreground">Quantidade: {b.quantity}</p>
                <p className="text-sm text-muted-foreground">Peso Estimado: {b.weight} kg</p>
                {b.collected_weight && <p className="text-sm font-semibold">Peso Coletado: {b.collected_weight} kg</p>}
                <p className="text-sm text-muted-foreground">Observações: {b.notes || 'Nenhuma'}</p>
              </div>
              {isRecycler ? (
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-1/2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditingBooking(b)} disabled={loading || b.status === 'COMPLETED' || b.status === 'CANCELLED'}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => togglePauseBooking(b.id, b.status)} disabled={loading || b.status === 'COMPLETED' || b.status === 'CANCELLED'}>
                    {b.status === 'PAUSED' ? <><PlayCircle className="h-4 w-4 mr-2" /> Reativar</> : <><PauseCircle className="h-4 w-4 mr-2" /> Pausar</>}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteBooking(b.id)} disabled={loading || b.status === 'COMPLETED' || b.status === 'CANCELLED'}>
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {b.status === 'PENDING' && b.collector_id == null && (
                    <Button size="sm" onClick={() => updateStatus(b.id, 'CONFIRMED')}>Assumir</Button>
                  )}
                  <Select
                    value={b.status}
                    onValueChange={(newStatus) => handleStatusChange(b, newStatus)}
                    disabled={loading || b.status === 'COMPLETED' || b.status === 'CANCELLED'}
                  >
                    <SelectTrigger className="w-[180px]">
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
          ))}
        </CardContent>
      </Card>

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