import { useStore } from "@nanostores/preact"
import cx from "classnames"
import { Photo } from "../../../types"
// @ts-ignore
import * as popupcss from "../../components/PhotoPopUp/styles.module.scss"
import HeartIcon from "../../icons/HeartIcon"
import { $metaData, selectPhoto } from "../../store"
import { getPreview, makePhotoFavorite } from "../../utils"
// @ts-ignore
import * as css from "./styles.module.scss"

interface Props {
  photo: Photo
  index: number
  setOpenPhoto(opts: { index: number; show: boolean }): void
}

export function PhotoPreview(props: Props) {
  const metaData = useStore($metaData)
  return (
    <div
      class={cx(css.item, {
        [css.currentPhoto]: metaData.selectedPhoto === props.index,
        [css.selectedPhoto]: metaData.selectedPhotos.includes(props.index),
      })}
      onClick={(e) => {
        selectPhoto(props.index)
      }}
      onDblClick={(e) => {
        props.setOpenPhoto({ index: props.index, show: false })
        const paddingOffset =
          window.innerWidth - document.body.offsetWidth + "px"
        document.body.style.paddingRight = paddingOffset
        document.body.classList.add(popupcss.disable_scroll)
      }}
    >
      <img className={css.photo} src={getPreview(props.photo.s3Key)} alt="" />
      <button
        onClick={() => makePhotoFavorite(props.photo.s3Key)}
        className={css.favoriteIcon}
      >
        <HeartIcon />
      </button>
      {/*<button
        style={{ position: "absolute" }}
        onClick={(event) => {
          event.stopPropagation()
          deletePhoto(props.photo.s3Key)
        }}
      >
        d
      </button>*/}
    </div>
  )
}
