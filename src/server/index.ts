import * as cors from "@koa/cors"
import { CronJob } from "cron"
import "dotenv/config"
import * as Koa from "koa"
import * as koaBody from "koa-body"
import * as Router from "koa-router"
import {
  generateMetaData,
  getMetaData,
  makePhotoFavorite,
  programmableDeleteObject,
} from "./generateMetaData"
import s3, { config } from "./s3"
import * as path from "path"
import * as fs from "fs"

const app = new Koa()
const router = new Router()

app.use(cors())
app.use(koaBody({ multipart: true }))

router.get("/photos", async (ctx) => {
  const metaData = await getMetaData()
  ctx.body = {
    ...metaData,
    photos: metaData.photos.filter((photo) => !photo.deleted),
  }
})

router.get("/deleted-photos", async (ctx) => {
  const metaData = await getMetaData()
  ctx.body = {
    ...metaData,
    photos: metaData.photos.filter((photo) => photo.deleted),
  }
})

router.post("/upload", async (ctx: any) => {
  const files = Object.values(ctx.request.files)
  try {
    const filePromises = files.map((file: any) => {
      const { path: filePath, name, type } = file
      const body = fs.createReadStream(filePath)
      const key = path.join(config.prefix, name)
      const params = {
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: type,
      }
      return new Promise(function (resolve, reject) {
        s3.upload(params, function (error: any, data: any) {
          if (error) {
            reject(error)
            return
          }
          console.log(data)
          resolve(data)
          return
        })
      })
    })
    const res = await Promise.all(filePromises)
    console.log(123, res)
    const metaData = await generateMetaData()
    ctx.body = metaData
  } catch (error) {
    console.error(error)
    ctx.body = error
  }
})

router.post("/photos/:id/favorite", async (ctx, next) => {
  const { id } = (ctx.request as any).params as { id: string }
  await makePhotoFavorite(id)

  ctx.body = { success: true }
  next()
})

router.delete("/photos/:id", async (ctx, next) => {
  const { id } = (ctx.request as any).params as { id: string }
  await programmableDeleteObject(id)

  ctx.body = { success: true }
  next()
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
  ctx.body = data.Body
  ctx.header.etag = data.ETag
  ctx.header["cache-control"] = "Cache-Control: max-age=31557600, public"
  ctx.status = 200
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
