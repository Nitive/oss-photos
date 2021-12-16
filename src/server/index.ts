import 'dotenv/config'
import * as Koa from "koa"
import * as koaBody from "koa-body"
import * as Router from "koa-router"
import * as cors from "@koa/cors"
import { CronJob } from "cron"
import { generateMetaData, getMetaData } from "./generateMetaData"

const app = new Koa()
const router = new Router()
app.use(koaBody())
app.use(router.routes()).use(router.allowedMethods())
app.use(cors())

router.get("/photos", async (ctx: any, next: any) => {
  const metaData = await getMetaData()
  ctx.body = metaData
  next()
})

app.listen(3000)

generateMetaData()
new CronJob(
  "* * * * *",
  () => {
    generateMetaData()
  },
  null,
  true
)
