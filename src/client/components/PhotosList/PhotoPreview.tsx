import { useStore } from "@nanostores/preact"
import cx from "classnames"
import { Photo } from "../../../types"
import popupcss from "../../components/PhotoPopUp/styles.module.scss"
import HeartIcon from "../../icons/HeartIcon"
import {
  $metaData,
  addPhotoToSelection,
  selectPhoto,
  setFavoritesForPhoto,
} from "../../store"
import { getPreview } from "../../utils"
import css from "./styles.module.scss"

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
        [css.selectedPhoto]:
          metaData.mode === "visual" &&
          metaData.selectedPhotos.includes(props.index),
      })}
      onClick={(e) => {
        if (e.shiftKey) {
          addPhotoToSelection(props.index)
        } else {
          selectPhoto(props.index)
        }
      }}
      onDblClick={() => {
        props.setOpenPhoto({ index: props.index, show: false })
        const paddingOffset =
          window.innerWidth - document.body.offsetWidth + "px"
        document.body.style.paddingRight = paddingOffset
        document.body.classList.add(popupcss.disable_scroll)
      }}
    >
      {props.photo?.hidden ? (
        <div className={css.protected}>
          {metaData.gridMode === "small" ? "x" : "Protected photo"}
        </div>
      ) : (
        <img
          className={css.photo}
          src={getPreview(props.photo.s3Key, gridMode)}
          style={{ objectFit: metaData.gridMode === "small" ? "cover" : "fit" }}
          alt=""
        />
      )}
      {metaData.gridMode !== "small" && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setFavoritesForPhoto(props.photo.s3Key, !props.photo.favorite)
          }}
          onDblClick={(e) => e.stopPropagation()}
          className={cx(css.favoriteIcon, {
            [css.filled]: props.photo.favorite,
          })}
        >
          <HeartIcon filled={props.photo.favorite} />
        </button>
      )}
    </div>
  )
}
