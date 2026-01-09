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
  Loader2,
  Stars
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SleepStory } from "@/hooks/useSleepStories";
import { AmbientSoundMixer } from "./AmbientSoundMixer";
import { ContentFeedback } from "@/components/feedback/ContentFeedback";
import logoElRugido from "@/assets/logo-elrugido.svg";

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
  const [playbackRate, setPlaybackRate] = useState(0.9);

  const SLEEP_SPEEDS = [0.7, 0.8, 0.9, 1.0];

  const cyclePlaybackRate = () => {
    const currentIndex = SLEEP_SPEEDS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % SLEEP_SPEEDS.length;
    const newRate = SLEEP_SPEEDS[nextIndex];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timerRemaining !== null && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
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
      audioRef.current.playbackRate = playbackRate;
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
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Deep night gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950" />
        
        {/* Blurred background image if available */}
        {story.imagen_url && (
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1 }}
          >
            <img 
              src={story.imagen_url} 
              alt="" 
              className="w-full h-full object-cover blur-3xl scale-110"
            />
          </motion.div>
        )}

        {/* Stars overlay effect */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, white, transparent),
                           radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 90px 40px, white, transparent),
                           radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
                           radial-gradient(1px 1px at 160px 120px, white, transparent)`,
          backgroundSize: '200px 200px'
        }} />
        
        {/* Header */}
        <motion.div 
          className="relative z-10 flex items-center justify-between p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-indigo-300">
            <img 
              src={logoElRugido} 
              alt="El Rugido" 
              className="h-6 w-auto"
            />
            <span className="font-medium text-sm">Sleep Story</span>
          </div>
          <div className="w-10" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
          {/* Story artwork */}
          <motion.div 
            className="relative w-52 h-52 rounded-full overflow-hidden mb-8 shadow-2xl shadow-indigo-500/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {story.imagen_url ? (
              <img 
                src={story.imagen_url} 
                alt={story.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-slate-800/40 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Moon className="w-24 h-24 text-indigo-400/60" />
                </motion.div>
              </div>
            )}
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full ring-2 ring-white/10" />
          </motion.div>

          {/* Story info */}
          <motion.h2 
            className="text-2xl font-bold text-white text-center mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {story.titulo}
          </motion.h2>
          <motion.p 
            className="text-indigo-200/70 text-center max-w-md mb-8 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {story.descripcion}
          </motion.p>

          {/* Timer remaining display */}
          <AnimatePresence>
            {timerRemaining !== null && timerRemaining > 0 && (
              <motion.div 
                className="flex items-center gap-2 text-indigo-300 mb-6 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatTime(timerRemaining)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer picker or Audio controls */}
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {showTimerPicker ? (
              <div className="glass-card rounded-3xl p-6 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Stars className="w-5 h-5 text-indigo-300" />
                  <p className="text-center text-indigo-100">
                    ¿Cuánto tiempo quieres escuchar?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {TIMER_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedTimer === option.value ? "default" : "outline"}
                      className={`h-14 rounded-xl font-medium transition-all ${
                        selectedTimer === option.value 
                          ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                          : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                      }`}
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
              <div className="space-y-6">
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                  />
                )}

                {/* Glass card for controls */}
                <div className="glass-card rounded-3xl p-6 bg-white/5 backdrop-blur-xl border border-white/10">
                  {/* Progress slider */}
                  {audioUrl && (
                    <div className="space-y-2 mb-6">
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-indigo-200/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Main controls */}
                  <div className="flex items-center justify-center gap-4">
                    {/* Speed control */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-12 h-12 text-white/70 hover:text-white hover:bg-white/10"
                      onClick={cyclePlaybackRate}
                      title="Velocidad de reproducción"
                    >
                      <span className="text-sm font-medium">{playbackRate}x</span>
                    </Button>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                      >
                        {isMuted || masterVolume === 0 ? (
                          <VolumeX className="w-6 h-6" />
                        ) : (
                          <Volume2 className="w-6 h-6" />
                        )}
                      </Button>
                      
                      <AnimatePresence>
                        {showVolumeSlider && (
                          <motion.div 
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/90 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            <Slider
                              value={[masterVolume]}
                              max={1}
                              step={0.1}
                              orientation="vertical"
                              onValueChange={handleMasterVolumeChange}
                              className="h-24"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="icon"
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/30"
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
                    </motion.div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-12 h-12 text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => setShowTimerPicker(true)}
                    >
                      <Timer className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* Ambient Sound Mixer */}
                <AmbientSoundMixer 
                  isPlaying={isPlaying} 
                  masterVolume={masterVolume} 
                />

                {isGenerating && (
                  <motion.p 
                    className="text-center text-sm text-indigo-200/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Generando narración con voz relajante...
                  </motion.p>
                )}

                {/* Feedback */}
                <div className="pt-4 border-t border-white/10">
                  <ContentFeedback 
                    contentType="sleep_story" 
                    contentId={story.id} 
                    showComment 
                    className="justify-center"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
