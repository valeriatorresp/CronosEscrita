import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Sparkles, AlertCircle, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { googleSignIn, emailSignIn } from '../services/auth';
import type { AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser, accessToken: string | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { user, accessToken } = await googleSignIn();
      onSuccess(user, accessToken);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar com o Google.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor, informe seu e-mail e senha.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      const user = await emailSignIn(email, password);
      onSuccess(user, null);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar login.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0717]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#160b24] rounded-3xl shadow-2xl border border-[#ebdff2] dark:border-[#2d1b42] overflow-hidden transition-colors duration-300">
        {/* Header Decor */}
        <div className="bg-[#1b0e2e] dark:bg-[#140922] border-b border-[#3b235c]/70 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Voltar / Fechar (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
            <X className="w-3.5 h-3.5 opacity-70" />
          </button>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2dd4bf] font-bold mb-1">
            <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
            <span>Acesso ao CronosEscrita</span>
          </div>
          <h2 className="font-serif-display text-2xl font-bold">Identifique sua Jornada</h2>
          <p className="text-white/80 text-xs mt-1">
            Mantenha suas metas, livros e sessões sincronizados com segurança.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1a0e2a]">
          <button
            onClick={() => {
              setMode('google');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              mode === 'google'
                ? 'text-[#220d3a] dark:text-[#f7f2fc] border-b-2 border-[#6c2eb9] bg-white dark:bg-[#160b24]'
                : 'text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-[#f7f2fc]'
            }`}
          >
            Vincular Conta Google
          </button>
          <button
            onClick={() => {
              setMode('email');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              mode === 'email'
                ? 'text-[#220d3a] dark:text-[#f7f2fc] border-b-2 border-[#6c2eb9] bg-white dark:bg-[#160b24]'
                : 'text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-[#f7f2fc]'
            }`}
          >
            E-mail e Senha
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#faeef5] dark:bg-[#2b1424] border border-[#f5d7e6] dark:border-[#3d192f] text-[#b83280] dark:text-[#f472b6] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#b83280] dark:text-[#f472b6]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'google' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed">
                Vincule sua conta Google para sincronizar suas sessões de escrita diretamente com o
                seu <strong>Google Calendar</strong> e nunca perder o ritmo!
              </p>

              {/* Official Google Sign-in Styled Button as per guidelines */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#ebdff2] dark:border-[#2d1b42] rounded-xl bg-white dark:bg-[#160b24] hover:bg-[#faf7fd] dark:hover:bg-[#1f1033] shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
                <span className="font-semibold text-sm text-[#220d3a] dark:text-[#f7f2fc]">
                  {loading ? 'Conectando ao Google...' : 'Continuar com o Google'}
                </span>
              </button>

              <div className="flex items-center gap-2 justify-center text-[11px] text-[#5c4672]/70 dark:text-[#c4b3d8]/70 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf]" />
                <span>Permissão para eventos no Google Calendar</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8870a0] dark:text-[#9782ad] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] text-sm focus:outline-hidden focus:border-[#823bd8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8870a0] dark:text-[#9782ad] absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] text-sm focus:outline-hidden focus:border-[#823bd8]"
                  />
                </div>
                <p className="text-[11px] text-[#5c4672]/70 dark:text-[#c4b3d8]/70 mt-1">
                  Se for seu primeiro acesso, sua conta será criada automaticamente com esta senha.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <span>{loading ? 'Entrando...' : 'Entrar com E-mail'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
