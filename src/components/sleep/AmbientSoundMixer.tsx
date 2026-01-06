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
  VolumeX,
  Music
} from "lucide-react";

interface AmbientSound {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  autoPlay?: boolean; // Auto-activate for sleep stories
  defaultVolume?: number;
}

// Using free ambient sounds - prioritizing soft music for sleep
const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "soft-piano",
    name: "Piano suave",
    icon: <Music className="w-5 h-5" />,
    // Relaxing piano music from archive.org (public domain)
    url: "https://ia800500.us.archive.org/7/items/relaxing-piano-music/Relaxing_Piano_Music_Sleep_Music.mp3",
    autoPlay: true,
    defaultVolume: 0.25
  },
  {
    id: "rain",
    name: "Lluvia",
    icon: <CloudRain className="w-5 h-5" />,
    url: "https://soundbible.com/mp3/Rain-SoundBible.com-2065722324.mp3",
    defaultVolume: 0.3
  },
  {
    id: "waves",
    name: "Olas",
    icon: <Waves className="w-5 h-5" />,
    url: "https://soundbible.com/mp3/Ocean_Waves-Mike_Koenig-980635527.mp3",
    defaultVolume: 0.3
  },
  {
    id: "fire",
    name: "Fuego",
    icon: <Flame className="w-5 h-5" />,
    url: "https://soundbible.com/mp3/Campfire-SoundBible.com-1933636465.mp3",
    defaultVolume: 0.4
  },
  {
    id: "wind",
    name: "Viento",
    icon: <Wind className="w-5 h-5" />,
    url: "https://soundbible.com/mp3/Wind-Mark_DiAngelo-1940285615.mp3",
    defaultVolume: 0.3
  },
  {
    id: "forest",
    name: "Bosque",
    icon: <TreePine className="w-5 h-5" />,
    url: "https://soundbible.com/mp3/Rainforest_Ambience-GlorySunz-1938133500.mp3",
    defaultVolume: 0.3
  },
  {
    id: "birds",
    name: "Pájaros",
    icon: <Bird className="w-5 h-5" />,
    url: "https://soundbible.com/mp3/Songbird-SoundBible.com-192809392.mp3",
    defaultVolume: 0.25
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Auto-activate soft background music on first play
  useEffect(() => {
    if (isPlaying && !hasInitialized) {
      setHasInitialized(true);
      
      // Auto-activate sounds marked with autoPlay
      const autoPlaySounds = AMBIENT_SOUNDS.filter(s => s.autoPlay);
      const newActiveSounds = new Map(activeSounds);
      const newVolumes = new Map(soundVolumes);
      
      autoPlaySounds.forEach(soundConfig => {
        if (!activeSounds.has(soundConfig.id)) {
          const audio = new Audio(soundConfig.url);
          audio.loop = true;
          const volume = soundConfig.defaultVolume || 0.3;
          audio.volume = volume * masterVolume;
          audio.play().catch(console.error);
          
          newActiveSounds.set(soundConfig.id, {
            id: soundConfig.id,
            volume,
            audio
          });
          newVolumes.set(soundConfig.id, volume);
        }
      });
      
      if (newActiveSounds.size > activeSounds.size) {
        setActiveSounds(newActiveSounds);
        setSoundVolumes(newVolumes);
      }
    }
  }, [isPlaying, hasInitialized, masterVolume]);

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
      const defaultVol = soundConfig.defaultVolume || 0.5;
      audio.volume = defaultVol * masterVolume;
      
      if (isPlaying) {
        audio.play().catch(console.error);
      }
      
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