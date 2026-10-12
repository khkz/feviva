import { useCallback, useRef, useState, type MutableRefObject } from "react";
import type { AudioItemType, EngineSettings, SettingsKind } from "./types";
import type { WithEngine } from "./useEngineCommands";

export const settingsKindOf = (type: AudioItemType | null | undefined): SettingsKind =>
  type === "rosario" || type === "ritual" ? type : "library";

export const DEFAULT_SETTINGS: Readonly<Record<SettingsKind, EngineSettings>> = {
  // Prayers, stories and lessons: a little slower by default, as before.
  library: { playbackRate: 0.9, volume: 1, isMuted: false, repeatMode: "off" },
  // Daily audios (laudes, completas…) had their own player at 1x with a mute button.
  ritual: { playbackRate: 1, volume: 1, isMuted: false, repeatMode: "off" },
  // The rosary prays each prayer once, at normal speed and full volume.
  rosario: { playbackRate: 1, volume: 1, isMuted: false, repeatMode: "off" },
};

/**
 * Settings per kind of audio, so speed, mute or repeat chosen for a prayer never
 * leak into the rosary or the daily audios now that they share one player.
 * `activeRef` always holds the settings of the kind being played.
 */
export function usePlayerSettings(activeRef: MutableRefObject<EngineSettings>, withEngine: WithEngine) {
  const [byKind, setByKind] = useState<Record<SettingsKind, EngineSettings>>(DEFAULT_SETTINGS);
  const byKindRef = useRef<Record<SettingsKind, EngineSettings>>(DEFAULT_SETTINGS);
  const [activeKind, setActiveKind] = useState<SettingsKind>("library");
  const activeKindRef = useRef<SettingsKind>("library");

  /** Switches the engine to the settings of `kind`; true when the kind changed. */
  const activate = useCallback(
    (kind: SettingsKind) => {
      if (kind === activeKindRef.current) return false;
      const settings = byKindRef.current[kind];
      activeKindRef.current = kind;
      activeRef.current = settings;
      setActiveKind(kind);
      withEngine(async (engine) => {
        await engine.setRate(settings.playbackRate);
        await engine.setVolume(settings.volume);
        await engine.setMuted(settings.isMuted);
        await engine.setRepeat(settings.repeatMode);
      });
      return true;
    },
    [activeRef, withEngine],
  );

  const update = useCallback(
    (kind: SettingsKind, patch: Partial<EngineSettings>) => {
      const next = { ...byKindRef.current[kind], ...patch };
      byKindRef.current = { ...byKindRef.current, [kind]: next };
      setByKind(byKindRef.current);
      if (kind !== activeKindRef.current) return;
      activeRef.current = next;
      withEngine(async (engine) => {
        if (patch.playbackRate !== undefined) await engine.setRate(next.playbackRate);
        if (patch.volume !== undefined) await engine.setVolume(next.volume);
        if (patch.isMuted !== undefined) await engine.setMuted(next.isMuted);
        if (patch.repeatMode !== undefined) await engine.setRepeat(next.repeatMode);
      });
    },
    [activeRef, withEngine],
  );

  const updateActive = useCallback(
    (patch: Partial<EngineSettings>) => update(activeKindRef.current, patch),
    [update],
  );

  const settingsFor = useCallback((kind: SettingsKind) => byKind[kind], [byKind]);

  return { active: byKind[activeKind], activate, update, updateActive, settingsFor };
}
