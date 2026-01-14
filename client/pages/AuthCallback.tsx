import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

//Página de Callback da Autenticação:
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (token) setAuth(token);
    navigate('/');
  }, [params, setAuth, navigate]);

  return null;
}
