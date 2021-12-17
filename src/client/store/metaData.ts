import { atom } from "nanostores"
import { Metadata, Photo } from "../../types"
import { getPreview } from "../utils"

export type Mode = "normal" | "visual"
export type GridMode = "small" | "medium" | "large"
export type Filter = "all" | "favorites" | "deleted"

const filters: { [key in Filter]: (p: Photo) => boolean } = {
  all(photo) {
    return !photo.deleted
  },
  favorites(photo) {
    return photo.favorite
  },
  deleted(photo) {
    return photo.deleted
  },
}

export interface MetadataState extends Metadata {
  selectedPhoto: number | undefined
  selectedPhotos: number[]
  openedPhoto: number | undefined
  mode: Mode
  columns: number
  gridMode: "small" | "medium" | "large"
  filter: Filter
}

export const $metaData = atom<MetadataState>({
  generatedAt: "",
  photos: [],
  openedPhoto: undefined,
  filter: "all",
  selectedPhoto: undefined,
  selectedPhotos: [],
  mode: "normal",
  columns: 10,
  gridMode: "medium",
})
export const $metaDataLoading = atom(true)

let savedMeta = $metaData.get()

export async function changeGridMode(mode: MetadataState["gridMode"]) {
  const columns = (mode === "large" && 5) || (mode === "medium" && 10) || 25
  $metaData.set({ ...$metaData.get(), columns, gridMode: mode })
}

export async function fetchMetaData() {
  $metaDataLoading.set(true)
  const res = await fetch("http://localhost:3000/photos")
  const metaData = await res.json()
  const newState = { ...$metaData.get(), ...metaData }
  savedMeta = newState
  $metaData.set(newState)
  $metaDataLoading.set(false)
}

export function setMetaData(metaData: Metadata) {
  const newState = { ...$metaData.get(), ...metaData }
  savedMeta = newState
  $metaData.set(newState)
}

export function selectPhoto(index: number) {
  const prevState = $metaData.get()
  $metaData.set({
    ...prevState,
    mode: "normal",
    selectedPhoto: index,
    selectedPhotos: [index],
  })
}

export function setFilter(filter: Filter) {
  const prevState = $metaData.get()
  $metaData.set({
    ...prevState,
    filter,
  })
}

export function addPhotoToSelection(index: number) {
  const prevState = $metaData.get()
  $metaData.set({
    ...prevState,
    selectedPhoto: index,
    selectedPhotos: [...prevState.selectedPhotos, index].sort(),
    mode: "visual",
  })
}

export function setFavoritesForPhoto(s3Key: string, favorite: boolean) {
  const prevState = $metaData.get()
  $metaData.set({
    ...prevState,
    photos: prevState.photos.map((photo) => {
      return photo.s3Key === s3Key ? { ...photo, favorite } : photo
    }),
  })
}

export function setOpenedPhoto(i: number | undefined) {
  const prevState = $metaData.get()
  $metaData.set({
    ...prevState,
    openedPhoto: i,
  })
}

export function changeOpenedPhoto(change: number) {
  const prevState = $metaData.get()
  if (!prevState.openedPhoto) return
  $metaData.set({
    ...prevState,
    openedPhoto: prevState.openedPhoto + change,
  })
}

// Subscriptions

function isChanged(a: Photo, b: Photo) {
  if (!a || !b) return false
  return (
    a.favorite !== b.favorite ||
    a.deleted !== b.deleted ||
    a.hidden !== b.hidden
  )
}

$metaData.subscribe((meta) => {
  const changed = meta.photos.filter((p, i) =>
    isChanged(p, savedMeta.photos[i])
  )

  if (changed.length > 0) {
    console.log("Sync", changed)
    patchMetaData({
      photos: changed.map((p) => ({
        s3Key: p.s3Key,
        favorite: p.favorite,
        deleted: p.deleted,
        hidden: p.hidden,
      })),
    })
      .then((data) => {
        console.log("Saved", data)
        savedMeta = meta
      })
      .catch(console.error)
  }
})

export async function patchMetaData(meta: {
  photos: Pick<Photo, "s3Key" | "deleted" | "favorite">[]
}) {
  const res = await fetch("http://localhost:3000/photos/batch", {
    method: "PATCH",
    body: JSON.stringify(meta),
  })
  if (res.status !== 200) {
    console.error(await res.text())
    $metaDataLoading.set(false)
    return
  }
}

// Vim mode

function findAnotherEdge(meta: MetadataState): number {
  if (meta.selectedPhotos.length === 1) {
    return meta.selectedPhotos[0]
  }

  if (meta.selectedPhotos[0] === meta.selectedPhoto) {
    return meta.selectedPhotos.at(-1)!
  }

  return meta.selectedPhotos[0]
}

