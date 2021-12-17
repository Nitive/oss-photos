import * as cors from "@koa/cors"
import * as assert from "assert"
import { CronJob } from "cron"
import "dotenv/config"
import exifr from "exifr"
import * as fs from "fs"
import * as Koa from "koa"
import * as koaBody from "koa-body"
import * as Router from "koa-router"
import * as path from "path"
import { Photo } from "../types"
import { decrypt, encrypt } from "./crypt"
import {
  addPhotosToMetaData,
  generateMetaData,
  getMetaData,
  isPassordExists,
  patchPhotos,
  unlock,
  uploadPassword,
  waitWhileLockedThenLock,
} from "./generateMetaData"
import s3, { config } from "./s3"
import { createHash, matchPassword } from "./utils"

const app = new Koa()
const router = new Router()
const MAX_BODY = 5000 * 1024 * 1024 // 5000 MB

function getRandomString(length = 8) {
  let result = ""
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

app.use(cors())
app.use(
  koaBody({
    multipart: true,
    json: true,
    formLimit: MAX_BODY,
    textLimit: MAX_BODY,
    formidable: {
      maxFileSize: MAX_BODY,
      maxFieldsSize: MAX_BODY,
    },
  })
)

router.get("/photos", async (ctx) => {
  const metaData = await getMetaData()
  ctx.body = metaData
})

router.post("/upload", async (ctx: any) => {
  console.info("Start uploading photos")
  await waitWhileLockedThenLock()
  const files = Object.values(ctx.request.files)
  try {
    const filePromises = files.map((file: any) => {
      const { path: filePath, name, type } = file
      const fileContent = fs.readFileSync(filePath)
      const fileName =
        path.parse(name).name + "-" + getRandomString() + path.parse(name).ext
      const key = path.join(config.prefix, fileName)
      return new Promise((resolve) => {
        console.info("Getting metadata from photo", fileName)
        exifr
          .parse(fileContent)
          .then((exifrMetaData) => {
            resolve({
              exif: exifrMetaData,
              deleted: false,
              favorite: false,
            })
          })
          .catch((err) => {
            console.error(err)
            resolve({
              exif: {},
              deleted: false,
              favorite: false,
            })
          })
      }).then((partialPhotoMetadata: any) => {
        console.info("Uploading photo to s3", fileName)
        return new Promise(function (resolve, reject) {
          s3.upload(
            {
              Bucket: config.bucket,
              Key: key,
              Body:
                process.env.ENABLE_ENCRYPTION === "true"
                  ? encrypt(fileContent)
                  : fileContent,
              ContentType: type,
              Metadata: {
                encrypted:
                  process.env.ENABLE_ENCRYPTION === "true" ? "true" : "false",
              },
            },
            function (error: any, data: any) {
              if (error) {
                reject(error)
                return
              }
              resolve({
                ...partialPhotoMetadata,
                encrypted: process.env.ENABLE_ENCRYPTION === "true",
                s3Key: data.Key,
                s3ETag: data.ETag,
              })
              return
            }
          )
        })
      })
    })
    const photos = await Promise.all(filePromises)
    const metaData = await addPhotosToMetaData(photos as Photo[])
    ctx.body = metaData
  } catch (error) {
    console.error(error)
    ctx.body = error
  } finally {
    await unlock()
  }
})

router.patch("/photos/batch", async (ctx) => {
  const { photos } = JSON.parse(ctx.request.body as any)
  assert.ok(Array.isArray(photos), "photos must be an array")

  await patchPhotos(photos)

  ctx.body = { success: true }
})

router.get("/photo", async (ctx) => {
  const { src } = ctx.request.query as any
  if (!src) {
    ctx.status = 400
    ctx.body = "src query param required"
    return
  }

  const data = await new Promise<AWS.S3.GetObjectOutput>((resolve, reject) => {
    s3.getObject(
      {
        Bucket: config.bucket,
        Key: src,
      },
      (err, data) => {
        if (err) return reject(err)
        resolve(data)
      }
    )
  })
  ctx.body =
    data.Metadata?.encrypted === "true"
      ? decrypt(data.Body as Buffer)
      : data.Body
  ctx.header.etag = data.ETag
  ctx.header["cache-control"] = "Cache-Control: max-age=31557600, public"
  ctx.status = 200
})

router.post("/password", async (ctx) => {
  const data = (ctx.request as any).body
  const { password } = JSON.parse(data)
  const hash = createHash(password)
  try {
    await uploadPassword(hash)
    ctx.body = { success: true }
  } catch (e) {
    ctx.body = { success: false, error: e }
  }
})

router.post("/password/change", async (ctx) => {
  const data = (ctx.request as any).body
  const { oldPassword, newPassword } = JSON.parse(data)
  const isRigthPassword = await matchPassword(oldPassword)

  if (isRigthPassword) {
    try {
      const hash = createHash(newPassword)
      await uploadPassword(hash)
      ctx.body = { success: true }
    } catch (e) {
      ctx.body = { success: false, error: e }
    }
  } else {
    ctx.body = { success: false, message: "Old password is incorrect" }
  }
})

router.get("/password", async (ctx) => {
  const passordExists = await isPassordExists()

  ctx.body = {
    status: "OK",
    ...passordExists,
  }
})

router.post("/unlock-photo", async (ctx) => {
  const data = (ctx.request as any).body
  const { password } = JSON.parse(data)
  const isRigthPassword = await matchPassword(password)

  if (isRigthPassword) {
    ctx.body = { success: true }
  } else {
    ctx.body = { success: false, message: "The password is incorrect" }
  }
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
  console.log("Started on https://localhost:3000")
})

generateMetaData()
new CronJob(
  "* * * * *",
  () => {
    generateMetaData()
  },
  null,
  true
)
