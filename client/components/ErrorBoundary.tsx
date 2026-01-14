import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center text-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <h3 className="font-bold text-destructive">Algo deu errado neste componente.</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {this.state.error?.message || "Erro desconhecido"}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
