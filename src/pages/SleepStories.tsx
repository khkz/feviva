import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Loader2 } from "lucide-react";
import { useSleepStories, SleepStory } from "@/hooks/useSleepStories";
import { SleepStoryCard } from "@/components/sleep/SleepStoryCard";
import { SleepPlayer } from "@/components/sleep/SleepPlayer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const SleepStories = () => {
  const navigate = useNavigate();
  const { stories, loading, generateAudio, saveProgress } = useSleepStories();
  const [selectedStory, setSelectedStory] = useState<SleepStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

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
