import { atom } from "nanostores"
import { Photo } from "../../types"

export const $metaData = atom({
  generatedAt: "",
  photos: [] as Photo[],
})
export const $deletedMetaData = atom({
  generatedAt: "",
  photos: [] as Photo[],
})
export const $metaDataLoading = atom(true)
export const $deletedMetaDataLoading = atom(true)

export async function fetchMetaData() {
  $metaDataLoading.set(true)
  const res = await fetch("http://localhost:3000/photos")
  const metaData = await res.json()
  $metaData.set(metaData)
  $metaDataLoading.set(false)
}

export async function fetchDeletedMetaData() {
  $deletedMetaDataLoading.set(true)
  const res = await fetch("http://localhost:3000/deleted-photos")
  const metaData = await res.json()
  $deletedMetaData.set(metaData)
  $deletedMetaDataLoading.set(false)
}

export async function setMetaData(metaData: any) {
  $metaData.set(metaData)
}
