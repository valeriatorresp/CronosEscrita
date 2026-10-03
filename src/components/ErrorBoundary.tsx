import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf7fd] dark:bg-[#12071f] flex items-center justify-center p-6 text-slate-800 dark:text-slate-100 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#1a0e2a] rounded-3xl p-8 shadow-2xl border border-[#ebdff2] dark:border-[#2d1b42] text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#faeef5] dark:bg-[#2b1424] flex items-center justify-center text-[#b83280] dark:text-[#f472b6]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="font-serif-display text-2xl font-bold mb-2">Ops! Algo inesperado aconteceu</h1>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mb-6 leading-relaxed">
              Ocorreu um imprevisto na renderização ou sincronização do CronosEscrita. Seus dados salvos localmente estão seguros.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-[#faf7fd] dark:bg-[#12071f] border border-[#ebdff2] dark:border-[#2d1b42] text-left text-[11px] font-mono text-[#b83280] dark:text-[#f472b6] overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-[#6c2eb9] to-[#b83280] text-white font-semibold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Recarregar Aplicativo</span>
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('cronos_current_user_v1');
                  } catch {}
                  window.location.reload();
                }}
                className="py-3 px-4 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#faf7fd] dark:hover:bg-[#1f1033] font-semibold text-xs transition-colors cursor-pointer"
                title="Limpar sessão e reiniciar"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
