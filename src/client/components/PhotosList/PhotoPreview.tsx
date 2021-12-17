import { useStore } from "@nanostores/preact"
import cx from "classnames"
import { Photo } from "../../../types"
// @ts-ignore
import * as popupcss from "../../components/PhotoPopUp/styles.module.scss"
import HeartIcon from "../../icons/HeartIcon"
import { $metaData, addPhotoToSelection, selectPhoto } from "../../store"
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
  const { gridMode, columns } = metaData
  const sidebarWidth = 290
  const width = document.body.offsetWidth - sidebarWidth

  return (
    <div
      style={{
        width: width / columns - (gridMode === "small" ? 0 : 10),
        height: width / columns,
        margin: metaData.gridMode === "small" ? null : "5px 5px",
      }}
      class={cx(css.item, {
        [css.currentPhoto]: metaData.selectedPhoto === props.index,
        [css.selectedPhoto]: metaData.selectedPhotos.includes(props.index),
      })}
      onClick={(e) => {
        if (e.shiftKey) {
          addPhotoToSelection(props.index)
        } else {
          selectPhoto(props.index)
        }
      }}
      onDblClick={(e) => {
        props.setOpenPhoto({ index: props.index, show: false })
        const paddingOffset =
          window.innerWidth - document.body.offsetWidth + "px"
        document.body.style.paddingRight = paddingOffset
        document.body.classList.add(popupcss.disable_scroll)
      }}
    >
      <img
        className={css.photo}
        src={
          Math.random() > 0.5
            ? "https://via.placeholder.com/1900x1080"
            : "https://via.placeholder.com/1080x1900"
        }
        alt=""
      />
      <button
        onClick={() => makePhotoFavorite(props.photo.s3Key)}
        className={css.favoriteIcon}
      >
        <HeartIcon />
      </button>
      {/*<button getPreview(props.photo.s3Key)
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
