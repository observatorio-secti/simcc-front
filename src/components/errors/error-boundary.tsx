import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro não tratado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="p-4 mb-4 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Ocorreu um erro ao carregar esta seção
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
            Não se preocupe, a navegação do sistema continua ativa. Você pode tentar recarregar a visualização abaixo.
          </p>
          <Button onClick={this.handleReset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
