import PhotosList from "../../components/PhotosList"

export default function DeletedPhotosListPage() {
  return <PhotosList filter={(photo: any) => photo.deleted} />
}
