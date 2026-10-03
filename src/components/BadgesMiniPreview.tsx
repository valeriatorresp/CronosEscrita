import React from 'react';
import {
  Award,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  PenTool,
  Zap,
  BookOpen,
  Compass,
  Flame,
  Trophy,
  Moon,
  Castle,
  Users,
  Feather,
  Clock,
  Bookmark,
  FileText,
  Sun,
  CalendarCheck,
  Heart,
  Crown,
  Coffee,
  Hourglass,
  BookMarked,
  CheckCircle,
} from 'lucide-react';
import type { Badge } from '../types';

interface BadgesMiniPreviewProps {
  badges: Badge[];
  onNavigateToBadges: () => void;
}

export const BadgesMiniPreview: React.FC<BadgesMiniPreviewProps> = ({
  badges,
  onNavigateToBadges,
}) => {
  const unlockedBadges = badges.filter((b) => !!b.unlockedAt);
  const totalBadges = badges.length;

  // Take up to 4 unlocked badges. If fewer than 4 unlocked, pad with first upcoming locked badges to total 4
  const lockedBadges = badges.filter((b) => !b.unlockedAt);
  const firstFourBadges: { badge: Badge; isUnlocked: boolean }[] = [
    ...unlockedBadges.slice(0, 4).map((b) => ({ badge: b, isUnlocked: true })),
    ...lockedBadges.slice(0, Math.max(0, 4 - unlockedBadges.length)).map((b) => ({
      badge: b,
      isUnlocked: false,
    })),
  ].slice(0, 4);

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { className: 'w-5 h-5 stroke-[2.2]' };
    switch (iconName) {
      case 'PenTool':
        return <PenTool {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Trophy':
        return <Trophy {...props} />;
      case 'Moon':
        return <Moon {...props} />;
      case 'Castle':
        return <Castle {...props} />;
      case 'Users':
        return <Users {...props} />;
      case 'Feather':
        return <Feather {...props} />;
      case 'Clock':
        return <Clock {...props} />;
      case 'Bookmark':
        return <Bookmark {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Sun':
        return <Sun {...props} />;
      case 'CalendarCheck':
        return <CalendarCheck {...props} />;
      case 'Heart':
        return <Heart {...props} />;
      case 'Crown':
        return <Crown {...props} />;
      case 'Coffee':
        return <Coffee {...props} />;
      case 'Hourglass':
        return <Hourglass {...props} />;
      case 'BookMarked':
        return <BookMarked {...props} />;
      case 'CheckCircle':
        return <CheckCircle {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-7 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b0e2e] dark:bg-[#140922] border border-[#3b235c]/70 text-[#2dd4bf] flex items-center justify-center shadow-xs">
            <Award className="w-5 h-5 text-[#2dd4bf]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quadro de Honra</span>
              </span>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Conquistas em Destaque
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#f6f0fb] dark:bg-[#1f1033] text-[#5c4672] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42]">
            {unlockedBadges.length} de {totalBadges} conquistadas
          </span>
          <button
            onClick={onNavigateToBadges}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer group"
          >
            <span>Ver Todas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Miniature Badges Row (Exactly 4 items) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-5">
        {firstFourBadges.map(({ badge, isUnlocked }) => (
          <div
            key={badge.id}
            title={`${badge.title}: ${badge.description}`}
            className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col items-center text-center group cursor-pointer ${
              isUnlocked
                ? 'bg-white dark:bg-[#1a0e2a] border-[#ebdff2] dark:border-[#2d1b42] shadow-xs hover:border-[#6c2eb9]'
                : 'bg-[#faf7fd]/60 dark:bg-[#140922]/60 border-dashed border-[#ebdff2] dark:border-[#2d1b42] opacity-70'
            }`}
          >
            {/* Miniature Icon Box */}
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                isUnlocked
                  ? 'text-white shadow-xs'
                  : 'bg-[#f6f0fb] dark:bg-[#1f1033] text-[#8870a0] dark:text-[#9782ad]'
              }`}
              style={isUnlocked ? { backgroundColor: badge.color || '#6c2eb9' } : {}}
            >
              {isUnlocked ? (
                renderBadgeIcon(badge.iconName, true)
              ) : (
                <Lock className="w-4 h-4 text-[#8870a0] dark:text-[#9782ad]" />
              )}
            </div>

            {/* Badge Title */}
            <h5 className="font-bold text-xs mt-2.5 text-[#220d3a] dark:text-[#f7f2fc] line-clamp-1">
              {badge.title}
            </h5>
            {badge.funRankName && (
              <span className="text-[10px] text-[#b83280] dark:text-[#f472b6] font-medium line-clamp-1">
                {badge.funRankName}
              </span>
            )}

            {/* Status */}
            <div className="mt-1 flex items-center gap-1">
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#147d74] dark:text-[#2dd4bf]">
                  <CheckCircle2 className="w-3 h-3 text-[#147d74] dark:text-[#2dd4bf]" />
                  <span>Conquistada</span>
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#8870a0]/70 dark:text-[#9782ad]/70">
                  Bloqueada
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
