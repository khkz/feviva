import { describe, expect, it } from "vitest";
import {
  buildRosaryQueue,
  isLastPrayer,
  missingPrayers,
  parseRosaryItemId,
  pickRosaryFiles,
  prayerName,
  prayerTypeForIndex,
  rosaryItemId,
  rosaryStep,
} from "./rosaryQueue";

const urls = {
  padreNuestro: "https://cdn/rosario/padreNuestro.mp3",
  aveMaria: "https://cdn/rosario/aveMaria.mp3",
  gloria: "https://cdn/rosario/gloria.mp3",
};

const gozosos = {
  nombre: "Misterios Gozosos",
  misterios: [1, 2, 3, 4, 5].map((numero) => ({ numero, titulo: `Misterio ${numero}` })),
};

describe("rosary prayers", () => {
  it("maps each bead to its prayer", () => {
    expect(prayerTypeForIndex(0)).toBe("padreNuestro");
    expect(prayerTypeForIndex(1)).toBe("aveMaria");
    expect(prayerTypeForIndex(10)).toBe("aveMaria");
    expect(prayerTypeForIndex(11)).toBe("gloria");
    expect(prayerName(3)).toBe("Ave María (3/10)");
  });

  it("round-trips item ids and rejects foreign ones", () => {
    const id = rosaryItemId("gozosos", { mystery: 4, prayer: 11 });
    expect(parseRosaryItemId(id)).toEqual({ tipo: "gozosos", mystery: 4, prayer: 11 });
    expect(parseRosaryItemId("oracion-123")).toBeNull();
    expect(parseRosaryItemId("rosario:gozosos:5:0")).toBeNull();
    expect(parseRosaryItemId("rosario:gozosos:0:12")).toBeNull();
  });
});

describe("buildRosaryQueue", () => {
  it("queues the whole rosary: 5 decades of Padre Nuestro, 10 Ave Marías and Gloria", () => {
    const queue = buildRosaryQueue("gozosos", gozosos, { mystery: 0, prayer: 0 }, urls);
    expect(queue).toHaveLength(60);
    expect(queue.filter((item) => item.audioUrl === urls.aveMaria)).toHaveLength(50);
    expect(new Set(queue.map((item) => item.id)).size).toBe(60);
    expect(queue[0]).toMatchObject({
      title: "Padre Nuestro",
      subtitle: "Misterios Gozosos · 1.º Misterio 1",
      type: "rosario",
    });
    expect(queue.at(-1)).toMatchObject({ title: "Gloria", subtitle: "Misterios Gozosos · 5.º Misterio 5" });
  });

  it("starts from the current prayer", () => {
    const queue = buildRosaryQueue("gozosos", gozosos, { mystery: 3, prayer: 7 }, urls);
    expect(queue).toHaveLength(12 - 7 + 12);
    expect(parseRosaryItemId(queue[0].id)).toEqual({ tipo: "gozosos", mystery: 3, prayer: 7 });
  });

  it("knows the order and the final prayer", () => {
    expect(rosaryStep({ mystery: 1, prayer: 0 })).toBe(12);
    expect(isLastPrayer({ mystery: 4, prayer: 11 })).toBe(true);
    expect(isLastPrayer({ mystery: 4, prayer: 10 })).toBe(false);
  });
});

describe("pickRosaryFiles", () => {
  // What storage holds today (teachings-audio/rosario, checked 2026-10-12).
  const today = ["aveMaria.opus", "gloria.opus", "padreNuestro.mp3", "padreNuestro.opus"];

  it("prefers MP3 and falls back to Opus where it can play", () => {
    expect(pickRosaryFiles(today, true)).toEqual({
      padreNuestro: "padreNuestro.mp3",
      aveMaria: "aveMaria.opus",
      gloria: "gloria.opus",
    });
  });

  it("never picks Opus for the iOS native player", () => {
    const picked = pickRosaryFiles(today, false);
    expect(picked).toEqual({ padreNuestro: "padreNuestro.mp3" });
    expect(missingPrayers(picked)).toEqual(["aveMaria", "gloria"]);
  });
});
