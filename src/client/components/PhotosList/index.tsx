import { useStore } from "@nanostores/preact"
import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
import { $metaData, $metaDataLoading, getFiltered } from "../../store"
import { PhotoPreview } from "./PhotoPreview"
import css from "./styles.module.scss"

export default function PhotosList() {
  const metaData = useStore($metaData)
  const metaDataLoading = useStore($metaDataLoading)
  const photos = getFiltered(metaData)

  if (metaDataLoading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div className={css.list}>
        {photos.map((photo, i) => (
          <PhotoPreview photo={photo} index={i} key={photo.s3Key} />
        ))}
      </div>

      {metaData.openedPhoto !== undefined && <PhotoPopup />}
    </>
  )
}
