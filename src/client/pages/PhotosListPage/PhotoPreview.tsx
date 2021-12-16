import { Photo } from "../../../types"
import HeartIcon from "../../icons/HeartIcon"
// @ts-ignore
import * as css from "./styles.module.scss"
import { deletePhoto, getPreview, makePhotoFavorite } from "./utils"

interface Props {
  photo: Photo
  index: number
  setOpenPhoto(opts: { index: number; show: boolean }): void
}

export function PhotoPreview(props: Props) {
  return (
    <div
      className={css.item}
      key={props.photo.s3Key}
      onClick={() => {
        props.setOpenPhoto({ index: props.index, show: false })
        const paddingOffset =
          window.innerWidth - document.body.offsetWidth + "px"
        document.body.style.paddingRight = paddingOffset
        document.body.classList.add(css.disable_scroll)
      }}
    >
      <img className={css.photo} src={getPreview(props.photo.s3Key)} alt="" />
      <button
        onClick={() => makePhotoFavorite(1, [])}
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
