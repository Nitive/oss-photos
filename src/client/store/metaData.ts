import { atom } from "nanostores"
import { Metadata, Photo } from "../../types"

interface MetadataState extends Metadata {
  selectedPhotos: string[]
  columns: number
}

export const $metaData = atom<MetadataState>({
  generatedAt: "",
  photos: [],
  selectedPhotos: [],
  columns: 25,
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
  $metaData.set({ ...$metaData.get(), ...metaData })
  $metaDataLoading.set(false)
}

export async function fetchDeletedMetaData() {
  $deletedMetaDataLoading.set(true)
  const res = await fetch("http://localhost:3000/deleted-photos")
  const metaData = await res.json()
  $deletedMetaData.set(metaData)
  $deletedMetaDataLoading.set(false)
}

// Vim mode

type Mode = "normal" | "visual"

const $mode = atom("normal" as Mode)

const bindings: {
  [key: string]: { [key in Mode]?: (state: MetadataState) => MetadataState }
} = {
  j: {
    // Move to photo below
    normal(meta) {
      if (meta.photos.length === 0) {
        return { ...meta, selectedPhotos: [] }
      }
      if (meta.selectedPhotos.length === 0) {
        return { ...meta, selectedPhotos: [meta.photos[0].s3Key] }
      }
      if (meta.selectedPhotos.length === 1) {
        const findIndex = meta.photos.findIndex(
          (p) => p.s3Key === meta.selectedPhotos[0]
        )
        const newIndex = meta.photos[findIndex + meta.columns].s3Key
        return {
          ...meta,
          selectedPhotos: newIndex ? [newIndex] : [],
        }
      }
      return meta
    },
  },
  k: {
    // Move to photo below
    normal(meta) {
      if (meta.photos.length === 0) {
        return { ...meta, selectedPhotos: [] }
      }
      if (meta.selectedPhotos.length === 0) {
        return { ...meta, selectedPhotos: [meta.photos[0].s3Key] }
      }
      if (meta.selectedPhotos.length === 1) {
        const findIndex = meta.photos.findIndex(
          (p) => p.s3Key === meta.selectedPhotos[0]
        )
        const newIndex = meta.photos[findIndex - meta.columns].s3Key
        return {
          ...meta,
          selectedPhotos: newIndex ? [newIndex] : [],
        }
      }
      return meta
    },
  },
  l: {
    // Move to photo on the right
    normal(meta) {
      if (meta.photos.length === 0) {
        return { ...meta, selectedPhotos: [] }
      }
      if (meta.selectedPhotos.length === 0) {
        return { ...meta, selectedPhotos: [meta.photos[0].s3Key] }
      }
      if (meta.selectedPhotos.length === 1) {
        const findIndex = meta.photos.findIndex(
          (p) => p.s3Key === meta.selectedPhotos[0]
        )
        const newIndex = meta.photos[findIndex + 1].s3Key
        return {
          ...meta,
          selectedPhotos: newIndex ? [newIndex] : [],
        }
      }
      return meta
    },
  },
  h: {
    // Move to photo on the left
    normal(meta) {
      if (meta.photos.length === 0) {
        return { ...meta, selectedPhotos: [] }
      } else if (meta.selectedPhotos.length === 0) {
        return { ...meta, selectedPhotos: [meta.photos[0].s3Key] }
      } else if (meta.selectedPhotos.length === 1) {
        const findIndex = meta.photos.findIndex(
          (p) => p.s3Key === meta.selectedPhotos[0]
        )
        const newIndex = meta.photos[findIndex - 1].s3Key
        return {
          ...meta,
          selectedPhotos: newIndex ? [newIndex] : [],
        }
      }
      return meta
    },
  },
}

window.addEventListener("keypress", (e) => {
  const newState = bindings[e.key]?.[$mode.get()]?.($metaData.get())
  newState && $metaData.set(newState)
})
