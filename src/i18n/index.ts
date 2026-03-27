import { NativeModules, Platform } from "react-native";
import { en } from "./en";
import { tr } from "./tr";

type TranslationMap = typeof en;
type NestedKeyOf<T, Prefix extends string = ""> = T extends Record<
  string,
  unknown
>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationMap>;

const translations: Record<string, TranslationMap> = { en, tr };

function getDeviceLocale(): string {
  const locale =
    Platform.OS === "ios"
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier;
  return locale?.split("_")[0] ?? "en";
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function t(
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const locale = getDeviceLocale();
  const map = translations[locale] ?? translations.en;
  let value = getNestedValue(map as unknown as Record<string, unknown>, key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{{${k}}}`, String(v));
    }
  }
  return value;
}
