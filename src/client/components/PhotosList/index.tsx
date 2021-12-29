import { useStore } from "@nanostores/preact"
import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
import { $metaData, $metaDataLoading } from "../../store"
import { PhotoPreview } from "./PhotoPreview"
import css from "./styles.module.scss"

export default function PhotosList() {
  const metaData = useStore($metaData)
  const metaDataLoading = useStore($metaDataLoading)

  if (metaDataLoading) {
    return <div class={css.loading}>Loading...</div>
  }

  return (
    <>
      <div className={css.list}>
        {metaData.photos.map((photo, i) => (
          <PhotoPreview photo={photo} index={i} key={photo.s3Key} />
        ))}
      </div>

      {metaData.openedPhoto !== undefined && <PhotoPopup />}
    </>
  )
}
