import { useState, useRef, useEffect } from "react";
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
  VolumeX
} from "lucide-react";

interface AmbientSound {
  id: string;
  name: string;
  icon: React.ReactNode;
  // Using free ambient sound URLs from reliable sources
  url: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "rain",
    name: "Lluvia",
    icon: <CloudRain className="w-5 h-5" />,
    url: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3"
  },
  {
    id: "waves",
    name: "Olas",
    icon: <Waves className="w-5 h-5" />,
    url: "https://assets.mixkit.co/active_storage/sfx/2167/2167-preview.mp3"
  },
  {
    id: "fire",
    name: "Fuego",
    icon: <Flame className="w-5 h-5" />,
    url: "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3"
  },
  {
    id: "wind",
    name: "Viento",
    icon: <Wind className="w-5 h-5" />,
    url: "https://assets.mixkit.co/active_storage/sfx/2472/2472-preview.mp3"
  },
  {
    id: "forest",
    name: "Bosque",
    icon: <TreePine className="w-5 h-5" />,
    url: "https://assets.mixkit.co/active_storage/sfx/2518/2518-preview.mp3"
  },
  {
    id: "birds",
    name: "Pájaros",
    icon: <Bird className="w-5 h-5" />,
    url: "https://assets.mixkit.co/active_storage/sfx/2461/2461-preview.mp3"
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
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

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
        sound.audio.play().catch(console.error);
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

  const toggleSound = (soundConfig: AmbientSound) => {
    const existing = activeSounds.get(soundConfig.id);
    
    if (existing) {
      // Remove sound
      existing.audio.pause();
      existing.audio.src = "";
      const newActiveSounds = new Map(activeSounds);
      newActiveSounds.delete(soundConfig.id);
      setActiveSounds(newActiveSounds);
    } else {
      // Add sound
      const audio = new Audio(soundConfig.url);
      audio.loop = true;
      audio.volume = 0.5 * masterVolume;
      
      if (isPlaying) {
        audio.play().catch(console.error);
      }
      
      const newActiveSounds = new Map(activeSounds);
      newActiveSounds.set(soundConfig.id, {
        id: soundConfig.id,
        volume: 0.5,
        audio
      });
      setActiveSounds(newActiveSounds);
      
      const newVolumes = new Map(soundVolumes);
      newVolumes.set(soundConfig.id, 0.5);
      setSoundVolumes(newVolumes);
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
    <div className="w-full max-w-sm space-y-3">
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
          <div className="grid grid-cols-3 gap-2">
            {AMBIENT_SOUNDS.map((sound) => {
              const isActive = activeSounds.has(sound.id);
              return (
                <Button
                  key={sound.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSound(sound)}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  {sound.icon}
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