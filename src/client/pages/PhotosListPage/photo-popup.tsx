import { useStore } from "@nanostores/preact"
import ArrowLeft from "../../icons/ArrowLeft"
import ArrowRight from "../../icons/ArrowRight"
import { CrossIcon } from "../../icons/CrossIcon"
import { $metaData } from "../../store"
// @ts-ignore
import * as css from "./styles.module.scss"
import { getPreview } from "./utils"

export const PhotoPopup = ({ openPhoto, setOpenPhoto }: any) => {
  const metaData = useStore($metaData)

  return (
    <div className={css.popup}>
      <button
        className={css.popup_close}
        onClick={() => {
          setOpenPhoto(null)
          document.body.classList.remove(css.disable_scroll)
          document.body.style.paddingRight = "0px"
        }}
      >
        <CrossIcon />
      </button>
      <button
        className={css.arrow_left}
        onClick={() => {
          const nextPhoto =
            openPhoto.index === 0
              ? metaData.photos.length - 1
              : openPhoto.index - 1
          setOpenPhoto({ index: nextPhoto, show: false })
        }}
      >
        <ArrowLeft />
      </button>
      <button
        className={css.arrow_right}
        onClick={() => {
          const nextPhoto =
            openPhoto.index === metaData.photos.length - 1
              ? 0
              : openPhoto.index + 1
          setOpenPhoto({ index: nextPhoto, show: false })
        }}
      >
        <ArrowRight />
      </button>
      <img
        className={css.open_photo}
        style={{ opacity: openPhoto.show ? 1 : 0 }}
        src={getPreview(metaData.photos[openPhoto.index].s3Key)}
        onLoad={() => setOpenPhoto({ index: openPhoto.index, show: true })}
        alt=""
      />
    </div>
  )
}
