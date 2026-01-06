import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  CloudRain, 
  Waves, 
  Flame, 
  Wind,
  TreePine,
  Bird,
  Volume2,
  Music,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AmbientSound {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  autoPlay?: boolean;
  defaultVolume?: number;
}

// Using reliable CDN sources for ambient sounds
const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "soft-piano",
    name: "Piano",
    icon: <Music className="w-5 h-5" />,
    url: "https://cdn.pixabay.com/audio/2024/11/10/audio_b86eb827d6.mp3",
    autoPlay: false,
    defaultVolume: 0.4
  },
  {
    id: "rain",
    name: "Lluvia",
    icon: <CloudRain className="w-5 h-5" />,
    url: "https://cdn.pixabay.com/audio/2022/05/31/audio_e4986c1c9d.mp3",
    defaultVolume: 0.5
  },
  {
    id: "waves",
    name: "Olas",
    icon: <Waves className="w-5 h-5" />,
    url: "https://cdn.pixabay.com/audio/2024/08/21/audio_d37e16cd10.mp3",
    defaultVolume: 0.5
  },
  {
    id: "fire",
    name: "Fuego",
    icon: <Flame className="w-5 h-5" />,
    url: "https://cdn.pixabay.com/audio/2022/10/30/audio_db2bbf4f26.mp3",
    defaultVolume: 0.5
  },
  {
    id: "wind",
    name: "Viento",
    icon: <Wind className="w-5 h-5" />,
    url: "https://cdn.pixabay.com/audio/2024/02/12/audio_8ea0d38f42.mp3",
    defaultVolume: 0.4
  },
  {
    id: "forest",
    name: "Bosque",
    icon: <TreePine className="w-5 h-5" />,
    url: "https://cdn.pixabay.com/audio/2022/02/07/audio_f6e0e7aa39.mp3",
    defaultVolume: 0.5
  },
  {
    id: "birds",
    name: "Pájaros",
    icon: <Bird className="w-5 h-5" />,
    url: "https://cdn.pixabay.com/audio/2024/02/20/audio_c72cdfb4f2.mp3",
    defaultVolume: 0.4
  },
];

interface AmbientSoundMixerProps {
  isPlaying: boolean;
  masterVolume: number;
}

interface ActiveSound {
  id: string;
  volume: number;
  audio: HTMLAudioElement;
}

export const AmbientSoundMixer = ({ isPlaying, masterVolume }: AmbientSoundMixerProps) => {
  const [activeSounds, setActiveSounds] = useState<Map<string, ActiveSound>>(new Map());
  const [soundVolumes, setSoundVolumes] = useState<Map<string, number>>(new Map());
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingSounds, setLoadingSounds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Update volumes when master volume changes
  useEffect(() => {
    activeSounds.forEach((sound) => {
      sound.audio.volume = (soundVolumes.get(sound.id) || 0.5) * masterVolume;
    });
  }, [masterVolume, activeSounds, soundVolumes]);

  // Play/pause sounds based on isPlaying
  useEffect(() => {
    activeSounds.forEach((sound) => {
      if (isPlaying) {
        sound.audio.play().catch(() => {});
      } else {
        sound.audio.pause();
      }
    });
  }, [isPlaying, activeSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeSounds.forEach((sound) => {
        sound.audio.pause();
        sound.audio.src = "";
      });
    };
  }, []);

  const toggleSound = async (soundConfig: AmbientSound) => {
    const existing = activeSounds.get(soundConfig.id);
    
    if (existing) {
      // Remove sound
      existing.audio.pause();
      existing.audio.src = "";
      const newActiveSounds = new Map(activeSounds);
      newActiveSounds.delete(soundConfig.id);
      setActiveSounds(newActiveSounds);
    } else {
      // Add sound - show loading state
      setLoadingSounds(prev => new Set(prev).add(soundConfig.id));
      
      try {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.loop = true;
        
        // Wait for the audio to be loaded
        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject(new Error("No se pudo cargar el audio"));
          audio.src = soundConfig.url;
          audio.load();
          
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error("Timeout")), 10000);
        });
        
        const defaultVol = soundConfig.defaultVolume || 0.5;
        audio.volume = defaultVol * masterVolume;
        
        // Always try to play immediately when toggled on
        await audio.play();
        
        const newActiveSounds = new Map(activeSounds);
        newActiveSounds.set(soundConfig.id, {
          id: soundConfig.id,
          volume: defaultVol,
          audio
        });
        setActiveSounds(newActiveSounds);
        
        const newVolumes = new Map(soundVolumes);
        newVolumes.set(soundConfig.id, defaultVol);
        setSoundVolumes(newVolumes);
        
      } catch (error) {
        console.error("Error loading sound:", error);
        toast({
          title: "Error de audio",
          description: `No se pudo reproducir "${soundConfig.name}". Intenta con otro sonido.`,
          variant: "destructive"
        });
      } finally {
        setLoadingSounds(prev => {
          const newSet = new Set(prev);
          newSet.delete(soundConfig.id);
          return newSet;
        });
      }
    }
  };

  const updateSoundVolume = (soundId: string, volume: number) => {
    const sound = activeSounds.get(soundId);
    if (sound) {
      sound.audio.volume = volume * masterVolume;
      const newVolumes = new Map(soundVolumes);
      newVolumes.set(soundId, volume);
      setSoundVolumes(newVolumes);
    }
  };

  const activeCount = activeSounds.size;

  return (
    <div className="w-full space-y-3">
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between h-10"
      >
        <span className="flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Sonidos de ambiente
        </span>
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {activeCount} activo{activeCount > 1 ? 's' : ''}
          </span>
        )}
      </Button>

      {isExpanded && (
        <div className="bg-card/50 rounded-lg p-4 space-y-4 border border-border/30">
          {/* Sound buttons grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {AMBIENT_SOUNDS.map((sound) => {
              const isActive = activeSounds.has(sound.id);
              const isLoading = loadingSounds.has(sound.id);
              return (
                <Button
                  key={sound.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSound(sound)}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    sound.icon
                  )}
                  <span className="text-xs">{sound.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Volume sliders for active sounds */}
          {activeCount > 0 && (
            <div className="space-y-3 pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground">Ajustar volumen</p>
              {Array.from(activeSounds.values()).map((activeSound) => {
                const soundConfig = AMBIENT_SOUNDS.find(s => s.id === activeSound.id);
                if (!soundConfig) return null;
                
                return (
                  <div key={activeSound.id} className="flex items-center gap-3">
                    <div className="w-20 flex items-center gap-2 text-sm">
                      {soundConfig.icon}
                      <span className="text-xs">{soundConfig.name}</span>
                    </div>
                    <Slider
                      value={[soundVolumes.get(activeSound.id) || 0.5]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => updateSoundVolume(activeSound.id, value[0])}
                      className="flex-1"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};