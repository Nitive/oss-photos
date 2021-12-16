// @ts-ignore
import * as css from "./styles.module.scss"
import type { ComponentChildren } from "preact"
import SideBar from "./Sidebar"
import Header from "./Header"

export default function Layout(props: { children: ComponentChildren }) {
  return (
    <>
      <Header />
      <div className={css.layout}>
        <SideBar />
        <div className={css.content}>{props.children}</div>
      </div>
    </>
  )
}
