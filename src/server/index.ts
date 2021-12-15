import * as Koa from "koa"
import * as koaBody from "koa-body"
import * as Router from "koa-router"
import * as cors from "@koa/cors"

const app = new Koa()
const router = new Router()
app.use(koaBody())
app.use(router.routes()).use(router.allowedMethods())
app.use(cors())

router.get("/photos", (ctx, next) => {
  const { limit } = ctx.request.query

  const photos = Array.from(Array(Number(limit))).map(() => ({
    preview:
      "https://www.natalieportman.com/wp-content/uploads/2021/08/6F9362C6-8DC9-44A2-8C17-98B8058E075F.jpeg",
    big: "https://www.natalieportman.com/wp-content/uploads/2021/08/6F9362C6-8DC9-44A2-8C17-98B8058E075F.jpeg",
    original:
      "https://www.natalieportman.com/wp-content/uploads/2021/08/6F9362C6-8DC9-44A2-8C17-98B8058E075F.jpeg",
  }))
  ctx.body = photos
  next()
})

app.listen(3000)
