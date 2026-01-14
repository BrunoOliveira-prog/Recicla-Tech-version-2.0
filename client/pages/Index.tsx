import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Recycle, MapPin, CalendarCheck2, PlusCircle, BookOpenText, ArrowRight, Leaf, Globe, BarChart3, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Point } from "./PontosDeColeta";
import { HeatmapSection } from "@/components/HeatmapSection";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Index() {
  const { user } = useAuth();
  const [points, setPoints] = useState<Point[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoadingPoints(true);
      try {
        const data = await apiFetch<Point[]>("/api/points");
        setPoints(data.filter(p => p.is_active));
      } catch (e) {
        setPoints([]);
        toast.error("Erro ao carregar pontos de coleta.");
      } finally {
        setLoadingPoints(false);
      }

      setLoadingStats(true);
      try {
        const data = await apiFetch("/api/stats");
        setStats(data);
      } catch (e) {
        setStats({ total_points: 0, bookings_30d: 0, estimated_kg: 0 });
      } finally {
        setLoadingStats(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-12">
      {/* Hero Section - Corporate/Clean Style */}
      <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Tecnologia para um futuro sustentável
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Gestão Inteligente de <br />
              <span className="text-primary">Resíduos Eletrônicos</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
              Conectamos empresas, recicladores e coletores em uma plataforma unificada.
              Descarte responsável, rastreabilidade total e impacto ambiental mensurável.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                <Link to="/agendar">
                  Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50 transition-all">
                <Link to="/mapa">
                  Explorar Mapa
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px] animate-pulse-glow" />
        </div>
      </section>

      {/* Stats Strip - Minimalist (Restored) */}
      <section className="border-y bg-muted/30">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tighter">
                {stats ? (stats.estimated_kg >= 1000 ? `+${(stats.estimated_kg / 1000).toFixed(1)}t` : `+${stats.estimated_kg}kg`) : '...'}
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Resíduos Processados</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent mb-2">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tighter">
                {stats ? stats.total_points : '...'}
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Pontos de Coleta</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 mb-2">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tighter">
                {stats ? stats.bookings_30d : '...'}
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Coletas este Mês
                {stats && stats.items_30d > 0 && <span className="block text-xs normal-case opacity-70">({stats.items_30d} itens)</span>}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tighter">100%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Certificado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Heatmap Section */}
      <ErrorBoundary>
        <HeatmapSection stats={stats} />
      </ErrorBoundary>

      {/* Features Grid - Modern Cards */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Soluções para todos</h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Nossa plataforma atende a todas as pontas da cadeia de reciclagem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-3xl border bg-background p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <CalendarCheck2 className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Para Recicladores</h3>
              <p className="text-muted-foreground mb-8 flex-grow leading-relaxed">
                Descarte seus eletrônicos sem sair de casa. Agendamento simplificado e garantia de destinação correta.
              </p>
              <Button asChild className="w-full rounded-xl group-hover:bg-primary/90">
                <Link to="/agendar">Agendar Coleta <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-3xl border bg-background p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
                {user?.role === 'COLETOR' ? <PlusCircle className="h-7 w-7" /> : <Globe className="h-7 w-7" />}
              </div>
              <h3 className="text-2xl font-bold mb-3">{user?.role === 'COLETOR' ? 'Para Coletores' : 'Comunidade Global'}</h3>
              <p className="text-muted-foreground mb-8 flex-grow leading-relaxed">
                {user?.role === 'COLETOR'
                  ? "Expanda sua rede. Cadastre pontos, gerencie rotas e aumente o volume de material reciclado."
                  : "Faça parte da mudança. Acompanhe o impacto global e veja como sua ação local transforma o mundo."}
              </p>
              <Button asChild variant={user?.role === 'COLETOR' ? 'default' : 'secondary'} className="w-full rounded-xl">
                <Link to={user?.role === 'COLETOR' ? "/pontos/novo" : "/mapa"}>
                  {user?.role === 'COLETOR' ? 'Gerenciar Pontos' : 'Ver Impacto'}
                </Link>
              </Button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-3xl border bg-background p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-6 text-foreground group-hover:scale-110 transition-transform">
                <BookOpenText className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Conhecimento</h3>
              <p className="text-muted-foreground mb-8 flex-grow leading-relaxed">
                Aprenda o que pode ser reciclado, entenda a legislação e descubra como proteger seus dados antes do descarte.
              </p>
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link to="/guia">Acessar Guia</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
