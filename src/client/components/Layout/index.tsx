// @ts-ignore
import * as css from "./styles.module.scss"
import { Link } from "wouter-preact"
import { useEffect, useState } from "preact/hooks"
import type { ComponentChildren } from "preact"
import FillHeartIcon from "../../icons/FillHeartIcon"

const headerButtons = ["Small", "Medium", "Large"]

export default function Layout(props: { children: ComponentChildren }) {
  const [photoSize, setPhotoSize] = useState("Small")

  return (
    <>
      <header className={css.header}>
        <h1 className={css.header_title}>OSS Photos</h1>
        <div className={css.header_right}>
          <div className={css.header_btns}>
            {headerButtons.map((button) => {
              const btnClass =
                photoSize === button
                  ? `${css.header_btn} ${css.btn_border}`
                  : css.header_btn
              return (
                <button
                  key={button}
                  className={btnClass}
                  onClick={() => {
                    setPhotoSize(button)
                  }}
                >
                  {button}
                </button>
              )
            })}
          </div>
          <FillHeartIcon fill={"red"} className={css.header_heart} />
        </div>
      </header>
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
    </>
  )
}
