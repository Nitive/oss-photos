import PhotosList from "../../components/PhotosList"

export default function PhotosListPage() {
  return <PhotosList filter={(photo) => !photo.deleted} />
}
