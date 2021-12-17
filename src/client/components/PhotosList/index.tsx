import { useStore } from "@nanostores/preact"
import { useEffect, useState } from "preact/compat"
import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
import { $metaData, $metaDataLoading, fetchMetaData } from "../../store"
import { PhotoPreview } from "./PhotoPreview"
// @ts-ignore
import * as css from "./styles.module.scss"
import { Photo } from "../../../types"

interface OpenPhotoState {
  index: number
  show: boolean
}

export default function PhotosList({
  filter,
}: {
  filter?: (p: Photo) => boolean
}) {
  const metaData = useStore($metaData)
  const metaDataLoading = useStore($metaDataLoading)
  const [openPhoto, setOpenPhoto] = useState(null as OpenPhotoState | null)
  const photos = filter ? metaData.photos.filter(filter) : metaData.photos

  return metaDataLoading ? (
    <p>Loading...</p>
  ) : (
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
