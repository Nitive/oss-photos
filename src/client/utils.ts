import { GridMode } from "./store"

export function getPreview(s3Key: string, gridMode: GridMode) {
  const size = {
    small: "w:50",
    medium: "w:300",
    large: "w:500",
  }

  return `http://localhost:8080/insecure/${
    size[gridMode]
  }/plain/${encodeURIComponent(
    `http://localhost:3000/photo?src=${encodeURIComponent(s3Key)}`
  )}`
}
