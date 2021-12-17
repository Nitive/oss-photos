// @ts-ignore
import * as css from "./styles.module.scss"
import { Link, useLocation } from "wouter-preact"
import { useEffect, useState } from "preact/hooks"
import HeartIcon from "../../icons/HeartIcon"
import Img from "../../icons/Img"
import Trash from "../../icons/Trash"
import Upload from "../Upload"
import Settings from "../../icons/Settings"
import cn from "classnames"

const SideBar = () => {
  const [location] = useLocation()
  return (
    <div className={css.sidebar}>
      <div className={css.topSection}>
        <div className={css.sidebar_title}>Photos</div>
        <ul className={css.menu}>
          <li className={css.sidebar_item}>
            <Link
              href="/"
              className={cn({
                [css.sidebar_link]: true,
                [css.sidebar_selected]: location === "/",
              })}
            >
              <Img fill={"#0076FF"} className={css.sidebar_icon} />
              All&nbsp;photos
            </Link>
          </li>
          <li className={css.sidebar_item}>
            <Link
              href="/deleted-photos"
              className={cn({
                [css.sidebar_link]: true,
                [css.sidebar_selected]: location === "/deleted-photos",
              })}
            >
              <Trash fill={"#0076FF"} className={css.sidebar_icon} />
              Recently&nbsp;deleted
            </Link>
          </li>
          <li className={css.sidebar_item}>
            <Link
              href="/favorites"
              className={cn({
                [css.sidebar_link]: true,
                [css.sidebar_selected]: location === "/favorites",
              })}
            >
              <HeartIcon fill={"#0076FF"} className={css.sidebar_icon} />{" "}
              Favorites
            </Link>
          </li>
          <li className={css.sidebar_item}>
            <Link
              href="/settings"
              className={cn({
                [css.sidebar_link]: true,
                [css.sidebar_selected]: location === "/settings",
              })}
            >
              <Settings fill={"#0076FF"} className={css.sidebar_icon} />{" "}
              Settings
            </Link>
          </li>
        </ul>
      </div>
      <div className={css.bottomSection}>
        <Upload />
      </div>
    </div>
  )
}

export default SideBar
