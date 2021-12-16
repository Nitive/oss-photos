import { useEffect, useState } from "preact/compat"
// @ts-ignore
import * as css from "./styles.module.scss"
import { useStore } from "@nanostores/preact"
import { $metaData, $metaDataLoading, fetchMetaData } from "../../store"
import { getPreview } from "./utils"
import { PhotoPopup } from "./photo-popup"
import { PhotoPreview } from "./PhotoPreview"

const makePhotoFavorite = async (id: number, currentLabels: Array<string>) => {
  await fetch(`http://localhost:3000/photos/${id}/label`, {
    method: "PATCH",
    body: JSON.stringify({ labels: [...currentLabels, "favorite"] }),
    headers: {
      "Content-Type": "application/json;utf-8",
    },
  })
}

const deletePhoto = async (key: string) => {
  await fetch(`http://localhost:3000/photos/${encodeURIComponent(key)}`, {
    method: "DELETE",
  })
}

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
