import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Minimize2, Play, Pause, SkipBack, SkipForward, 
  Repeat, Repeat1, Timer, Volume2, VolumeX, 
  Cross, ListMusic, ChevronUp, ChevronDown, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudioPlayer, AudioQueueItem } from "@/contexts/AudioPlayerContext";
import { AmbientSoundMixer } from "@/components/sleep/AmbientSoundMixer";
import { cn } from "@/lib/utils";

// Import prayer images
import padreNuestroImg from "@/assets/oracion-padre-nuestro.jpg";
import aveMariaImg from "@/assets/oracion-ave-maria.jpg";
import gloriaImg from "@/assets/oracion-gloria.jpg";
import credoImg from "@/assets/oracion-credo.jpg";

function getPrayerImage(title: string): string | null {
  const normalizedName = title.toLowerCase();
  if (normalizedName.includes("padre nuestro")) return padreNuestroImg;
  if (normalizedName.includes("ave") && normalizedName.includes("mar")) return aveMariaImg;
  if (normalizedName.includes("gloria")) return gloriaImg;
  if (normalizedName.includes("credo")) return credoImg;
  return null;
}

const PLAYBACK_RATES = [0.75, 0.9, 1, 1.25, 1.5];
const TIMER_OPTIONS = [
  { label: "Sin timer", value: 0 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

export function OracionPlayer() {
  const {
    currentItem,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMinimized,
    isGenerating,
    timerRemaining,
    queue,
    currentIndex,
    repeatMode,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    minimize,
    close,
    setTimer,
    playNext,
    playPrevious,
    toggleRepeatMode,
    hasNext,
    hasPrevious,
  } = useAudioPlayer();

  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [masterAmbientVolume, setMasterAmbientVolume] = useState(0.3);
  const [showAmbient, setShowAmbient] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  // Only show for oracion content when not minimized
  if (!currentItem || currentItem.type !== 'oracion' || isMinimized) return null;

  const prayerImage = getPrayerImage(currentItem.title);

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatTimerRemaining = () => {
    if (timerRemaining === null) return null;
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const cyclePlaybackRate = () => {
    const currentIdx = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIdx = (currentIdx + 1) % PLAYBACK_RATES.length;
    setPlaybackRate(PLAYBACK_RATES[nextIdx]);
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return <Repeat1 className="h-5 w-5" />;
    return <Repeat className="h-5 w-5" />;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-background" />
        {prayerImage && (
          <div 
            className="absolute inset-0 opacity-10 blur-3xl scale-110"
            style={{ backgroundImage: `url(${prayerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={minimize}
          className="rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/10"
        >
          <Minimize2 className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Cross className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-foreground/70">Oraciones</span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          className="rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
        {/* Artwork */}
        <motion.div 
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-3xl overflow-hidden shadow-2xl shadow-secondary/20">
            {prayerImage ? (
              <img 
                src={prayerImage}
                alt={currentItem.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center">
                <Cross className="h-20 w-20 text-secondary/60" />
              </div>
            )}
          </div>
          
          {/* Repeat badge */}
          {repeatMode !== 'off' && (
            <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full p-1.5">
              {repeatMode === 'one' ? <Repeat1 className="h-3 w-3" /> : <Repeat className="h-3 w-3" />}
            </div>
          )}
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div 
          className="text-center mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-1">
            {currentItem.title}
          </h1>
          {currentItem.subtitle && (
            <p className="text-muted-foreground">{currentItem.subtitle}</p>
          )}
          {queue.length > 1 && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              {currentIndex + 1} de {queue.length}
            </p>
          )}
        </motion.div>

        {/* Timer remaining */}
        <AnimatePresence>
          {timerRemaining !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 px-3 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm flex items-center gap-2"
            >
              <Timer className="h-4 w-4" />
              <span>{formatTimerRemaining()}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-6">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={!audioUrl}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <motion.div 
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Playback Rate */}
          <Button
            variant="ghost"
            size="sm"
            onClick={cyclePlaybackRate}
            className="w-14 text-muted-foreground hover:text-foreground"
          >
            {playbackRate}x
          </Button>

          {/* Previous */}
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            disabled={!hasPrevious}
            className="h-12 w-12 rounded-full text-foreground/70 hover:text-foreground disabled:opacity-30"
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          {/* Play/Pause */}
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={!audioUrl || isGenerating}
            className={cn(
              "h-16 w-16 rounded-full shadow-lg",
              "bg-gradient-to-br from-secondary to-secondary/80",
              "hover:shadow-xl hover:scale-105 transition-all"
            )}
          >
            {isGenerating ? (
              <Loader2 className="h-8 w-8 animate-spin text-secondary-foreground" />
            ) : isPlaying ? (
              <Pause className="h-8 w-8 text-secondary-foreground" />
            ) : (
              <Play className="h-8 w-8 ml-1 text-secondary-foreground" />
            )}
          </Button>

          {/* Next */}
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            disabled={!hasNext}
            className="h-12 w-12 rounded-full text-foreground/70 hover:text-foreground disabled:opacity-30"
          >
            <SkipForward className="h-6 w-6" />
          </Button>

          {/* Repeat */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeatMode}
            className={cn(
              "h-12 w-12 rounded-full",
              repeatMode !== 'off' ? "text-secondary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {getRepeatIcon()}
          </Button>
        </motion.div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center gap-6 w-full max-w-md">
          {/* Volume */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-card rounded-xl shadow-lg"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <Slider
                    orientation="vertical"
                    value={[volume]}
                    max={1}
                    step={0.05}
                    onValueChange={(v) => {
                      setVolume(v[0]);
                      setIsMuted(false);
                    }}
                    className="h-24"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timer */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTimerPicker(!showTimerPicker)}
              className={cn(
                "rounded-full",
                timerRemaining !== null ? "text-secondary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Timer className="h-5 w-5" />
            </Button>
            
            <AnimatePresence>
              {showTimerPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-card rounded-xl shadow-lg min-w-32"
                >
                  {TIMER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTimer(option.value);
                        setShowTimerPicker(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left rounded-lg transition-colors",
                        timerRemaining !== null && option.value === Math.ceil(timerRemaining / 60)
                          ? "bg-secondary/20 text-secondary"
                          : "hover:bg-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ambient Sounds */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAmbient(!showAmbient)}
            className={cn(
              "rounded-full",
              showAmbient ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Volume2 className="h-5 w-5" />
          </Button>

          {/* Queue */}
          {queue.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQueue(!showQueue)}
              className={cn(
                "rounded-full",
                showQueue ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListMusic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Ambient Sound Panel */}
      <AnimatePresence>
        {showAmbient && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-md"
          >
            <div className="p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Sonidos Ambientales</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAmbient(false)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <AmbientSoundMixer isPlaying={isPlaying} masterVolume={masterAmbientVolume} />
              <div className="mt-3 flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[masterAmbientVolume]}
                  max={1}
                  step={0.1}
                  onValueChange={(v) => setMasterAmbientVolume(v[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {Math.round(masterAmbientVolume * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && queue.length > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 240, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-md"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Cola de reproducción</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowQueue(false)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-44">
                <div className="space-y-1 pr-4">
                  {queue.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        idx === currentIndex 
                          ? "bg-secondary/20 text-secondary" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      <span className="text-xs text-muted-foreground w-5">
                        {idx === currentIndex ? "▶" : idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          idx === currentIndex && "font-medium"
                        )}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
