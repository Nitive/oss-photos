import { useEffect, useState } from "preact/compat"
import HearthIcon from "../../icons/HearthIcon"
// @ts-ignore
import * as css from "./styles.module.scss"
import { useStore } from "@nanostores/preact"
import { $metaData, $metaDataLoading, fetchMetaData } from "../../store"
import { getPreview } from "./getPhoto"
import { PhotoPopup } from "./photo-popup"

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
      <h1 className={css.header}>Photos List</h1>
      {metaDataLoading ? (
        <p>Loading...</p>
      ) : (
        <div className={css.list}>
          {metaData.photos.map((photo, i) => {
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
                <div
                  onClick={() => makePhotoFavorite(1, [])}
                  className={css.favoriteIcon}
                >
                  <HearthIcon />
                </div>

                <button
                  style={{ position: "absolute" }}
                  onClick={(event) => {
                    event.stopPropagation()
                    deletePhoto(photo.s3Key)
                  }}
                >
                  delete
                </button>
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
