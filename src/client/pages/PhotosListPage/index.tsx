import { useEffect, useState } from "preact/compat"
import HearthIcon from "../../icons/HearthIcon"
// @ts-ignore
import * as css from "./styles.module.scss"
import { useStore } from "@nanostores/preact"
import { $metaData, $metaDataLoading, fetchMetaData } from "../../store"
import ArrowRight from "../../icons/ArrowRight"
import ArrowLeft from "../../icons/ArrowLeft"
import { CrossIcon } from "../../icons/CrossIcon"

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
  await fetch(`http://localhost:3000/photos/${encodeURIComponent(key)}`, { method: "DELETE" })
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

  function getPreview(s3Key: string) {
    return `http://localhost:8080/insecure/rs:fit:300:300/plain/${encodeURIComponent(
      `http://localhost:3000/photo?src=${encodeURIComponent(s3Key)}`
    )}`
  }

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

                <button style={{ position: 'absolute' }} onClick={(event) => {
                  event.stopPropagation();
                  deletePhoto(photo.s3Key)
                }}>delete</button>
              </div>
            )
          })}
        </div>
      )}
      {openPhoto && (
        <div className={css.popup}>
          <button
            className={css.popup_close}
            onClick={() => {
              setOpenPhoto(null)
            }}
          >
            <CrossIcon />
          </button>
          <button
            className={css.arrow_left}
            onClick={() => {
              const nextPhoto =
                openPhoto.index === 0
                  ? metaData.photos.length - 1
                  : openPhoto.index - 1
              setOpenPhoto({ index: nextPhoto, show: false })
            }}
          >
            <ArrowLeft />
          </button>
          <button
            className={css.arrow_right}
            onClick={() => {
              const nextPhoto =
                openPhoto.index === metaData.photos.length - 1
                  ? 0
                  : openPhoto.index + 1
              setOpenPhoto({ index: nextPhoto, show: false })
            }}
          >
            <ArrowRight />
          </button>
          <img
            className={css.open_photo}
            style={{ opacity: openPhoto.show ? 1 : 0 }}
            src={getPreview(metaData.photos[openPhoto.index].s3Key)}
            onLoad={() => setOpenPhoto({ index: openPhoto.index, show: true })}
            alt=""
          />
        </div>
      )}
    </div>
  )
}
