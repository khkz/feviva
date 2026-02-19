import { useParams, Navigate } from 'react-router-dom';
import { useFronteraArticulo } from '@/hooks/useFronteraArticulos';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';
import LoadingScreen from '@/components/shared/LoadingScreen';
import {
  BookOpen, Atom, Infinity as InfinityIcon, HelpCircle,
  Telescope, Flag, Cpu, Scale, Sparkles, AlertTriangle,
  ScrollText, Church, Dna, Globe, Flame, GraduationCap,
  Lightbulb, Award, History, Mountain, Star, Users, Heart,
  Rocket, Leaf, Brain, Fingerprint,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Atom, Infinity: InfinityIcon, HelpCircle,
  Telescope, Flag, Cpu, Scale, Sparkles, AlertTriangle,
  ScrollText, Church, Dna, Globe, Flame, GraduationCap,
  Lightbulb, Award, History, Mountain, Star, Users, Heart,
  Rocket, Leaf, Brain, Fingerprint,
};

export default function FronteraArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const { data: articulo, isLoading } = useFronteraArticulo(articleId || '');

  if (isLoading) return <LoadingScreen />;
  if (!articulo) return <Navigate to="/frontera-final" replace />;

  const icon = iconMap[articulo.icon_name] || Atom;

  const sections = articulo.sections.map((s) => ({
    ...s,
    icon: s.icon_name ? iconMap[s.icon_name] : undefined,
  }));

  return (
    <ArticuloFrontera
      id={articulo.id}
      title={articulo.titulo}
      subtitle={articulo.subtitulo}
      icon={icon}
      color={articulo.color as 'cyan' | 'amber' | 'purple'}
      category={articulo.categoria}
      quotes={articulo.quotes}
      sections={sections}
      videoId={articulo.video_id}
      videoTitle={articulo.video_title}
      reflection={articulo.reflection}
      relatedArticles={articulo.related_articles}
    />
  );
}
