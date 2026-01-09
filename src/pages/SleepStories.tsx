import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Moon, 
  Loader2, 
  Sparkles, 
  PlusCircle, 
  Expand, 
  Volume2,
  Stars,
  ImagePlus
} from "lucide-react";
import { motion } from "framer-motion";
import { useSleepStories, SleepStory } from "@/hooks/useSleepStories";
import { useProcessingJobs } from "@/hooks/useProcessingJobs";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { SleepStoryCard } from "@/components/sleep/SleepStoryCard";
import { SleepPlayer } from "@/components/sleep/SleepPlayer";
import { JobProgressPanel } from "@/components/processing/JobProgressPanel";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoElRugido from "@/assets/logo-elrugido.svg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 }
  }
};

const SleepStories = () => {
  const navigate = useNavigate();
  const { stories, loading, generateAudio, saveProgress, refetch } = useSleepStories();
  const { queueJobs, stats: jobStats } = useProcessingJobs({ jobType: 'sleep_tts' });
  const { isAdmin, isModerator } = useAdminAuth();
  
  const canManageContent = isAdmin || isModerator;
  const [selectedStory, setSelectedStory] = useState<SleepStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isCreatingStories, setIsCreatingStories] = useState(false);
  const [isExpandingStories, setIsExpandingStories] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const handleStorySelect = (story: SleepStory) => {
    setSelectedStory(story);
    setGeneratedAudioUrl(story.audio_url);
  };

  const handleGenerateAudio = async () => {
    if (!selectedStory) return;
    
    setIsGenerating(true);
    const audioUrl = await generateAudio(selectedStory);
    if (audioUrl) {
      setGeneratedAudioUrl(audioUrl);
    }
    setIsGenerating(false);
  };

  const handleClosePlayer = () => {
    setSelectedStory(null);
    setGeneratedAudioUrl(null);
  };

  const handleSaveProgress = (duration: number, completed: boolean) => {
    if (selectedStory) {
      saveProgress(selectedStory.id, duration, completed);
    }
  };

  const handleCreateNewStories = async () => {
    setIsCreatingStories(true);
    let totalCreated = 0;
    
    try {
      let hasMore = true;
      while (hasMore) {
        toast.loading(`Generando nuevas historias...`, { id: 'create-stories' });
        
        const { data, error } = await supabase.functions.invoke('generate-sleep-stories', {
          body: { action: 'create_new', limit: 1 }
        });
        
        if (error) throw error;
        
        const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
        totalCreated += successCount;
        hasMore = data.hasMore;
        
        if (successCount > 0) {
          const lastResult = data.results.find((r: any) => r.status === 'success');
          toast.loading(`Creada: "${lastResult?.titulo}" (${lastResult?.duration} min)`, { id: 'create-stories' });
        }
        
        if (!hasMore) break;
      }
      
      toast.success(`✅ Se crearon ${totalCreated} nuevas historias`, { id: 'create-stories' });
      refetch();
    } catch (error) {
      console.error('Error creating stories:', error);
      toast.error('Error al crear historias', { id: 'create-stories' });
    } finally {
      setIsCreatingStories(false);
    }
  };

  const handleExpandStories = async () => {
    setIsExpandingStories(true);
    let totalExpanded = 0;
    
    try {
      let hasMore = true;
      while (hasMore) {
        toast.loading(`Expandiendo historias cortas...`, { id: 'expand-stories' });
        
        const { data, error } = await supabase.functions.invoke('generate-sleep-stories', {
          body: { action: 'expand_existing', limit: 1 }
        });
        
        if (error) throw error;
        
        const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
        totalExpanded += successCount;
        hasMore = data.hasMore;
        
        if (successCount > 0) {
          const lastResult = data.results.find((r: any) => r.status === 'success');
          toast.loading(`Expandida: "${lastResult?.titulo}" → ${lastResult?.duration} min`, { id: 'expand-stories' });
        }
        
        if (!hasMore) break;
      }
      
      toast.success(`✅ Se expandieron ${totalExpanded} historias`, { id: 'expand-stories' });
      refetch();
    } catch (error) {
      console.error('Error expanding stories:', error);
      toast.error('Error al expandir historias', { id: 'expand-stories' });
    } finally {
      setIsExpandingStories(false);
    }
  };

  const handleGenerateAllImages = async () => {
    const storiesWithoutImage = stories.filter(s => !s.imagen_url);
    if (storiesWithoutImage.length === 0) {
      toast.info("Todas las historias ya tienen imagen");
      return;
    }

    setIsGeneratingImages(true);
    let generated = 0;

    for (const story of storiesWithoutImage) {
      try {
        toast.loading(`Generando imagen ${generated + 1}/${storiesWithoutImage.length}: "${story.titulo}"`, { id: 'generate-images' });
        
        const { error } = await supabase.functions.invoke('generate-sleep-image', {
          body: { storyId: story.id }
        });

        if (error) throw error;
        generated++;
      } catch (error) {
        console.error(`Error generating image for ${story.titulo}:`, error);
      }
    }

    toast.success(`✅ Se generaron ${generated} imágenes`, { id: 'generate-images' });
    refetch();
    setIsGeneratingImages(false);
  };

  const handleQueueAudioGeneration = async () => {
    const storiesWithoutAudio = stories.filter(s => !s.audio_url);
    
    if (storiesWithoutAudio.length === 0) {
      toast.info("Todas las historias ya tienen audio");
      return;
    }

    const items = storiesWithoutAudio.map(s => ({
      id: s.id,
      title: s.titulo,
      table: 'sleep_stories'
    }));

    await queueJobs('sleep_tts', items);
  };

  const shortStoriesCount = stories.filter(s => s.duracion_estimada < 5).length;
  const storiesWithoutAudioCount = stories.filter(s => !s.audio_url).length;
  const storiesWithoutImageCount = stories.filter(s => !s.imagen_url).length;
  
  const isAnyProcessRunning = isCreatingStories || isExpandingStories || isGeneratingImages;
  const hasActiveJobs = jobStats.pending > 0 || jobStats.processing > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 min-h-screen bg-background pb-24 lg:ml-64">
        {/* Hero Header */}
      <motion.header 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400/10 via-transparent to-transparent" />
        
        <div className="relative z-10 p-5 pt-8">
          {/* Navigation */}
          <motion.div 
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={() => navigate(-1)}
              className="glass-button p-2.5 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            {/* Logo solo visible en móvil */}
            <img 
              src={logoElRugido} 
              alt="El Rugido" 
              className="h-8 w-auto lg:hidden"
            />
            <div>
              <motion.h1 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Historias para Dormir
              </motion.h1>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Narraciones bíblicas para un descanso reparador
              </motion.p>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            className="glass-card rounded-2xl p-4 flex items-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 flex items-center justify-center shrink-0">
              <Stars className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Dulces sueños con la Palabra</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Historias bíblicas narradas con voz suave para ayudarte a conciliar el sueño. 
                Configura un timer y déjate llevar por la paz de la Escritura.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Panel de progreso de jobs - Solo admin/moderador */}
      {canManageContent && (
        <div className="px-4 mb-4">
          <JobProgressPanel 
            jobType="sleep_tts" 
            title="Generación de Audio" 
          />
        </div>
      )}

      {/* Stats counter */}
      <motion.div 
        className="px-4 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="glass-card rounded-xl p-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            {stories.length} historias
          </span>
          <span className="w-px h-3 bg-border" />
          <span>{shortStoriesCount > 0 ? `${shortStoriesCount} cortas` : '✓ expandidas'}</span>
          <span className="w-px h-3 bg-border" />
          <span>{storiesWithoutAudioCount > 0 ? `${storiesWithoutAudioCount} sin audio` : '✓ audio'}</span>
        </div>
      </motion.div>

      {/* AI Generation buttons - Solo admin/moderador */}
      {canManageContent && (
        <motion.div 
          className="px-4 mb-6 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="outline"
            className="w-full justify-start gap-2 glass-button border-border/30 h-12"
            onClick={handleCreateNewStories}
            disabled={isAnyProcessRunning}
          >
            {isCreatingStories ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4 text-indigo-400" />
            )}
            <span>Crear nuevas historias bíblicas</span>
            <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
          </Button>
          
          {shortStoriesCount > 0 && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 glass-button border-border/30 h-12"
              onClick={handleExpandStories}
              disabled={isAnyProcessRunning}
            >
              {isExpandingStories ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Expand className="w-4 h-4 text-purple-400" />
              )}
              <span>Expandir {shortStoriesCount} historias cortas</span>
              <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
            </Button>
          )}

          {storiesWithoutImageCount > 0 && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 glass-button border-border/30 h-12"
              onClick={handleGenerateAllImages}
              disabled={isAnyProcessRunning}
            >
              {isGeneratingImages ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4 text-cyan-400" />
              )}
              <span>Generar {storiesWithoutImageCount} imágenes</span>
              <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
            </Button>
          )}

          {storiesWithoutAudioCount > 0 && !hasActiveJobs && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 glass-button border-border/30 h-12"
              onClick={handleQueueAudioGeneration}
              disabled={isAnyProcessRunning}
            >
              <Volume2 className="w-4 h-4 text-green-400" />
              <span>Encolar audio TTS para {storiesWithoutAudioCount} historias</span>
              <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
            </Button>
          )}
        </motion.div>
      )}

      {/* Stories grid */}
      <motion.div 
        className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stories.map((story) => (
          <motion.div key={story.id} variants={itemVariants}>
            <SleepStoryCard
              story={story}
              onClick={() => handleStorySelect(story)}
              onGenerateImage={async () => {
                try {
                  toast.loading(`Generando imagen...`, { id: `image-${story.id}` });
                  await supabase.functions.invoke('generate-sleep-image', {
                    body: { storyId: story.id }
                  });
                  toast.success('Imagen generada', { id: `image-${story.id}` });
                  refetch();
                } catch (error) {
                  toast.error('Error al generar imagen', { id: `image-${story.id}` });
                }
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Player modal */}
      {selectedStory && (
        <SleepPlayer
          story={selectedStory}
          audioUrl={generatedAudioUrl}
          isGenerating={isGenerating}
          onClose={handleClosePlayer}
          onGenerateAudio={handleGenerateAudio}
          onSaveProgress={handleSaveProgress}
        />
      )}

        <BottomNavigation />
      </div>
    </div>
  );
};

export default SleepStories;
