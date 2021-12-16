export function getPreview(s3Key: string) {
  return `http://localhost:8080/insecure/rs:fit:300:300/plain/${encodeURIComponent(
    `http://localhost:3000/photo?src=${encodeURIComponent(s3Key)}`
  )}`
}
