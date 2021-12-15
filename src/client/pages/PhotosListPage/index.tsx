// @ts-ignore
import * as css from "./styles.module.scss"
import axios from "axios"
import { useEffect, useState } from "preact/compat"
import { useStore } from "@nanostores/preact"
import { $settings } from "../../store"

const getPhotos = async ({ endCursor = undefined, limit = 10 } = {}) => {
  const { data } = await axios("http://localhost:3000/photos", {
    params: { limit },
  })

  return {
    pageInfo: { hasNextPage: true, endCursor: 123 },
    photos: data,
  }
}

export default function PhotosListPage() {
  const settings = useStore($settings)
  const [photos, setPhotos] = useState([] as any)
  const [photosLoading, setPhotosLoading] = useState(true)
  const [pageInfo, setPageInfo] = useState({})
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
        {photos.map((photo: any, i: any) => (
          <div className={css.item} key={i}>
            <img className={css.photo} src={photo.preview} alt="" />
          </div>
        ))}
      </div>
    </div>
  )
}
