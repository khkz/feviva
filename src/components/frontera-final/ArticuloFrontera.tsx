import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowLeft, Share2, ExternalLink, Quote, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFronteraProgress } from '@/hooks/useFronteraProgress';

interface ChurchQuote {
  text: string;
  author: string;
  source?: string;
}

interface ArticleSection {
  title: string;
  icon?: LucideIcon;
  content: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  href: string;
}

interface ArticuloFronteraProps {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'cyan' | 'amber' | 'purple';
  category: string;
  quotes: ChurchQuote[];
  sections: ArticleSection[];
  videoId?: string;
  videoTitle?: string;
  reflection: string;
  relatedArticles: RelatedArticle[];
}

export function ArticuloFrontera({
  id,
  title,
  subtitle,
  icon: Icon,
  color,
  category,
  quotes,
  sections,
  videoId,
  videoTitle,
  reflection,
  relatedArticles,
}: ArticuloFronteraProps) {
  const { isArticleRead, markArticleRead } = useFronteraProgress();
  const isRead = isArticleRead(id);
  const colorClasses = {
    cyan: {
      accent: 'text-cyan-400',
      border: 'border-cyan-400/30',
      bg: 'bg-cyan-400/10',
      glow: 'shadow-cyan-400/20',
      gradient: 'from-cyan-950/50 via-slate-950/80 to-slate-950',
    },
    amber: {
      accent: 'text-amber-400',
      border: 'border-amber-400/30',
      bg: 'bg-amber-400/10',
      glow: 'shadow-amber-400/20',
      gradient: 'from-amber-950/50 via-slate-950/80 to-slate-950',
    },
    purple: {
      accent: 'text-purple-400',
      border: 'border-purple-400/30',
      bg: 'bg-purple-400/10',
      glow: 'shadow-purple-400/20',
      gradient: 'from-purple-950/50 via-slate-950/80 to-slate-950',
    },
  };

  const classes = colorClasses[color];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${title} - Frontera Final`,
        text: subtitle,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <Helmet>
        <title>{title} - Frontera Final | El Rugido</title>
        <meta name="description" content={subtitle} />
        <meta property="og:title" content={`${title} - Frontera Final`} />
        <meta property="og:description" content={subtitle} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen cyber-sacra-bg relative overflow-hidden">
        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0 pointer-events-none" />
        
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Header with gradient */}
        <header className={`relative bg-gradient-to-b ${classes.gradient} pt-8 pb-16`}>
          <div className="max-w-4xl mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <Link to="/frontera-final" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Frontera Final
              </Link>
              <span>/</span>
              <span className={classes.accent}>{category}</span>
            </nav>

            {/* Title section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${classes.bg} ${classes.border} border flex items-center justify-center shadow-lg ${classes.glow}`}
              >
                <Icon className={`w-10 h-10 ${classes.accent}`} />
              </motion.div>

              <h1 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
                {title}
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {subtitle}
              </p>

              {/* Share button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="mt-6 border-gray-600 text-gray-300 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 -mt-8">
          {/* Church quotes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12 space-y-6"
          >
            {quotes.map((quote, index) => (
              <blockquote
                key={index}
                className={`glass-cyber rounded-xl p-6 border-l-4 ${classes.border} ${classes.bg}`}
              >
                <div className="flex gap-4">
                  <Quote className={`w-8 h-8 ${classes.accent} flex-shrink-0 opacity-50`} />
                  <div>
                    <p className="text-gray-200 text-lg italic leading-relaxed mb-3">
                      "{quote.text}"
                    </p>
                    <footer className="text-gray-400">
                      <strong className={classes.accent}>{quote.author}</strong>
                      {quote.source && (
                        <span className="text-gray-500"> — {quote.source}</span>
                      )}
                    </footer>
                  </div>
                </div>
              </blockquote>
            ))}
          </motion.div>

          {/* Article sections */}
          <div className="space-y-10 mb-12">
            {sections.map((section, index) => (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-cyber rounded-xl p-6 md:p-8"
              >
                <h2 className="font-orbitron text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  {section.icon && <section.icon className={`w-6 h-6 ${classes.accent}`} />}
                  {section.title}
                </h2>
                <div 
                  className="text-gray-300 leading-relaxed space-y-4 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </motion.section>
            ))}
          </div>

          {/* Video section */}
          {videoId && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-orbitron text-xl font-bold text-white mb-4 flex items-center gap-3">
                <ExternalLink className={`w-5 h-5 ${classes.accent}`} />
                {videoTitle || 'Video Relacionado'}
              </h2>
              <div className="glass-cyber rounded-xl overflow-hidden aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.section>
          )}

          {/* Reflection section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className={`glass-cyber rounded-xl p-6 md:p-8 border-2 border-amber-400/40 bg-gradient-to-br from-amber-950/30 to-transparent`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-orbitron text-lg font-bold text-amber-400 mb-3">
                    Para Reflexionar
                  </h3>
                  <p className="text-gray-200 text-lg italic leading-relaxed">
                    {reflection}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Completion button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex justify-center"
          >
            {isRead ? (
              <div className={`flex items-center gap-3 px-6 py-4 rounded-xl ${classes.bg} ${classes.border} border`}>
                <CheckCircle className={`w-6 h-6 ${classes.accent}`} />
                <span className={`font-orbitron font-bold ${classes.accent}`}>
                  Artículo completado
                </span>
              </div>
            ) : (
              <Button
                onClick={() => markArticleRead(id)}
                size="lg"
                className={`font-orbitron ${classes.bg} ${classes.border} border hover:opacity-90 transition-all`}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Marcar como completado
              </Button>
            )}
          </motion.div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pb-24"
            >
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                Artículos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={article.href}
                    className={`glass-cyber rounded-xl p-4 ${classes.border} border hover:border-opacity-60 transition-all duration-300 group`}
                  >
                    <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {article.title}
                    </h3>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 flex items-center gap-1 mt-2">
                      Leer más <ArrowLeft className="w-3 h-3 rotate-180" />
                    </span>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </main>
      </div>
    </>
  );
}
