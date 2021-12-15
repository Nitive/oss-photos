// @ts-ignore
import * as css from "./styles.module.scss"
import { useEffect } from "preact/compat"
import { useStore } from "@nanostores/preact"
import { $settings } from "../../store"

export default function PhotosListPage() {
  const settings = useStore($settings)
  useEffect(() => {
    console.log(settings)
  }, [])
  return (
    <div className={css.page}>
      <h1 className={css.header}>Photos List</h1>
      <div className={css.list}></div>
    </div>
  )
}
