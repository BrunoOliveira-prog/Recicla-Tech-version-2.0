import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

//Rota protegida que precisa de autenticação:
export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Verificando autenticação...</CardTitle>
            <CardDescription>Aguarde um momento enquanto confirmamos suas credenciais.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  //Se não estiver carregando e o usuário for null ele redireciona para login:
  if (!user) {
    return <Navigate to={`/conta/entrar`} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
