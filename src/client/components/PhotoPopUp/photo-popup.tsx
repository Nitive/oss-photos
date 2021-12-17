import { useStore } from "@nanostores/preact"
import css from "./styles.module.scss"
import ArrowRight from "../../icons/ArrowRight"
import ArrowLeft from "../../icons/ArrowLeft"
import { CrossIcon } from "../../icons/CrossIcon"
import { getPreview } from "../../utils"
import { $metaData, changeOpenedPhoto, setOpenedPhoto } from "../../store"

export const PhotoPopup = () => {
  const metaData = useStore($metaData)

  return (
    <div className={css.popup}>
      <button
        className={css.popup_close}
        onClick={() => {
          setOpenedPhoto(undefined)
          document.body.classList.remove(css.disable_scroll)
          document.body.style.paddingRight = "0px"
        }}
      >
        <CrossIcon />
      </button>
      <button
        className={css.arrow_left}
        onClick={() => {
          changeOpenedPhoto(-1)
        }}
      >
        <ArrowLeft />
      </button>
      <button
        className={css.arrow_right}
        onClick={() => {
          // const nextPhoto =
          //   openPhoto.index === metaData.photos.length - 1
          //     ? 0
          //     : openPhoto.index + 1
          // setOpenPhoto({ index: nextPhoto, show: false })
          changeOpenedPhoto(+1)
        }}
      >
        <ArrowRight />
      </button>
      <img
        className={css.open_photo}
        src={getPreview(
          metaData.photos[metaData.openedPhoto!].s3Key,
          metaData.gridMode
        )}
        alt=""
      />
    </div>
  )
}
