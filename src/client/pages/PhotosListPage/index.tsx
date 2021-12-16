import { useEffect, useState } from "preact/compat"
// @ts-ignore
import * as css from "./styles.module.scss"
import { useStore } from "@nanostores/preact"
import { $metaData, $metaDataLoading, fetchMetaData } from "../../store"
import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
import { PhotoPreview } from "./PhotoPreview"

interface OpenPhotoState {
  index: number
  show: boolean
}

export default function PhotosListPage() {
  const metaData = useStore($metaData)
  const metaDataLoading = useStore($metaDataLoading)
  const [openPhoto, setOpenPhoto] = useState(null as OpenPhotoState | null)

  useEffect(() => {
    fetchMetaData()
  }, [])

  return (
    <div className={css.page}>
      {metaDataLoading ? (
        <p>Loading...</p>
      ) : (
        <div className={css.list}>
          {metaData.photos.map((photo, i) => (
            <PhotoPreview photo={photo} index={i} setOpenPhoto={setOpenPhoto} />
          ))}
        </div>
      )}
      {openPhoto && (
        <PhotoPopup openPhoto={openPhoto} setOpenPhoto={setOpenPhoto} />
      )}
    </div>
  )
}
