import { useStore } from "@nanostores/preact"
import css from "./styles.module.scss"
import cx from "classnames"
import ArrowRight from "../../icons/ArrowRight"
import ArrowLeft from "../../icons/ArrowLeft"
import { CrossIcon } from "../../icons/CrossIcon"
import { getFullPhoto } from "../../utils"
import {
  $metaData,
  changeOpenedPhoto,
  getFiltered,
  setOpenedPhoto,
} from "../../store"

export const PhotoPopup = () => {
  const metaData = useStore($metaData)

  return (
    <>
      <div className={css.popup}>
        <button
          className={cx(css.popupButton, css.arrow, css.arrow_left)}
          onClick={() => {
            changeOpenedPhoto(-1)
          }}
        >
          <ArrowLeft />
        </button>
        <img
          className={css.open_photo}
          src={getFullPhoto(getFiltered(metaData)[metaData.openedPhoto!].s3Key)}
          alt=""
        />
        <button
          className={cx(css.popupButton, css.arrow, css.arrow_right)}
          onClick={() => {
            changeOpenedPhoto(+1)
          }}
        >
          <ArrowRight />
        </button>
      </div>
      <button
        className={cx(css.popupButton, css.popup_close)}
        onClick={() => {
          setOpenedPhoto(undefined)
          document.body.classList.remove(css.disable_scroll)
        }}
      >
        <CrossIcon />
      </button>
    </>
  )
}
