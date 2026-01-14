import { useEffect, useState, useCallback } from "react";
import L from "@/lib/leaflet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Pencil, Trash2, PlusCircle, PauseCircle, PlayCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

//Estrutura de um ponto de coleta:
export interface Point {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  types: string | null;
  hours: string | null;
  is_active: boolean; // Adicionado is_active
}

//Página de ponto de coleta:
export default function PontosDeColeta() {
  const { user } = useAuth();
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);

  const isCollector = user?.role === 'COLETOR';

  //Função de carregar todos os pontos de coleta:
  async function loadPoints() {
    try {
      const data = await apiFetch<Point[]>("/api/points");
      setPoints(data);
    } catch (e) {
      setPoints([]);
      toast.error("Erro ao carregar pontos de coleta.");
    }
  }

  useEffect(() => {
    loadPoints();
  }, [user, loading]);

  //Função de deletar um ponto de coleta:
  async function deletePoint(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este ponto de coleta?")) return;
    try {
      setLoading(true);
      await apiFetch(`/api/points/${id}`, { method: 'DELETE' });
      toast.success('Ponto de coleta excluído');
      loadPoints();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao excluir ponto de coleta');
    } finally {
      setLoading(false);
    }
  }

  //Função de ativar e desativar um ponto de coleta:
  async function toggleActivePoint(id: number, isActive: boolean) {
    try {
      setLoading(true);
      await apiFetch(`/api/points/${id}/toggle-active`, { method: 'PUT' });
      toast.success(`Ponto de coleta ${isActive ? 'desativado' : 'ativado'} com sucesso.`);
      console.log('Calling loadPoints after toggle success...');
      loadPoints();
      console.log('loadPoints called.');
    } catch (e: any) {
      console.error('Error during toggleActivePoint:', e);
      toast.error(e?.message || `Erro ao ${isActive ? 'desativar' : 'ativar'} o ponto.`);
    } finally {
      setLoading(false);
    }
  }

  //Função de atualizar um ponto de coleta:
  async function updatePoint() {
    if (!editingPoint) return;
    try {
      setLoading(true);
      const payload = {
        name: editingPoint.name,
        description: editingPoint.description,
        address: editingPoint.address,
        lat: editingPoint.lat,
        lng: editingPoint.lng,
        types: editingPoint.types,
        hours: editingPoint.hours,
      };
      await apiFetch(`/api/points/${editingPoint.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success('Ponto de coleta atualizado');
      loadPoints();
      setEditingPoint(null);
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar ponto de coleta');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pontos de Coleta</CardTitle>
          <CardDescription>
            {isCollector
              ? 'Gerencie os pontos de coleta que você cadastrou.'
              : 'Veja os pontos de coleta disponíveis para reciclagem.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {points.length === 0 && <p className="text-muted-foreground">Nenhum ponto de coleta encontrado.</p>}
          {points.map((p, index) => (
            <div key={p.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 ${!p.is_active ? 'opacity-50 grayscale' : ''}`}>
              <div className="space-y-1">
                <p className="font-medium">{p.name} {p.is_active ? '' : '(Inativo)'}</p>
                <p className="text-sm text-muted-foreground">{p.address || 'Endereço não especificado'}</p>
                <p className="text-sm text-muted-foreground">Tipos: {p.types || 'Não especificado'}</p>
                <p className="text-sm text-muted-foreground">Horário: {p.hours || 'Não especificado'}</p>
                {p.description && <p className="text-sm text-muted-foreground">Descrição: {p.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/mapa?lat=${p.lat}&lng=${p.lng}`)}>
                  <MapPin className="h-4 w-4 mr-2" /> Ver no Mapa
                </Button>
                {isCollector && p.owner_id === user?.id && (
                  <>
                    {/* Modal de Edição */}
                    <Dialog open={editingPoint?.id === p.id} onOpenChange={(isOpen) => !isOpen && setEditingPoint(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingPoint(p)} disabled={loading}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Ponto de Coleta</DialogTitle>
                          <DialogDescription>Faça as alterações desejadas e clique em Salvar.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input id="edit-name" value={editingPoint?.name || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, name: e.target.value } : prev)} required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Textarea id="edit-description" value={editingPoint?.description || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, description: e.target.value } : prev)} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-address">Endereço</Label>
                            <Input id="edit-address" value={editingPoint?.address || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, address: e.target.value } : prev)} required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-types">Tipos aceitos</Label>
                            <Input id="edit-types" value={editingPoint?.types || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, types: e.target.value } : prev)} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-hours">Horário</Label>
                            <Input id="edit-hours" value={editingPoint?.hours || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, hours: e.target.value } : prev)} />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogClose>
                          <Button onClick={updatePoint} disabled={loading}>Salvar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Botão Pausar e Ativar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActivePoint(p.id, p.is_active)} //Passa o ID e o status atual.
                      disabled={loading}
                    >
                      {p.is_active ? (
                        <>
                          <PauseCircle className="h-4 w-4 mr-2" /> Pausar
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" /> Ativar
                        </>
                      )}
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => deletePoint(p.id)} disabled={loading}>
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        {isCollector && (
          <CardFooter className="justify-end">
            <Button asChild>
              <Link to="/pontos/novo">
                <PlusCircle className="h-4 w-4 mr-2" /> Cadastrar Novo Ponto
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
