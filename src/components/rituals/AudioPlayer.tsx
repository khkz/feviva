import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface AudioPlayerProps {
  src: string | null;
  title?: string;
  compact?: boolean;
}

const RATES = [0.75, 1, 1.25, 1.5, 2];

// "Escuchar laudes" → "Laudes" for the lock screen and the mini player.
const itemTitle = (title?: string) => {
  const name = (title ?? "").replace(/^escuchar\s+/i, "").trim();
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Audio del día";
};

/**
 * Inline controls for the day's audio (laudes, completas, verse, reflection…).
 * Playback goes through the global player, so it keeps playing with the
 * screen locked and shows up in the mini player and on the lock screen.
 */
export const AudioPlayer = ({ src, title, compact = false }: AudioPlayerProps) => {
  const player = useAudioPlayer();
  // Duration from a metadata-only preload, shown before playback starts (as before).
  const [previewDuration, setPreviewDuration] = useState(0);
  // Where the slider is dragged to before playing; playback starts there on release.
  const [startAt, setStartAt] = useState<number | null>(null);
  const isCurrent = !!src && player.currentItem?.type === "ritual" && player.currentItem.id === src;

  // Once playing, the slider follows the player. (Radix reports the keyboard commit before the
  // change, so the last drag value can't be cleared in the commit handler itself.)
  useEffect(() => {
    if (isCurrent) setStartAt(null);
  }, [isCurrent]);

  if (!src) return null;

  const isPlaying = isCurrent && player.isPlaying;
  const currentTime = isCurrent ? player.currentTime : (startAt ?? 0);
  const duration = isCurrent && player.duration > 0 ? player.duration : previewDuration;
  // Speed and mute of the daily audios, kept apart from the prayers' settings.
  const { isMuted, playbackRate } = player.settingsFor("ritual");
  const item = {
    id: src,
    title: itemTitle(title),
    subtitle: "Oración del día",
    audioUrl: src,
    type: "ritual" as const,
  };

  const togglePlay = () => {
    if (isCurrent) {
      player.togglePlay();
      return;
    }
    player.play(item);
    player.minimize();
  };

  const toggleMute = () => {
    player.updateSettings("ritual", { isMuted: !isMuted });
  };

  const handleSeek = (value: number[]) => {
    if (isCurrent) player.seek(value[0]);
    else setStartAt(value[0]);
  };

  // Moving the slider before playing starts the audio there, as the old inline player allowed.
  const handleSeekCommit = (value: number[]) => {
    if (isCurrent) return;
    player.play(item, value[0]);
    player.minimize();
  };

  const cyclePlaybackRate = () => {
    const currentIndex = RATES.indexOf(playbackRate);
    player.updateSettings("ritual", { playbackRate: RATES[(currentIndex + 1) % RATES.length] });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const metadataPreload = (
    <audio
      src={src}
      preload="metadata"
      muted
      onLoadedMetadata={(event) => {
        const value = event.currentTarget.duration;
        if (Number.isFinite(value)) setPreviewDuration(value);
      }}
    />
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {metadataPreload}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        {title && (
          <span className="text-sm text-muted-foreground">{title}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-secondary/20 rounded-lg p-4 space-y-3">
      {metadataPreload}

      {title && (
        <p className="text-sm font-medium text-foreground">{title}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            onValueCommit={handleSeekCommit}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs px-2"
          onClick={cyclePlaybackRate}
          aria-label={`Cambiar velocidad de reproducción. Velocidad actual ${playbackRate}x`}
        >
          {playbackRate}x
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          aria-label={isMuted ? "Activar sonido" : "Silenciar audio"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
