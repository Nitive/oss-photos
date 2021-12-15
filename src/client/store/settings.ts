import { persistentAtom } from "@nanostores/persistent"

export const $settings = persistentAtom(
  "settings",
  {
    s3Key: "",
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function setSettings(settings: any) {
  $settings.set({ ...$settings.get(), ...settings })
}
