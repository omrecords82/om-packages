import type { JsonObject } from "./json.js";
import type { LiturgicalThemeMode } from "./liturgical.js";
import type { ThemeSchemaVersion } from "./schema-version.js";
import type { ColorScheme, LayoutDensity, ThemeMode } from "./theme.js";
import type { TokenReference } from "./tokens.js";

export type BrandAssetKind =
  "primary-logo" | "alternate-logo" | "seal" | "favicon" | "social-preview";

export type BrandAssetReference = {
  readonly kind: BrandAssetKind;
  readonly src: string;
  readonly alt?: string;
  readonly mediaType?: string;
  readonly width?: number;
  readonly height?: number;
};

export type PostalAddress = {
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly region: string;
  readonly postalCode: string;
  readonly countryCode: string;
};

export type BrandIdentity = {
  readonly id: string;
  readonly fullChurchName: string;
  readonly shortChurchName?: string;
  readonly jurisdiction?: string;
  readonly address?: PostalAddress;
  readonly parishWebsite?: string;
  readonly extensions?: JsonObject;
};

export type BrandOverrideToken =
  | "semantic.action.accent"
  | "semantic.border.decorative"
  | "component.header.accent"
  | "component.footer.accent"
  | "component.navigation.activeIndicator";

export type BrandTokenOverrides = Partial<Record<BrandOverrideToken, TokenReference>>;

export type BrandPack = {
  readonly schemaVersion: ThemeSchemaVersion;
  readonly id: string;
  readonly version: string;
  readonly identity: BrandIdentity;
  readonly assets?: readonly BrandAssetReference[];
  readonly typographyPresetId?: string;
  readonly headerPresetId?: string;
  readonly footerPresetId?: string;
  readonly layoutDensity: LayoutDensity;
  readonly supportedColorSchemes: readonly ColorScheme[];
  readonly tokenOverrides?: BrandTokenOverrides;
  readonly liturgicalMode: LiturgicalThemeMode;
  readonly extensions?: JsonObject;
};

export type ApplicationOverrideToken = BrandOverrideToken;

export type ApplicationThemeDefaults = {
  readonly applicationId: string;
  readonly defaultThemeMode: ThemeMode;
  readonly supportedColorSchemes: readonly ColorScheme[];
  readonly defaultLayoutDensity: LayoutDensity;
  readonly defaultLiturgicalMode: LiturgicalThemeMode;
  readonly tokenOverrides?: Partial<Record<ApplicationOverrideToken, TokenReference>>;
  readonly extensions?: JsonObject;
};
