import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Recycle, BookOpen, Shield, AlertTriangle, Landmark, Users, Package, MapPin, Search, ChevronRight, Battery, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Guia() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative bg-primary/5 border-b border-primary/10 py-16 md:py-24 mb-12">
        <div className="container px-4 md:px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Guia de Reciclagem <span className="text-primary">Inteligente</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tudo o que você precisa saber para descartar seus eletrônicos com segurança, responsabilidade e impacto positivo.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 grid md:grid-cols-[1fr_300px] gap-12">
        {/* Main Content */}
        <div className="space-y-16">

          {/* Section 1: O que é */}
          <section id="o-que-e" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">1</div>
              <h2 className="text-3xl font-bold tracking-tight">O que é E-lixo?</h2>
            </div>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Resíduos de Equipamentos Eletroeletrônicos (REEE), ou simplesmente e-lixo, englobam qualquer dispositivo alimentado por energia elétrica que chegou ao fim de sua vida útil.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader className="pb-2">
                  <Smartphone className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Pequenos</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Celulares, câmeras, tablets e carregadores.
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader className="pb-2">
                  <Monitor className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Informática</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Notebooks, monitores, impressoras e periféricos.
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader className="pb-2">
                  <Battery className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Pilhas</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Pilhas comuns, alcalinas e baterias portáteis.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2: Por que Reciclar */}
          <section id="por-que-reciclar" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">2</div>
              <h2 className="text-3xl font-bold tracking-tight">Por que Reciclar?</h2>
            </div>
            <Card className="glass-card border-l-4 border-l-primary">
              <CardContent className="pt-6 grid gap-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Proteção Ambiental</h3>
                    <p className="text-muted-foreground">Evita que metais pesados (chumbo, mercúrio) contaminem o solo e a água.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full h-fit">
                    <Recycle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Economia Circular</h3>
                    <p className="text-muted-foreground">Recupera ouro, prata e cobre, reduzindo a necessidade de mineração predatória.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Segurança */}
          <section id="seguranca" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">3</div>
              <h2 className="text-3xl font-bold tracking-tight">Segurança de Dados</h2>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-destructive mt-1" />
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-destructive">Antes de descartar, proteja-se!</h3>
                  <p className="text-muted-foreground">
                    Seus dispositivos contêm fotos, senhas e documentos. A formatação simples nem sempre é suficiente.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm font-medium">
                      <ChevronRight className="h-4 w-4 text-destructive" /> Faça backup de tudo na nuvem ou HD externo.
                    </li>
                    <li className="flex items-center gap-2 text-sm font-medium">
                      <ChevronRight className="h-4 w-4 text-destructive" /> Use a "Restauração de Fábrica" em celulares.
                    </li>
                    <li className="flex items-center gap-2 text-sm font-medium">
                      <ChevronRight className="h-4 w-4 text-destructive" /> Para computadores, use softwares de "Wipe" (sobrescrita).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Ciclo */}
          <section id="ciclo" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">4</div>
              <h2 className="text-3xl font-bold tracking-tight">O Ciclo da Reciclagem</h2>
            </div>
            <div className="relative border-l-2 border-muted ml-5 space-y-8 pb-4">
              <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                <h4 className="font-bold text-lg">1. Coleta</h4>
                <p className="text-muted-foreground text-sm">Entrega em pontos voluntários ou agendamento.</p>
              </div>
              <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                <h4 className="font-bold text-lg">2. Triagem</h4>
                <p className="text-muted-foreground text-sm">Separação por tipo (monitores, cabos, placas).</p>
              </div>
              <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                <h4 className="font-bold text-lg">3. Manufatura Reversa</h4>
                <p className="text-muted-foreground text-sm">Desmontagem e separação de materiais (plástico, vidro, metais).</p>
              </div>
              <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                <h4 className="font-bold text-lg">4. Reintegração</h4>
                <p className="text-muted-foreground text-sm">Matéria-prima volta para a indústria criar novos produtos.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger>Onde posso descartar?</AccordionTrigger>
                <AccordionContent>
                  Use nosso mapa para encontrar pontos de coleta certificados ou agende uma retirada se disponível na sua região.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>É gratuito?</AccordionTrigger>
                <AccordionContent>
                  Sim! O descarte em pontos de coleta é gratuito. Algumas empresas podem cobrar taxas de transporte para grandes volumes retirados em domicílio.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Lâmpadas são e-lixo?</AccordionTrigger>
                <AccordionContent>
                  Sim, mas requerem cuidados especiais por conter mercúrio. Devem ser entregues em pontos específicos para lâmpadas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

        </div>

        {/* Sidebar Navigation (Sticky) */}
        <div className="hidden md:block">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Neste Guia</h3>
              <nav className="space-y-2 text-sm">
                <button onClick={() => scrollToSection('o-que-e')} className="block text-muted-foreground hover:text-primary transition-colors text-left w-full">O que é E-lixo?</button>
                <button onClick={() => scrollToSection('por-que-reciclar')} className="block text-muted-foreground hover:text-primary transition-colors text-left w-full">Por que Reciclar?</button>
                <button onClick={() => scrollToSection('seguranca')} className="block text-muted-foreground hover:text-primary transition-colors text-left w-full">Segurança de Dados</button>
                <button onClick={() => scrollToSection('ciclo')} className="block text-muted-foreground hover:text-primary transition-colors text-left w-full">O Ciclo da Reciclagem</button>
                <button onClick={() => scrollToSection('faq')} className="block text-muted-foreground hover:text-primary transition-colors text-left w-full">FAQ</button>
              </nav>
            </div>

            <div className="rounded-xl bg-primary/5 p-6 border border-primary/10">
              <h3 className="font-semibold mb-2 text-primary">Pronto para descartar?</h3>
              <p className="text-xs text-muted-foreground mb-4">Encontre o ponto mais próximo agora mesmo.</p>
              <Button asChild className="w-full shadow-lg shadow-primary/20">
                <Link to="/mapa">Ver Mapa</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
