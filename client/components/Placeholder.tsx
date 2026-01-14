import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="aspect-[16/9] w-full rounded-md border bg-muted/40 grid place-items-center text-muted-foreground">
            Em breve conteúdo desta página.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/">Ir para Início</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/conta/entrar">Fazer login</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
