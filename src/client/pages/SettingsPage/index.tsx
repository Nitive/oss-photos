// @ts-ignore
import * as css from "./styles.module.scss"
import { useEffect } from "preact/compat"
import { setSettings } from "../../store"

export default function SettingsPage() {
  useEffect(() => {
    setSettings({
      s3Key: Math.random(),
    })
  }, [])
  return (
    <div className={css.page}>
      <h1 className={css.header}>Settings</h1>
      <div className={css.content}>Inputs, Buttons, etc...</div>
    </div>
  )
}