export function getFiltered(meta: MetadataState): Photo[] {
  return meta.photos.filter(filters[meta.filter])
}

function createMoveHandlers(
  getNewIndex: (i: number, meta: MetadataState) => number
): Binding {
  function getNewSelected(meta: MetadataState): number {
    return Math.min(
      getFiltered(meta).length - 1,
      getNewIndex(meta.selectedPhoto!, meta)
    )
  }

  return {
    normal(meta) {
      if (getFiltered(meta).length === 0) {
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
      if (getFiltered(meta).length === 0) {
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

function toNormalMode(meta: MetadataState): MetadataState {
  return {
    ...meta,
    mode: "normal",
    selectedPhotos:
      typeof meta.selectedPhoto === "number" ? [meta.selectedPhoto] : [],
  }
}

export function toggleFavoritesStatus(meta: MetadataState): MetadataState {
  // If there are at least one not favorite, add it to favorites
  // otherwise remove all selected from favorites
  const shouldAddToFavorites = !meta.selectedPhotos.every(
    (i) => getFiltered(meta)?.[i]?.favorite
  )

  return {
    ...meta,
    photos: meta.photos.map((photo, i) => {
      if (
        meta.selectedPhotos.some(
          (i) => getFiltered(meta)[i].s3Key === photo.s3Key
        )
      ) {
        return { ...photo, favorite: shouldAddToFavorites }
      }
      return photo
    }),
  }
}

export function deleteSelectedPhotos(meta: MetadataState): MetadataState {
  if (meta.selectedPhoto === undefined) return meta
  return {
    ...meta,
    photos: meta.photos.map((photo) => {
      if (meta.selectedPhotos.some((i) => getFiltered(meta)[i] === photo)) {
        return { ...photo, deleted: true }
      }
      return photo
    }),
    selectedPhotos: [meta.selectedPhotos[0]],
    mode: "normal",
  }
}

export function restoreSelectedPhotos(meta: MetadataState): MetadataState {
  if (meta.selectedPhoto === undefined) return meta
  return {
    ...meta,
    photos: meta.photos.map((photo) => {
      if (meta.selectedPhotos.some((i) => getFiltered(meta)[i] === photo)) {
        return { ...photo, deleted: false }
      }
      return photo
    }),
    selectedPhotos: [meta.selectedPhotos[0]],
    mode: "normal",
  }
}

export function toggleHiddenStatus(meta: MetadataState): MetadataState {
  return {
    ...meta,
    photos: meta.photos.map((photo) => {
      if (
        meta.selectedPhotos.some(
          (i) => getFiltered(meta)[i].s3Key === photo.s3Key
        )
      ) {
        return { ...photo, hidden: true }
      }
      return photo
    }),
  }
}

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
    visual: toNormalMode,
  },
  o: {
    visual(meta) {
      return {
        ...meta,
        selectedPhoto: findAnotherEdge(meta),
      }
    },
  },
  f: {
    normal: toggleFavoritesStatus,
    visual: toggleFavoritesStatus,
  },
  x: {
    normal: deleteSelectedPhotos,
    visual: deleteSelectedPhotos,
  },
  d: {
    normal: deleteSelectedPhotos,
    visual: deleteSelectedPhotos,
  },
  r: {
    normal: restoreSelectedPhotos,
    visual: restoreSelectedPhotos,
  },
  q: {
    normal: toggleHiddenStatus,
    visual: toggleHiddenStatus,
  },
}

const keydownBindings: Bindings = {
  ArrowDown: down,
  ArrowUp: up,
  ArrowLeft: left,
  ArrowRight: right,
  Escape: {
    visual: toNormalMode,
  },
  Enter: {
    normal(meta) {
      return {
        ...meta,
        openedPhoto: meta.selectedPhoto,
      }
    },
  },
}

const handleKey = (bindings: Bindings) => (e: KeyboardEvent) => {
  const prevState = $metaData.get()

  const newState = bindings[e.key]?.[prevState.mode]?.(prevState)
  if (newState) $metaData.set(newState)
  if (newState?.selectedPhoto) {
    const photo = getFiltered(newState)[newState.selectedPhoto]
    const photoElement = document.querySelector(
      `[src="${getPreview(photo.s3Key, newState.gridMode)}"]`
    )
    photoElement?.scrollIntoView?.({
      behavior: "smooth",
      block: "center",
      inline: "center",
    })
  }
}

window.addEventListener("keypress", handleKey(keypressBindings))
window.addEventListener("keydown", handleKey(keydownBindings))
