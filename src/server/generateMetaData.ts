import s3 from "./s3"
import * as path from "path"
import exifr from "exifr"

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

export const getMetaData = () => {
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

export const deleteMetaData = () => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: metaDataKey,
      },
      function (err, data) {
        if (err) return reject(err)
        resolve(true)
      }
    )
  })
}

const getPhotoMetaData = async (s3Key: any, s3ETag: any) => {
  console.info("Getting photo meta data", s3Key)
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: s3Key,
      },
      function (err: any, data: any) {
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
          .catch((err) => reject(err))
      }
    )
  })
  return {
    width: 1000,
    height: 600,
    s3Key,
    s3ETag,
    createdAt: new Date().toISOString(),
  }
}

const uploadNewMetaData = async (newMetaData: any) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET as string,
    Key: metaDataKey,
    Body: JSON.stringify(newMetaData),
    ContentType: "application/json",
  }
  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (err: any, data: any) => {
      if (err) return reject(err)
      return resolve(true)
    })
  })
}

const getNewMetaData = async (currentMetaData: any, objects: any) => {
  const newMetaData = {
    generatedAt: new Date().toISOString(),
    photos: [] as any,
  }
  for (const object of objects) {
    const currentMetaDataPhoto = currentMetaData.photos.find(
      (photo: any) => photo.s3Key === object.Key
    )
    if (!currentMetaDataPhoto || currentMetaDataPhoto.s3ETag !== object.ETag) {
      const newMetaDataPhoto = await getPhotoMetaData(object.Key, object.ETag)
      newMetaData.photos.push(newMetaDataPhoto)
    } else {
      newMetaData.photos.push(currentMetaDataPhoto)
    }
  }
  return newMetaData
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
  await uploadNewMetaData(newMetaData)
  console.info("Finish generating meta data")
}
