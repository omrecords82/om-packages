import { describe, expect, it } from "vitest";

import {
  CURRENT_THEME_SCHEMA_VERSION,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  LITURGICAL_COLORS,
  THEME_LAYER_ORDER
} from "./index.js";

describe("@om/contracts phase 1a exports", () => {
  it("exports the explicit serialized schema version", () => {
    expect(CURRENT_THEME_SCHEMA_VERSION).toBe(1);
  });

  it("exports the required permanent theme layer order", () => {
    expect(THEME_LAYER_ORDER).toEqual([
      "om-defaults",
      "application-defaults",
      "brand-pack",
      "liturgical-overlay",
      "accessibility-preferences"
    ]);
  });

  it("exports all seven liturgical colors", () => {
    expect(LITURGICAL_COLORS).toEqual(["white", "gold", "green", "purple", "red", "blue", "black"]);
  });

  it("defaults accessibility to final usability-preserving preferences", () => {
    expect(DEFAULT_ACCESSIBILITY_PREFERENCES).toEqual({
      contrast: "standard",
      motion: "standard",
      textScale: "standard",
      focusVisibility: "standard",
      colorIndependentStatus: true
    });
  });
});
