import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

//Página da Conta:
export default function Conta() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasGoogle, setHasGoogle] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<any>('/api/me').then(u => { setName(u.name); setEmail(u.email); setHasGoogle(Boolean(u.has_google)); }).catch(() => { });
  }, []);

  async function save() {
    try {
      setLoading(true);
      await apiFetch('/api/me', { method: 'PUT', body: JSON.stringify({ name, email: hasGoogle ? undefined : email, password: hasGoogle ? undefined : (password || undefined) }) });
      toast.success('Dados atualizados!');
      setPassword("");
    } catch (e: any) { toast.error(e?.message || 'Erro ao salvar'); } finally { setLoading(false); }
  }

  async function removeAccount() {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;
    try {
      await apiFetch('/api/me', { method: 'DELETE' });
      toast.success('Conta excluída');
      logout();
    } catch (e: any) { toast.error(e?.message || 'Erro ao excluir conta'); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências.</p>
      </div>

      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Atualize seus dados de cadastro.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/50 border-white/20 focus:bg-white" />
            </div>
            <div className="space-y-2">
              <Label>E-mail {hasGoogle && <span className="text-xs text-muted-foreground">(vinculado ao Google)</span>}</Label>
              <Input disabled={hasGoogle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/50 border-white/20 focus:bg-white disabled:opacity-50" />
            </div>
            <div className="space-y-2">
              <Label>Nova senha {hasGoogle && <span className="text-xs text-muted-foreground">(indisponível para Google)</span>}</Label>
              <Input disabled={hasGoogle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/50 border-white/20 focus:bg-white disabled:opacity-50" placeholder="Deixe em branco para manter a atual" />
            </div>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={save} disabled={loading} className="shadow-md shadow-primary/10">{loading ? 'Salvando...' : 'Salvar Alterações'}</Button>
              <Button variant="outline" onClick={logout} className="bg-white/50 hover:bg-white">Sair</Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-sm">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Tipo de Usuário: {user?.role}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {user?.role === 'COLETOR'
                  ? "Como Coletor, você tem acesso exclusivo para cadastrar novos pontos de coleta e gerenciar os agendamentos de retirada de material."
                  : "Como Reciclador, você pode agendar coletas gratuitas e consultar o mapa de pontos de entrega voluntária."}
              </p>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
              <h3 className="font-semibold text-destructive mb-2">Zona de Perigo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A exclusão da conta é permanente e removerá todos os seus dados e agendamentos.
              </p>
              <Button variant="destructive" onClick={removeAccount} size="sm">Excluir minha conta</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
