import { atom } from "nanostores"
import { Metadata, Photo } from "../../types"

export interface MetadataState extends Metadata {
  selectedPhoto: number | undefined
  selectedPhotos: number[]
  mode: Mode
  columns: number
  gridMode: "small" | "medium" | "large"
}

export const $metaData = atom<MetadataState>({
  generatedAt: "",
  photos: [],
  selectedPhoto: undefined,
  selectedPhotos: [],
  mode: "normal",
  columns: 10,
  gridMode: "medium",
})
export const $metaDataLoading = atom(true)

export async function changeGridMode(mode: MetadataState["gridMode"]) {
  const columns = (mode === "large" && 5) || (mode === "medium" && 10) || 25
  $metaData.set({ ...$metaData.get(), columns, gridMode: mode })
}

export async function fetchMetaData() {
  $metaDataLoading.set(true)
  const res = await fetch("http://localhost:3000/photos")
  const metaData = await res.json()
  $metaData.set({ ...$metaData.get(), ...metaData })
  $metaDataLoading.set(false)
}

export async function setMetaData(metaData: Metadata) {
  $metaData.set({ ...$metaData.get(), ...metaData })
}

export async function selectPhoto(index: number) {
  const prevState = $metaData.get()
  $metaData.set({
    ...prevState,
    selectedPhoto: index,
    selectedPhotos: [index],
  })
}

export async function addPhotoToSelection(index: number) {
  const prevState = $metaData.get()
  $metaData.set({
    ...prevState,
    selectedPhoto: index,
    selectedPhotos: [...prevState.selectedPhotos, index].sort(),
    mode: "visual",
  })
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

const down = createMoveHandlers((i, meta) => i + meta.columns)
const up = createMoveHandlers((i, meta) => i - meta.columns)
const left = createMoveHandlers((i) => i - 1)
const right = createMoveHandlers((i) => i + 1)

const keypressBindings: Bindings = {
  0: createMoveHandlers((i, meta) => i - (i % meta.columns)),
  $: createMoveHandlers((i, meta) => i + meta.columns - (i % meta.columns) - 1),
  j: down,
  k: up,
  l: right,
  h: left,
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
  ArrowDown: down,
  ArrowUp: up,
  ArrowLeft: left,
  ArrowRight: right,
}

const handleKey = (bindings: Bindings) => (e: KeyboardEvent) => {
  const prevState = $metaData.get()
  const newState = bindings[e.key]?.[prevState.mode]?.(prevState)
  if (newState) $metaData.set(newState)
}

window.addEventListener("keypress", handleKey(keypressBindings))
window.addEventListener("keydown", handleKey(keydownBindings))
