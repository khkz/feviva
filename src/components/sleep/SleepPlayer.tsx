import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  X, 
  Moon, 
  Volume2, 
  VolumeX,
  Timer,
  Loader2
} from "lucide-react";
import { SleepStory } from "@/hooks/useSleepStories";
import { AmbientSoundMixer } from "./AmbientSoundMixer";
import { ContentFeedback } from "@/components/feedback/ContentFeedback";

interface SleepPlayerProps {
  story: SleepStory;
  audioUrl: string | null;
  isGenerating: boolean;
  onClose: () => void;
  onGenerateAudio: () => void;
  onSaveProgress: (duration: number, completed: boolean) => void;
}

const TIMER_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "Sin timer", value: 0 },
];

export const SleepPlayer = ({
  story,
  audioUrl,
  isGenerating,
  onClose,
  onGenerateAudio,
  onSaveProgress,
}: SleepPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1);
  const [selectedTimer, setSelectedTimer] = useState(15);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [showTimerPicker, setShowTimerPicker] = useState(!audioUrl);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timerRemaining !== null && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
            // Timer finished, stop playback
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            onSaveProgress(Math.floor(currentTime / 60), false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timerRemaining, currentTime, onSaveProgress]);

  const togglePlay = () => {
    if (!audioUrl) {
      onGenerateAudio();
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Start timer if not already running
        if (timerRemaining === null && selectedTimer > 0) {
          setTimerRemaining(selectedTimer * 60);
        }
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleMasterVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setMasterVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onSaveProgress(Math.floor(duration / 60), true);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const startWithTimer = (minutes: number) => {
    setSelectedTimer(minutes);
    setShowTimerPicker(false);
    if (minutes > 0) {
      setTimerRemaining(minutes * 60);
    } else {
      setTimerRemaining(null);
    }
    
    if (!audioUrl) {
      onGenerateAudio();
    } else if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 text-primary">
          <Moon className="w-5 h-5" />
          <span className="font-medium">Sleep Story</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
        {/* Story artwork */}
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-8 animate-pulse">
          <Moon className="w-24 h-24 text-primary/60" />
        </div>

        {/* Story info */}
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          {story.titulo}
        </h2>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          {story.descripcion}
        </p>

        {/* Timer remaining display */}
        {timerRemaining !== null && timerRemaining > 0 && (
          <div className="flex items-center gap-2 text-primary mb-6">
            <Timer className="w-4 h-4" />
            <span className="text-sm">
              Timer: {formatTime(timerRemaining)}
            </span>
          </div>
        )}

        {/* Timer picker or Audio controls */}
        {showTimerPicker ? (
          <div className="w-full max-w-sm space-y-4">
            <p className="text-center text-muted-foreground mb-4">
              ¿Cuánto tiempo quieres escuchar?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TIMER_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTimer === option.value ? "default" : "outline"}
                  className="h-14"
                  onClick={() => startWithTimer(option.value)}
                  disabled={isGenerating}
                >
                  {isGenerating && selectedTimer === option.value ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-6">
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
              />
            )}

            {/* Progress slider */}
            {audioUrl && (
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Main controls */}
            <div className="flex items-center justify-center gap-6">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                >
                  {isMuted || masterVolume === 0 ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </Button>
                
                {showVolumeSlider && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-lg p-3 shadow-lg">
                    <Slider
                      value={[masterVolume]}
                      max={1}
                      step={0.1}
                      orientation="vertical"
                      onValueChange={handleMasterVolumeChange}
                      className="h-24"
                    />
                  </div>
                )}
              </div>

              <Button
                size="icon"
                className="w-20 h-20 rounded-full"
                onClick={togglePlay}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-10 h-10" />
                ) : (
                  <Play className="w-10 h-10 ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12"
                onClick={() => setShowTimerPicker(true)}
              >
                <Timer className="w-6 h-6" />
              </Button>
            </div>

            {/* Ambient Sound Mixer */}
            <AmbientSoundMixer 
              isPlaying={isPlaying} 
              masterVolume={masterVolume} 
            />

            {isGenerating && (
              <p className="text-center text-sm text-muted-foreground">
                Generando narración con voz relajante...
              </p>
            )}

            {/* Feedback */}
            <div className="pt-4 border-t border-border/30">
              <ContentFeedback 
                contentType="sleep_story" 
                contentId={story.id} 
                showComment 
                className="justify-center"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
