import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

//Página de Login:
export default function Login() {
  const [googleEnabled, setGoogleEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then((r) => r.json())
      .then((d) => setGoogleEnabled(Boolean(d?.enabled)))
      .catch(() => setGoogleEnabled(false));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const mode = form.get("mode") as string;
    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      setLoading(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form as any)),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Falha na autenticação");
      }
      const data = await res.json();
      if (data?.token) {
        setAuth(data.token, data.user);
      }
      toast.success("Autenticado com sucesso!");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative">
      {/* Background Elements removed to use global gradient */}

      <div className="w-full max-w-md mx-auto z-10">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Bem-vindo de volta</h1>
          <p className="text-muted-foreground text-lg">Acesse sua conta para continuar</p>
        </div>

        <div className="glass rounded-xl p-1 shadow-xl border border-white/20">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-4 md:p-6">
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">Login</h2>
                  <p className="text-sm text-muted-foreground">Entre com seu e-mail e senha</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <input type="hidden" name="mode" value="login" />
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" required autoComplete="email" className="bg-white/50 border-white/20 focus:bg-white transition-colors" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" required autoComplete="current-password" className="bg-white/50 border-white/20 focus:bg-white transition-colors" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full text-lg h-11 shadow-lg shadow-primary/20">
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou continue com</span></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white/50 hover:bg-white"
                  onClick={() => {
                    if (!googleEnabled) {
                      toast("Login com Google não configurado no servidor.");
                      return;
                    }
                    window.location.href = "/api/auth/google";
                  }}
                >
                  <Chrome className="mr-2 h-4 w-4" /> Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="p-4 md:p-6">
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">Cadastro</h2>
                  <p className="text-sm text-muted-foreground">Crie sua conta gratuitamente</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <input type="hidden" name="mode" value="register" />
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" name="name" required autoComplete="name" className="bg-white/50 border-white/20 focus:bg-white" placeholder="Seu nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">E-mail</Label>
                    <Input id="email2" name="email" type="email" required autoComplete="email" className="bg-white/50 border-white/20 focus:bg-white" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Senha</Label>
                    <Input id="password2" name="password" type="password" required autoComplete="new-password" className="bg-white/50 border-white/20 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de usuário</Label>
                    <RadioGroup defaultValue="RECICLADOR" className="grid grid-cols-2 gap-4" name="role">
                      <div className="flex items-center space-x-2 rounded-lg border border-input bg-white/50 p-4 hover:bg-white transition-colors cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="RECICLADOR" id="reciclador" />
                        <Label htmlFor="reciclador" className="cursor-pointer font-medium">Reciclador</Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border border-input bg-white/50 p-4 hover:bg-white transition-colors cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="COLETOR" id="coletor" />
                        <Label htmlFor="coletor" className="cursor-pointer font-medium">Coletor</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full text-lg h-11 shadow-lg shadow-primary/20">
                    {loading ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
