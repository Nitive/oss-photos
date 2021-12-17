import exifr from "exifr"
import * as path from "path"
import { Metadata, Photo } from "../types"
import s3 from "./s3"

const metaDataKey = path.join(
  process.env.S3_PREFIX as string,
  "oss-photo",
  "metadata.json"
)

const initialMetaData = {
  generatedAt: new Date().toISOString(),
  photos: [],
}

const getAllObjects = async () => {
  const objects = []
  let hasNextPage = true
  let ContinuationToken = undefined as any
  while (hasNextPage) {
    const res = await new Promise<any>((resolve, reject) => {
      s3.listObjectsV2(
        {
          Bucket: process.env.S3_BUCKET as string,
          MaxKeys: 1000,
          Prefix: process.env.S3_PREFIX,
          ContinuationToken,
        },
        function (err, data) {
          if (err) return reject(err)
          resolve(data)
        }
      )
    })
    objects.push(
      ...res.Contents.filter((object: any) =>
        ["jpeg", "jpg"].includes(object.Key.split(".").at(-1))
      )
    )
    if (!res.NextContinuationToken) {
      hasNextPage = false
    } else {
      ContinuationToken = res.NextContinuationToken
    }
  }
  return objects
}

export const getMetaData = (): Promise<Metadata> => {
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: metaDataKey,
      },
      function (err, data) {
        if (err?.code === "NoSuchKey") return resolve(initialMetaData)
        if (err) return reject(err)
        resolve(JSON.parse(data?.Body?.toString() as string))
      }
    )
  })
}

export const programmableDeleteObject = async (key: string) => {
  const meta = await getMetaData()
  const photos = meta.photos.map((photo) => {
    return photo.s3Key === key ? { ...photo, deleted: true } : photo
  })

  return uploadNewMetaData({ ...meta, photos })
}

export const makePhotoFavorite = async (key: string) => {
  const meta = await getMetaData()
  const photos = meta.photos.map((photo) => {
    return photo.s3Key === key ? { ...photo, favorite: true } : photo
  })

  return uploadNewMetaData({ ...meta, photos })
}

export const deleteMetaData = () => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: metaDataKey,
      },
      function (err, data) {
        if (err) return reject(err)
        resolve(data)
      }
    )
  })
}

const getPhotoMetaData = async (s3Key: string, s3ETag: string) => {
  console.info("Getting photo meta data", s3Key)
  return new Promise<Photo>((resolve, reject) => {
    s3.getObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: s3Key,
      },
      function (err: unknown, data: any) {
        if (err) return reject(err)
        exifr
          .parse(data?.Body)
          .then((exifrMetaData) => {
            resolve({
              s3Key,
              s3ETag,
              ...exifrMetaData,
            })
          })
          .catch((err) => {
            console.error(err)
            resolve({
              s3Key,
              s3ETag,
            })
          })
      }
    )
  })
}

const uploadNewMetaData = async (newMetaData: Metadata) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET as string,
    Key: metaDataKey,
    Body: JSON.stringify(newMetaData),
    ContentType: "application/json",
  }
  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (err: unknown, data: any) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })
}

const getNewMetaData = async (currentMetaData: Metadata, objects: any) => {
  const newMetaData: Metadata = {
    generatedAt: new Date().toISOString(),
    photos: [],
  }
  for (const object of objects) {
    try {
      const currentMetaDataPhoto = currentMetaData.photos.find(
        (photo) => photo.s3Key === object.Key
      )
      if (
        !currentMetaDataPhoto ||
        currentMetaDataPhoto.s3ETag !== object.ETag
      ) {
        const newMetaDataPhoto = await getPhotoMetaData(object.Key, object.ETag)
        newMetaData.photos.push(newMetaDataPhoto)
      } else {
        newMetaData.photos.push(currentMetaDataPhoto)
      }
    } catch (err) {
      console.error("Bad photo", object, err)
    }
  }
  return newMetaData
}

function sortPhotos(photos: Photo[]): Photo[] {
  return photos.slice().sort((a, b) => {
    return (
      new Date(b.DateTimeOriginal).getTime() -
      new Date(a.DateTimeOriginal).getTime()
    )
  })
}

export const generateMetaData = async () => {
  // await deleteMetaData()
  console.info("Start generating meta data")
  console.info("Getting current meta data")
  const currentMetaData = await getMetaData()
  console.info("Getting current objects")
  const objects = await getAllObjects()
  console.info("Generating new meta data")
  const newMetaData = await getNewMetaData(currentMetaData, objects)
  console.info("Uploading new meta data")
  await uploadNewMetaData({
    ...newMetaData,
    photos: sortPhotos(newMetaData.photos),
  })
  console.info("Finish generating meta data")
  return newMetaData
}
