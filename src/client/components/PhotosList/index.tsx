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

//
// =======
// import { useStore } from "@nanostores/preact"
// import { useEffect, useState } from "preact/compat"
// import { PhotoPopup } from "../../components/PhotoPopUp/photo-popup"
// import { $metaData, $metaDataLoading, fetchMetaData } from "../../store"
// import { PhotoPreview } from "./PhotoPreview"
// // @ts-ignore
// import * as css from "./styles.module.scss"
// import cx from "classnames"
//
// interface OpenPhotoState {
//   index: number
//   show: boolean
// }
//
// export default function PhotosListPage() {
//   const metaData = useStore($metaData)
//   const metaDataLoading = useStore($metaDataLoading)
//   const [openPhoto, setOpenPhoto] = useState(null as OpenPhotoState | null)
//
//   useEffect(() => {
//     fetchMetaData()
//   }, [])
//
//   if (metaDataLoading) {
//     return (
//       <div className={css.page}>
//         <p>Loading...</p>
//       </div>
//     )
//   }
//
//   return (
//       <div className={css.page}>
//         <div className={cx([css.list])}>
//           {metaData.photos.map((photo: any, i: number) => {
//             return (
//               <div
//                 class={cx({
//                   [css.currentPhoto]: metaData.selectedPhoto === i,
//                   [css.selectedPhoto]: metaData.selectedPhotos.includes(i),
//                 })}
//               >
//                 <PhotoPreview
//                   key={photo.s3Key}
//                   photo={photo}
//                   index={i}
//                   setOpenPhoto={setOpenPhoto}
//                 />
//               </div>
//             )
//           })}
//         </div>
//
//         {openPhoto && (
//           <PhotoPopup openPhoto={openPhoto} setOpenPhoto={setOpenPhoto} />
//         )}
//       </div>
//     )
