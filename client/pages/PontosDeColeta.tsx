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
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-heading tracking-tight text-foreground">Pontos de Coleta</h1>
          <p className="text-muted-foreground font-body text-lg">
            {isCollector
              ? 'Gerencie seus pontos de impacto sustentável.'
              : 'Encontre o local mais próximo para descartar seu lixo eletrônico.'}
          </p>
        </div>

        {isCollector && (
          <Button asChild size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            <Link to="/pontos/novo">
              <PlusCircle className="h-5 w-5 mr-2" /> Cadastrar Novo Ponto
            </Link>
          </Button>
        )}
      </div>

      {points.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <MapPin className="h-20 w-20 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-xl font-heading text-muted-foreground">Nenhum ponto de coleta encontrado.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {points.map((p, index) => (
          <div
            key={p.id}
            className={`glass-card p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-white/10 ${!p.is_active ? 'opacity-75 grayscale-[0.5]' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Status Indicator */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${p.is_active ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />

            <div className="space-y-4 relative z-10">
              <div>
                <h3 className="text-2xl font-bold font-heading text-primary line-clamp-1 group-hover:text-accent transition-colors">{p.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="line-clamp-1">{p.address || 'Endereço não especificado'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-sm">
                  <span className="font-bold text-foreground/80 font-heading text-xs uppercase tracking-wider">Tipos:</span>
                  <span className="text-muted-foreground ml-2">{p.types || 'Diversos'}</span>
                </p>
                <p className="text-sm">
                  <span className="font-bold text-foreground/80 font-heading text-xs uppercase tracking-wider">Horário:</span>
                  <span className="text-muted-foreground ml-2">{p.hours || 'Comercial'}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => navigate(`/mapa?lat=${p.lat}&lng=${p.lng}`)} className="flex-1 bg-white/5 hover:bg-white/10 border-white/10">
                  <MapPin className="h-4 w-4 mr-2 text-primary" /> Mapa
                </Button>

                {isCollector && p.owner_id === user?.id && (
                  <>
                    <Dialog open={editingPoint?.id === p.id} onOpenChange={(isOpen) => !isOpen && setEditingPoint(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingPoint(p)} disabled={loading} className="h-9 w-9 text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] glass border-white/10">
                        <DialogHeader>
                          <DialogTitle className="font-heading">Editar Ponto</DialogTitle>
                          <DialogDescription>Atualize as informações do seu ponto de coleta.</DialogDescription>
                        </DialogHeader>
                        {/* Form inside dialog same as before but cleaner classes */}
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input id="edit-name" value={editingPoint?.name || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, name: e.target.value } : prev)} className="glass-input" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Textarea id="edit-description" value={editingPoint?.description || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, description: e.target.value } : prev)} className="glass-input" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-address">Endereço</Label>
                            <Input id="edit-address" value={editingPoint?.address || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, address: e.target.value } : prev)} className="glass-input" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-types">Tipos aceitos</Label>
                            <Input id="edit-types" value={editingPoint?.types || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, types: e.target.value } : prev)} className="glass-input" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-hours">Horário</Label>
                            <Input id="edit-hours" value={editingPoint?.hours || ''} onChange={(e) => setEditingPoint(prev => prev ? { ...prev, hours: e.target.value } : prev)} className="glass-input" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={updatePoint} disabled={loading}>Salvar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActivePoint(p.id, p.is_active)}
                      disabled={loading}
                      className={p.is_active ? "text-emerald-500 hover:text-emerald-400" : "text-amber-500 hover:text-amber-400"}
                    >
                      {p.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => deletePoint(p.id)} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Background Noise/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
