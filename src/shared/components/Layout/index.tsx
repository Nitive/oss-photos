// @ts-ignore
import * as css from "./styles.module.scss"
import { Link } from "wouter-preact"
import type { ComponentChildren } from "preact"

export default function Layout(props: { children: ComponentChildren }) {
  return (
    <div className={css.layout}>
      <div className={css.sidebar}>
        <div className={css.logo}>OSS Photos</div>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link href="/">Photos List</Link>
          </li>
          <li className={css.item}>
            <Link href="/settings">Settings</Link>
          </li>
        </ul>
      </div>
      <div className={css.content}>{props.children}</div>
    </div>
  )
}
