import css from "./styles.module.scss"
import { useRef, useState } from "preact/hooks"
import { setMetaData } from "../../store"
import cn from "classnames"
import Img from "../../icons/Img"
import UploadIcon from "../../icons/UploadIcon"

export default function Upload() {
  const inputEl = useRef(null as any)
  const [loading, setLoading] = useState(false)
  return (
    <label
      className={cn({
        [css.button]: true,
        [css.disabled]: loading,
      })}
      onClick={(e) => {
        if (loading) e.preventDefault()
      }}
    >
      <input
        className={css.input}
        type="file"
        multiple
        disabled={loading}
        ref={(el) => (inputEl.current = el)}
        onChange={async ({ target: { files } }) => {
          setLoading(true)
          try {
            const formData = new FormData()
            for (let i = 0; i < files.length; i++) {
              formData.append(files[i].name, files[i])
            }
            const res = await fetch("http://localhost:3000/upload", {
              method: "POST",
              body: formData,
            })
            const newMetaData = await res.json()
            setMetaData(newMetaData)
          } catch (err) {
            console.error(err)
          } finally {
            setLoading(false)
            inputEl.current.value = ""
          }
        }}
      />
      <UploadIcon /> {loading ? "Uploading..." : "Upload"}
    </label>
  )
}
