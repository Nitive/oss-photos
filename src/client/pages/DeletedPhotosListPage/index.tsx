import { useEffect, useState } from "preact/compat"
import { getPreview } from "../utils"
import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
// @ts-ignore
import * as css from "./styles.module.scss"
import { useStore } from "@nanostores/preact"
import {
  $deletedMetaData,
  $deletedMetaDataLoading,
  fetchDeletedMetaData,
} from "../../store"

interface OpenPhotoState {
  index: number
  show: boolean
}

export default function DeletedPhotosListPage() {
  const metaData = useStore($deletedMetaData)
  const metaDataLoading = useStore($deletedMetaDataLoading)
  const [openPhoto, setOpenPhoto] = useState(null as OpenPhotoState | null)

  useEffect(() => {
    fetchDeletedMetaData()
  }, [])

  return (
    <div className={css.page}>
      <h1 className={css.header}>Deleted List</h1>
      {metaDataLoading ? (
        <p>Loading...</p>
      ) : (
        <div className={css.list}>
          {metaData.photos.map((photo, i) => {
            console.log("PHOTO", i)
            return (
              <div
                className={css.item}
                key={photo.s3Key}
                onClick={() => {
                  setOpenPhoto({ index: i, show: false })
                  document.body.classList.add(css.disable_scroll)
                }}
              >
                <img
                  className={css.photo}
                  src={getPreview(photo.s3Key)}
                  alt=""
                />
              </div>
            )
          })}
        </div>
      )}
      {openPhoto && (
        <PhotoPopup openPhoto={openPhoto} setOpenPhoto={setOpenPhoto} />
      )}
    </div>
  )
}
