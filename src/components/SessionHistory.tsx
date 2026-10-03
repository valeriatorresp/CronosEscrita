import React, { useState } from 'react';
import { History, BookOpen, Clock, Calendar, Trash2, Edit2, Check, X } from 'lucide-react';
import type { WritingSession, Book, Project } from '../types';

interface SessionHistoryProps {
  sessions: WritingSession[];
  books: Book[];
  projects: Project[];
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession: (session: WritingSession) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  books,
  projects,
  onDeleteSession,
  onUpdateSession,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWords, setEditWords] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [filterBookId, setFilterBookId] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEdit = (s: WritingSession) => {
    setEditingId(s.id);
    setEditWords(s.words);
    setEditNotes(s.notes || '');
  };

  const saveEdit = (session: WritingSession) => {
    onUpdateSession({
      ...session,
      words: editWords,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const filteredSessions = [...sessions]
    .filter((s) => (filterBookId === 'all' ? true : s.bookId === filterBookId))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#f4ecf8] dark:bg-[#26133a] text-[#532380] dark:text-[#c4b3d8]">
              <History className="w-5 h-5" />
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Histórico de Sessões
            </h3>
          </div>
          <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
            Veja suas sessões salvas, edite registros ou filtre por obra literária.
          </p>
        </div>

        {/* Filter by book */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]">Filtrar por Livro:</label>
          <select
            value={filterBookId}
            onChange={(e) => setFilterBookId(e.target.value)}
            className="text-xs font-semibold text-[#220d3a] dark:text-[#f7f2fc] px-3 py-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] focus:outline-hidden focus:border-[#532380]"
          >
            <option value="all" className="dark:bg-[#1c0e2e]">Todos os Livros ({sessions.length})</option>
            {books.map((b) => (
              <option key={b.id} value={b.id} className="dark:bg-[#1c0e2e]">
                {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 bg-[#faf7fd]/60 dark:bg-[#1f0f33]/30 rounded-2xl border border-dashed border-[#ebdff2] dark:border-[#2d1b42]">
            <BookOpen className="w-8 h-8 text-[#532380]/40 dark:text-[#c4b3d8]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#5c4672]/70 dark:text-[#c4b3d8]/70">
              Nenhuma sessão registrada ainda. Adicione sua primeira sessão acima!
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const book = books.find((b) => b.id === session.bookId);
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                className="p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd]/60 dark:bg-[#1c0e2e]/60 hover:border-[#532380]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#532380] dark:text-[#c4b3d8] mb-1">
                        Palavras
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editWords}
                        onChange={(e) => setEditWords(Number(e.target.value))}
                        className="w-full text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc] px-3 py-1.5 rounded-lg border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#532380] dark:text-[#c4b3d8] mb-1">
                        Notas
                      </label>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Observações da sessão..."
                        className="w-full text-sm text-[#220d3a] dark:text-[#f7f2fc] px-3 py-1.5 rounded-lg border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc]">
                        {book ? book.title : 'Livro sem título'}
                      </span>
                      {session.source === 'game' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6] border border-[#f5cbe2] dark:border-[#521c3c]">
                          Prática Criativa
                        </span>
                      )}
                    </div>
                    {session.notes && (
                      <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 italic leading-relaxed">
                        “{session.notes}”
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[#5c4672]/70 dark:text-[#c4b3d8]/70 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#532380] dark:text-[#c4b3d8]" />
                        <span className="tabular-nums">{session.date.split('-').reverse().join('/')}</span>
                      </span>
                      {session.durationMinutes && session.durationMinutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#532380] dark:text-[#c4b3d8]" />
                          <span className="tabular-nums">{session.durationMinutes} minutos</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  {!isEditing && (
                    <div className="text-right">
                      <span className="text-sm font-bold tabular-nums text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#0c2a27] px-3 py-1 rounded-xl border border-[#bbf0eb] dark:border-[#14534f]">
                        +{new Intl.NumberFormat('pt-BR').format(session.words)} pal.
                      </span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => saveEdit(session)}
                        title="Salvar alterações"
                        className="p-2 text-white bg-[#532380] hover:bg-[#6c2ea6] rounded-xl transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        title="Cancelar"
                        className="p-2 text-[#5c4672] dark:text-[#c4b3d8] bg-[#faf7fd] dark:bg-[#1f0f33] hover:bg-white rounded-xl transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(session)}
                        title="Editar sessão"
                        className="p-2 text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-[#f7f2fc] hover:bg-[#faf7fd] dark:hover:bg-[#1f0f33] rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteId === session.id ? (
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-[#b83280] hover:bg-[#992266] rounded-lg transition-colors cursor-pointer"
                        >
                          Confirmar?
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(session.id)}
                          title="Excluir sessão"
                          className="p-2 text-[#5c4672]/60 hover:text-[#b83280] dark:hover:text-[#f472b6] hover:bg-[#fae8f2] dark:hover:bg-[#341628] rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
