import exifr from "exifr"
import * as path from "path"
import { Metadata, Photo } from "../types"
import s3, { config } from "./s3"

const metaDataKey = path.join(
  process.env.S3_PREFIX as string,
  "oss-photo",
  "metadata.json"
)

const lockFileKey = path.join(
  process.env.S3_PREFIX as string,
  "oss-photo",
  ".lock"
)

const initialMetaData = {
  generatedAt: "",
  photos: [],
}

export const unlock = () => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: lockFileKey,
      },
      function (err, data) {
        if (err) return reject(err)
        console.info("Lock file removed")
        resolve(data)
      }
    )
  })
}

export const waitWhileLockedThenLock = async () => {
  console.info("Start waiting for lock key disappearing")
  let lockFileExists = true
  while (lockFileExists) {
    lockFileExists = await new Promise<boolean>((resolve) => {
      s3.getObject(
        {
          Bucket: process.env.S3_BUCKET as string,
          Key: lockFileKey,
        },
        function (err: any, data: any) {
          if (err?.code === "NoSuchKey") {
            console.info("Lock key disappeared")
            resolve(false)
          } else if (err) {
            console.error(err)
            resolve(true)
          } else {
            console.log("Lock file exists")
            resolve(true)
          }
        }
      )
    })
    if (lockFileExists) {
      await new Promise((resolve) => {
        console.info("Continue waiting for lock key disappearing")
        setTimeout(() => {
          resolve(true)
        }, 1000)
      })
    }
  }
  console.info("Trying to create lock file")
  const lockFileCreated = await new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: lockFileKey,
        Body: "",
        ContentType: "application/json",
      },
      (err: unknown, data: any) => {
        if (err) {
          console.error(err)
          resolve(false)
          return
        }
        resolve(true)
      }
    )
  })
  if (lockFileCreated) {
    console.info("Lock file created")
  } else {
    console.info("Lock file was not created, lets start from the beginning")
    await waitWhileLockedThenLock()
  }
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
    try {
      s3.getObject(
        {
          Bucket: config.bucket,
          Key: metaDataKey,
        },
        function (err, data) {
          if (err?.code === "NoSuchKey") return resolve(initialMetaData)
          if (err) return reject(err)
          resolve(JSON.parse(data?.Body?.toString() as string))
        }
      )
    } catch (err) {
      reject(err)
    }
  })
}

export const patchPhotos = async (
  overrides: Pick<Photo, "s3Key" | "deleted" | "favorite" | "hidden">[]
) => {
  await waitWhileLockedThenLock()
  try {
    const meta = await getMetaData()
    return uploadNewMetaData({
      ...meta,
      photos: meta.photos.map((photo) => {
        const override = overrides.find((p) => p.s3Key === photo.s3Key)
        return override
          ? {
              ...photo,
              favorite: override.favorite,
              deleted: override.deleted,
              hidden: override.hidden,
            }
          : photo
      }),
    })
  } finally {
    await unlock()
  }
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
              exif: exifrMetaData,
              deleted: false,
              favorite: false,
              hidden: false,
            })
          })
          .catch((err) => {
            console.error(err)
            resolve({
              s3Key,
              s3ETag,
              exif: {},
              deleted: false,
              favorite: false,
              hidden: false,
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
    Body: JSON.stringify({
      ...newMetaData,
      generatedAt: new Date().toISOString(),
    }),
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
    generatedAt: "",
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
      (new Date(b.exif?.DateTimeOriginal || "").getTime() || 0) -
      (new Date(a.exif?.DateTimeOriginal || "").getTime() || 0)
    )
  })
}

export const addPhotosToMetaData = async (photos: Photo[]) => {
  console.info("Start adding photos to meta data")
  console.info("Getting current meta data")
  const currentMetaData = await getMetaData()
  console.info("Uploading new meta data")
  const newMetaData = {
    ...currentMetaData,
    generatedAt: new Date().toISOString(),
    photos: sortPhotos([...currentMetaData.photos, ...photos]),
  }
  await uploadNewMetaData(newMetaData)
  console.info("Finish adding photos to meta data")
  return newMetaData
}

export const generateMetaData = async () => {
  // await unlock()
  // await deleteMetaData()
  console.info("Start generating meta data")
  let newMetaData
  await waitWhileLockedThenLock()
  try {
    console.info("Getting current meta data")
    const currentMetaData = await getMetaData()
    console.info("Getting current objects")
    const objects = await getAllObjects()
    console.info("Generating new meta data")
    newMetaData = await getNewMetaData(currentMetaData, objects)
    console.info("Uploading new meta data")
    await uploadNewMetaData({
      ...newMetaData,
      photos: sortPhotos(newMetaData.photos),
    })
    console.info("Finish generating meta data")
  } finally {
    await unlock()
  }
  return newMetaData
}

const passwordHashKey = path.join(
  process.env.S3_PREFIX as string,
  "oss-photo",
  "password-hash.json"
)

export const uploadPassword = async (passwordHash: string) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET as string,
    Key: passwordHashKey,
    Body: passwordHash,
    ContentType: "application/json",
  }
  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (err: unknown, data: any) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })
}

export const isPassordExists = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: passwordHashKey,
      },
      function (err) {
        if (err?.code === "NoSuchKey")
          return resolve({ isPassordExists: false })
        if (err) return reject(err)
        resolve({ isPassordExists: true })
      }
    )
  })
}

export const getPasswordHash = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: passwordHashKey,
      },
      function (err, data) {
        if (err?.code === "NoSuchKey") return resolve({ passwordHash: null })
        if (err) return reject(err)
        resolve({ passwordHash: data?.Body?.toString() })
      }
    )
  })
}
