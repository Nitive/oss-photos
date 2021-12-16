import * as cors from "@koa/cors"
import { CronJob } from "cron"
import "dotenv/config"
import * as Koa from "koa"
import * as koaBody from "koa-body"
import * as Router from "koa-router"
import { generateMetaData, getMetaData, programmableDeleteObject } from "./generateMetaData"
import s3, { config } from "./s3"

const app = new Koa()
const router = new Router()

app.use(cors())
app.use(koaBody())
app.use(router.routes()).use(router.allowedMethods())

router.get("/photos", async (ctx) => {
  const metaData = await getMetaData()
  ctx.body = { ...metaData, photos: metaData.photos.filter(photo => !photo.deleted) }
})

router.patch("/photos/:id/label", (ctx, next) => {
  const { id } = (ctx.request as any).params as { id: string }
  const { labels } = ctx.request.body

  ctx.body = { success: true }
  next()
})

router.delete("/photos/:id", async (ctx, next) => {
  const { id } = (ctx.request as any).params as { id: string }
  await programmableDeleteObject(id);

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
