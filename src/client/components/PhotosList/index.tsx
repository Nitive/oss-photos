import { useStore } from "@nanostores/preact"
import { useState } from "preact/compat"
import { Photo } from "../../../types"
import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
import { $metaData, $metaDataLoading } from "../../store"
import { PhotoPreview } from "./PhotoPreview"
import css from "./styles.module.scss"

interface OpenPhotoState {
  index: number
  show: boolean
}

export default function PhotosList(props: { filter?: (p: Photo) => boolean }) {
  const { filter } = props
  const metaData = useStore($metaData)
  const metaDataLoading = useStore($metaDataLoading)
  const [openPhoto, setOpenPhoto] = useState(null as OpenPhotoState | null)
  const photos = filter ? metaData.photos.filter(filter) : metaData.photos

  if (metaDataLoading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div className={css.list}>
        {photos.map((photo, i) => (
          <PhotoPreview
            photo={photo}
            index={i}
            setOpenPhoto={setOpenPhoto}
            key={photo.s3Key}
          />
        ))}
      </div>

      {openPhoto && (
        <PhotoPopup openPhoto={openPhoto} setOpenPhoto={setOpenPhoto} />
      )}
    </>
  )
}
