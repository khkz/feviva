#!/usr/bin/env node
/**
 * Patches the native players of capacitor-plugin-playlist for El Rugido (see MOBILE.md).
 *
 * iOS:
 * 1. Audio session `.playback` instead of `.playAndRecord`: a recording category asks for
 *    the microphone (and iOS kills the app without NSMicrophoneUsageDescription).
 * 2. `setPlaybackRate` also sets AVPlayer.defaultRate, so the chosen speed survives pause,
 *    lock-screen play and track changes, and changing it while paused no longer starts playback.
 * 3. The lock screen shows the real speed (0 while paused) instead of a fixed 1x.
 * iOS and Android:
 * 4. A prayer left halfway (skip from the lock screen or the app) starts from the beginning
 *    when the queue reaches it again, instead of resuming where it was left.
 *
 * Runs before every `cap sync` (npm run cap:sync). Idempotent; fails if the plugin changed,
 * so the patch is reviewed whenever the plugin is upgraded.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_VERSION = "8.0.0";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginDir = path.join(root, "node_modules", "capacitor-plugin-playlist");
const IOS_PLAYER = "ios/Sources/PlaylistPlugin/RmxAudioPlayer.swift";
const IOS_QUEUE = "ios/Sources/PlaylistPlugin/AVBidirectionalQueuePlayer.swift";
const ANDROID_PLAYLIST = "android/src/main/java/org/dwbn/plugins/playlist/manager/PlaylistManager.kt";

const patches = [
  {
    file: IOS_PLAYER,
    name: "playback audio session",
    from: `        // If no devices are connected, play audio through the default speaker (rather than the earpiece).
        var options: AVAudioSession.CategoryOptions = .defaultToSpeaker

        // If both Bluetooth streaming options are enabled, the low quality stream is preferred; enable A2DP only.
        options.insert(.allowBluetoothA2DP)

        do {
            // Always set category first, even if session is already active
            // This ensures we have the correct category after video player exits
            try avSession.setCategory(.playAndRecord, options: options)`,
    to: `        // El Rugido patch: playback only. .playAndRecord would ask for the microphone.
        do {
            // Always set category first, even if session is already active
            // This ensures we have the correct category after video player exits
            try avSession.setCategory(.playback, mode: .default, options: [])`,
  },
  {
    file: IOS_PLAYER,
    name: "speed kept by defaultRate",
    from: `    func setPlaybackRate(_ rate: Float) {
        avQueuePlayer.rate = rate
    }`,
    to: `    func setPlaybackRate(_ rate: Float) {
        // El Rugido patch: play() starts at defaultRate, so the speed survives pause and track
        // changes; setting rate while paused would start playback.
        avQueuePlayer.defaultRate = rate
        if avQueuePlayer.rate != 0 {
            avQueuePlayer.rate = rate
        }
    }`,
  },
  {
    file: IOS_PLAYER,
    name: "lock-screen speed",
    from: `            duration = 0
        }

        self.nowPlayingInfoQueue.sync {
            if updateTrackData {`,
    to: `            duration = 0
        }
        // El Rugido patch: lock-screen progress at the real speed, still while paused.
        let playbackRate = Double(avQueuePlayer.rate)

        self.nowPlayingInfoQueue.sync {
            if updateTrackData {`,
  },
  {
    file: IOS_PLAYER,
    name: "lock-screen speed value",
    from: `            updatedNowPlayingInfo![MPNowPlayingInfoPropertyPlaybackRate] = 1.0`,
    to: `            updatedNowPlayingInfo![MPNowPlayingInfoPropertyPlaybackRate] = playbackRate`,
  },
  {
    file: IOS_QUEUE,
    name: "iOS: tracks restart from the beginning",
    from: `    private func snapshotPosition(of item: AudioTrack?) {
        guard let item = item else { return }
        let seconds = item.currentTime().seconds
        if seconds.isFinite && seconds >= 0 {
            item.startPositionSeconds = seconds
        }
    }`,
    to: `    private func snapshotPosition(of item: AudioTrack?) {
        // El Rugido patch: a prayer left halfway starts from the beginning next time.
        guard let item = item else { return }
        item.startPositionSeconds = 0
    }`,
  },
  {
    file: ANDROID_PLAYLIST,
    name: "Android: next starts from the beginning",
    from: `        audioTracks.getOrNull(fromIndex)?.startPositionMs = exoPlayer.currentPosition
        val targetIndex = PlaylistPlaybackPolicy.nextSkipIndex(fromIndex, audioTracks.size, loop)`,
    to: `        audioTracks.getOrNull(fromIndex)?.startPositionMs = 0L // El Rugido patch: restart when reached again
        val targetIndex = PlaylistPlaybackPolicy.nextSkipIndex(fromIndex, audioTracks.size, loop)`,
  },
  {
    file: ANDROID_PLAYLIST,
    name: "Android: previous starts from the beginning",
    from: `        audioTracks.getOrNull(fromIndex)?.startPositionMs = exoPlayer.currentPosition
        val targetIndex = PlaylistPlaybackPolicy.previousSkipIndex(fromIndex, audioTracks.size, loop)`,
    to: `        audioTracks.getOrNull(fromIndex)?.startPositionMs = 0L // El Rugido patch: restart when reached again
        val targetIndex = PlaylistPlaybackPolicy.previousSkipIndex(fromIndex, audioTracks.size, loop)`,
  },
];

function fail(message) {
  console.error(`[patch-native-audio] ${message}`);
  process.exit(1);
}

let version;
try {
  version = JSON.parse(readFileSync(path.join(pluginDir, "package.json"), "utf8")).version;
} catch {
  fail("capacitor-plugin-playlist is not installed. Run npm install first.");
}
if (version !== EXPECTED_VERSION) {
  fail(`capacitor-plugin-playlist is ${version}, but this patch was written for ${EXPECTED_VERSION}. Review scripts/patch-native-audio.mjs.`);
}

const applied = [];
for (const file of new Set(patches.map((patch) => patch.file))) {
  const fullPath = path.join(pluginDir, file);
  let source = readFileSync(fullPath, "utf8");
  let changed = false;
  for (const patch of patches.filter((p) => p.file === file)) {
    if (source.includes(patch.to)) continue;
    const occurrences = source.split(patch.from).length - 1;
    if (occurrences !== 1) fail(`could not apply "${patch.name}" (found ${occurrences} matches). Review the patch.`);
    source = source.replace(patch.from, patch.to);
    applied.push(patch.name);
    changed = true;
  }
  if (changed) writeFileSync(fullPath, source);
}
console.log(`[patch-native-audio] native players ${applied.length > 0 ? `patched: ${applied.join(", ")}` : "already patched"}.`);
