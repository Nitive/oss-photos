import { useStore } from "@nanostores/preact"
import { useEffect, useState } from "preact/compat"
import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
import { $metaData, $metaDataLoading, fetchMetaData } from "../../store"
import { PhotoPreview } from "./PhotoPreview"
// @ts-ignore
import * as css from "./styles.module.scss"

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
          {metaData.photos.map((photo: any, i: number) => {
            const preview = (
              <PhotoPreview
                key={photo.s3Key}
                photo={photo}
                index={i}
                setOpenPhoto={setOpenPhoto}
              />
            )
            return preview
          })}
        </div>
      )}

      {openPhoto && (
        <PhotoPopup openPhoto={openPhoto} setOpenPhoto={setOpenPhoto} />
      )}
    </div>
  )
}
