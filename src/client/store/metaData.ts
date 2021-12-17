import { atom } from "nanostores"
import { Metadata, Photo } from "../../types"

interface MetadataState extends Metadata {
  selectedPhoto: number | undefined
  selectedPhotos: number[]
  mode: Mode
  columns: number
}

export const $metaData = atom<MetadataState>({
  generatedAt: "",
  photos: [],
  selectedPhoto: undefined,
  selectedPhotos: [],
  mode: "normal",
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

export async function setMetaData(metaData: any) {
  $metaData.set({ ...$metaData.get(), ...metaData })
}

// Vim mode

type Mode = "normal" | "visual"

function findAnotherEdge(meta: MetadataState): number {
  if (meta.selectedPhotos.length === 1) {
    return meta.selectedPhotos[0]
  }

  if (meta.selectedPhotos[0] === meta.selectedPhoto) {
    return meta.selectedPhotos.at(-1)!
  }

  return meta.selectedPhotos[0]
}

function createMoveHandlers(
  getNewIndex: (i: number, meta: MetadataState) => number
): Binding {
  function getNewSelected(meta: MetadataState): number {
    return Math.min(
      meta.photos.length - 1,
      getNewIndex(meta.selectedPhoto!, meta)
    )
  }

  return {
    normal(meta) {
      if (meta.photos.length === 0) {
        return { ...meta, selectedPhotos: [], selectedPhoto: undefined }
      }

      if (typeof meta.selectedPhoto === "number") {
        const newSelected = getNewSelected(meta)
        return {
          ...meta,
          selectedPhoto: newSelected,
          selectedPhotos: typeof newSelected === "number" ? [newSelected] : [],
        }
      }

      return { ...meta, selectedPhotos: [0], selectedPhoto: 0 }
    },
    visual(meta) {
      if (meta.photos.length === 0) {
        return { ...meta, selectedPhotos: [], selectedPhoto: undefined }
      }

      if (typeof meta.selectedPhoto === "number") {
        const newSelected = getNewSelected(meta)
        if (!newSelected) {
          return meta
        }

        const side1 = findAnotherEdge(meta)
        const side2 = newSelected
        const start = Math.min(side1, side2)
        const end = Math.max(side1, side2)
        const selectedPhotos = Array.from({ length: end - start + 1 }).map(
          (_, i) => start + i
        )

        return {
          ...meta,
          selectedPhoto: newSelected,
          selectedPhotos,
        }
      }

      return meta
    },
  }
}

type Binding = {
  [key in Mode]?: (state: MetadataState) => MetadataState
}

interface Bindings {
  [key: string]: Binding
}

const keypressBindings: Bindings = {
  0: createMoveHandlers((i, meta) => i - (i % meta.columns)),
  $: createMoveHandlers((i, meta) => i + meta.columns - (i % meta.columns) - 1),
  j: createMoveHandlers((i, meta) => i + meta.columns),
  k: createMoveHandlers((i, meta) => i - meta.columns),
  l: createMoveHandlers((i) => i + 1),
  h: createMoveHandlers((i) => i - 1),
  v: {
    normal(meta) {
      return { ...meta, mode: "visual" }
    },
    visual(meta) {
      return {
        ...meta,
        mode: "normal",
        selectedPhotos:
          typeof meta.selectedPhoto === "number" ? [meta.selectedPhoto] : [],
      }
    },
  },
  o: {
    visual(meta) {
      return {
        ...meta,
        selectedPhoto: findAnotherEdge(meta),
      }
    },
  },
}

const keydownBindings: Bindings = {
  // Escape: {},
}

const handleKey = (bindings: Bindings) => (e: KeyboardEvent) => {
  const prevState = $metaData.get()
  const newState = bindings[e.key]?.[prevState.mode]?.(prevState)
  if (newState) $metaData.set(newState)
}

window.addEventListener("keypress", handleKey(keypressBindings))
window.addEventListener("keydown", handleKey(keydownBindings))
