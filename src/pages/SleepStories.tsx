import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Loader2, Sparkles, PlusCircle, Expand, Volume2 } from "lucide-react";
import { useSleepStories, SleepStory } from "@/hooks/useSleepStories";
import { SleepStoryCard } from "@/components/sleep/SleepStoryCard";
import { SleepPlayer } from "@/components/sleep/SleepPlayer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SleepStories = () => {
  const navigate = useNavigate();
  const { stories, loading, generateAudio, saveProgress, refetch } = useSleepStories();
  const [selectedStory, setSelectedStory] = useState<SleepStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isCreatingStories, setIsCreatingStories] = useState(false);
  const [isExpandingStories, setIsExpandingStories] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

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
        toast.loading(`Generando nuevas historias con IA...`, { id: 'create-stories' });
        
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
        toast.loading(`Expandiendo historias cortas con IA...`, { id: 'expand-stories' });
        
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

  const handleBatchGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    let totalGenerated = 0;
    
    try {
      let hasMore = true;
      while (hasMore) {
        toast.loading(`Generando audio TTS...`, { id: 'batch-audio' });
        
        const { data, error } = await supabase.functions.invoke('batch-sleep-tts', {
          body: { limit: 1 }
        });
        
        if (error) throw error;
        
        const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
        totalGenerated += successCount;
        hasMore = data.hasMore;
        
        if (successCount > 0) {
          const lastResult = data.results.find((r: any) => r.status === 'success');
          toast.loading(`Audio generado: "${lastResult?.titulo}"`, { id: 'batch-audio' });
        }
        
        if (data.results?.some((r: any) => r.status === 'error')) {
          const errorResult = data.results.find((r: any) => r.status === 'error');
          console.error('Error in batch:', errorResult.error);
        }
        
        if (!hasMore) break;
      }
      
      toast.success(`✅ Se generó audio para ${totalGenerated} historias`, { id: 'batch-audio' });
      refetch();
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Error al generar audio', { id: 'batch-audio' });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Count short stories (less than 5 min)
  const shortStoriesCount = stories.filter(s => s.duracion_estimada < 5).length;
  // Count stories without audio
  const storiesWithoutAudio = stories.filter(s => !s.audio_url).length;
  
  const isAnyProcessRunning = isCreatingStories || isExpandingStories || isGeneratingAudio;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Sleep Stories</h1>
          </div>
        </div>
      </div>

      {/* Intro section */}
      <div className="p-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-4">
          <Moon className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Historias para Dormir</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Relájate con historias bíblicas narradas lentamente. 
          Configura un timer y déjate llevar al sueño.
        </p>
      </div>

      {/* AI Generation buttons */}
      <div className="px-4 mb-4 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleCreateNewStories}
          disabled={isAnyProcessRunning}
        >
          {isCreatingStories ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlusCircle className="w-4 h-4 text-primary" />
          )}
          <span>Crear nuevas historias (Moisés, Ruth, Salmos...)</span>
          <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
        </Button>
        
        {shortStoriesCount > 0 && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleExpandStories}
            disabled={isAnyProcessRunning}
          >
            {isExpandingStories ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Expand className="w-4 h-4 text-primary" />
            )}
            <span>Expandir {shortStoriesCount} historias cortas a 10-15 min</span>
            <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
          </Button>
        )}

        {storiesWithoutAudio > 0 && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleBatchGenerateAudio}
            disabled={isAnyProcessRunning}
          >
            {isGeneratingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
            <span>Generar audio TTS para {storiesWithoutAudio} historias</span>
            <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
          </Button>
        )}
      </div>

      {/* Stories list */}
      <div className="px-4 space-y-3">
        {stories.map((story) => (
          <SleepStoryCard
            key={story.id}
            story={story}
            onClick={() => handleStorySelect(story)}
          />
        ))}
      </div>

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
  );
};

export default SleepStories;
