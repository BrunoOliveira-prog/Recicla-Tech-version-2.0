import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "@/components/mode-toggle";

//Logo do ReciclaTech:
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/favicon.ico" alt="ReciclaTech Logo" className="h-8 w-8" />
      <span className="font-extrabold tracking-tight text-lg">ReciclaTech</span>
    </Link>
  );
}

//Botões e suas rotas:
const navItems = [
  { to: "/", label: "Início" },
  { to: "/mapa", label: "Mapa" },
  { to: "/agendar", label: "Agendar" },
  { to: "/pontos", label: "Pontos de Coleta" },
  { to: "/pontos/novo", label: "Criar Ponto" },
  { to: "/agendamentos", label: "Agendamentos" },
  { to: "/guia", label: "Guia" },
];

function AuthActions() {
  const { user, logout } = useAuth();
  if (!user) {
    return (
      <>
        <Button asChild variant="outline" size="sm">
          <Link to="/conta/entrar" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Entrar
          </Link>
        </Button>
      </>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden md:inline">Olá, {user.name} ({user.role})</span>
      <Button asChild size="sm">
        <Link to="/conta">Minha conta</Link>
      </Button>
      <Button size="sm" variant="outline" onClick={logout}>Sair</Button>
    </div>
  );
}

//Cabeçalho da página:
export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth(); // Obter o usuário aqui

  //Botões das páginas no cabeçalho:
  const filteredNavItems = navItems.filter(item => {
    //Ocultar criar ponto de coleta pra um usuário reciclador:
    if (item.to === "/pontos/novo" && user?.role !== 'COLETOR') {
      return false;
    }
    //Ocultar agendar ponto de coleta pra um usuário coletor:
    if (item.to === "/agendar" && user?.role !== 'RECICLADOR') {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full glass border-b border-white/20">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => setOpen(!open)} aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105",
                    isActive && "bg-secondary text-secondary-foreground shadow-sm"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <AuthActions />
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t glass animate-accordion-down">
            <div className="container px-4 py-2 grid gap-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-secondary text-secondary-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-auto border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Logo" className="h-5 w-5 opacity-70" />
              <span className="font-semibold">ReciclaTech</span>
            </div>
            <p className="text-xs">
              © {new Date().getFullYear()} Todos os direitos reservados.
            </p>
          </div>
          <p className="text-center md:text-right max-w-md">
            Promovendo a reciclagem responsável de lixo eletrônico no Brasil através da tecnologia e inovação.
          </p>
        </div>
      </footer>
    </div>
  );
}
