// @ts-ignore
import * as css from "./styles.module.scss"
import axios from "axios"
import { useEffect, useState } from "preact/compat"
import { useStore } from "@nanostores/preact"
import { $settings } from "../../store"
import HearthIcon from "../../icons/HearthIcon"

const getPhotos = async ({ endCursor = undefined, limit = 10 } = {}) => {
  const { data } = await axios("http://localhost:3000/photos", {
    params: { limit },
  })

  return {
    pageInfo: { hasNextPage: true, endCursor: 123 },
    photos: data,
  }
}

const makePhotoFavorite = async (id: number, currentLabels: Array<string>) => {
  const { data } = await axios(`http://localhost:3000/photos/${id}/label`, {
    method: "PATCH",
    // TODO: labels can be merged on backend
    data: { labels: [...currentLabels, 'favorite'] },
  })
}

export default function PhotosListPage() {
  const settings = useStore($settings)
  const [photos, setPhotos] = useState([] as any)
  const [photosLoading, setPhotosLoading] = useState(true)
  const [pageInfo, setPageInfo] = useState({})
  const [openPhoto, setOpenPhoto]: any = useState(null)

  useEffect(() => {
    setPhotosLoading(true)
    getPhotos().then(({ photos, pageInfo }) => {
      setPhotos(photos)
      setPageInfo(pageInfo)
    })
  }, [])

  return (
    <div className={css.page}>
      <h1 className={css.header}>Photos List</h1>
      <div className={css.list}>
        {openPhoto ? (
          <div className={css.popup}>
            <button
              className={css.popup_close}
              onClick={() => {
                setOpenPhoto(null)
              }}
            >
              <span></span>
              <span></span>
            </button>
            <button
              className={css.arrow_left}
              onClick={() => {
                const nextPhoto =
                  openPhoto.i === 0 ? photos.length - 1 : openPhoto.i - 1
                setOpenPhoto({ i: nextPhoto })
              }}
            >
              <svg
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 306 306"
                style="enable-background:new 0 0 306 306"
                className="arrow_left"
              >
                <g>
                  <g>
                    <polygon
                      points="247.35,35.7 211.65,0 58.65,153 211.65,306 247.35,270.3 130.05,153"
                      fill="#b5b5b5"
                    />
                  </g>
                </g>
              </svg>
            </button>
            <button
              className={css.arrow_right}
              onClick={() => {
                const nextPhoto =
                  openPhoto.i === photos.length - 1 ? 0 : openPhoto.i + 1
                setOpenPhoto({ i: nextPhoto })
              }}
            >
              <svg
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 306 306"
                style="enable-background:new 0 0 306 306"
              >
                <g>
                  <g>
                    <polygon
                      points="58.65,267.75 175.95,153 58.65,35.7 94.35,0 247.35,153 94.35,306"
                      fill="#b5b5b5"
                    />
                  </g>
                </g>
              </svg>
            </button>
            <img
              className={css.open_photo}
              src={photos[openPhoto.i].preview}
              alt=""
            />
          </div>
        ) : (
          photos.map((photo: any, i: any) => {
            return (
              <div
                className={css.item}
                key={photo.id}
                onClick={(e) => {
                  setOpenPhoto({ i })
                }}
              >
                <img className={css.photo} src={photo.preview} alt="" />
                <div onClick={() => makePhotoFavorite(1, [])} className={css.favoriteIcon}>
                  <HearthIcon />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
