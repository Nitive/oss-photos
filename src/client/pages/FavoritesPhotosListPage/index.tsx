import PhotosList from "../../components/PhotosList"

export default function FavoritesListPage() {
  return <PhotosList filter={(photo: any) => photo.favorite} />
}
