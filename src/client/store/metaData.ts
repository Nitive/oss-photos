import { atom } from "nanostores"
import { Photo } from "../../types"

export const $metaData = atom({
  generatedAt: "",
  photos: [] as Photo[],
})
export const $metaDataLoading = atom(true)

export async function fetchMetaData() {
  $metaDataLoading.set(true)
  const res = await fetch("http://localhost:3000/photos")
  const metaData = await res.json()
  $metaData.set(metaData)
  $metaDataLoading.set(false)
}
