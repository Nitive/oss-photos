export function getPreview(s3Key: string) {
  return `http://localhost:8080/insecure/rs:fit:50:50/plain/${encodeURIComponent(
    `http://localhost:3000/photo?src=${encodeURIComponent(s3Key)}`
  )}`
}

export const makePhotoFavorite = async (id: string) => {
  await fetch(`http://localhost:3000/photos/${id}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;utf-8",
    },
  })
}

export const deletePhoto = async (key: string) => {
  await fetch(`http://localhost:3000/photos/${encodeURIComponent(key)}`, {
    method: "DELETE",
  })
}