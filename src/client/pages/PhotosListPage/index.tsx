// @ts-ignore
import * as css from "./styles.module.scss"
import { useEffect, useState } from "preact/compat"
import { useStore } from "@nanostores/preact"
import { $settings } from "../../store"

const getPhotos = async ({ endCursor = undefined, limit = 10 } = {}) => {
  return {
    pageInfo: { hasNextPage: true, endCursor: 123 },
    photos: Array.from(Array(limit)).map(() => ({
      preview:
        "https://www.natalieportman.com/wp-content/uploads/2021/08/6F9362C6-8DC9-44A2-8C17-98B8058E075F.jpeg",
      big: "https://www.natalieportman.com/wp-content/uploads/2021/08/6F9362C6-8DC9-44A2-8C17-98B8058E075F.jpeg",
      original:
        "https://www.natalieportman.com/wp-content/uploads/2021/08/6F9362C6-8DC9-44A2-8C17-98B8058E075F.jpeg",
    })),
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
