// @ts-ignore
import * as css from "./styles.module.scss"
import { Link } from "wouter-preact"
import { useEffect, useState } from "preact/hooks"
import HeartIcon from "../../icons/HeartIcon"
import Img from "../../icons/Img"

const SideBar = () => {
  const [selectedMenu, setSelectedMenu] = useState("photos")
  return (
    <div className={css.sidebar}>
      <div className={css.sidebar_title}>Photos</div>
      <ul className={css.menu}>
        <li className={css.sidebar_item}>
          <Link
            href="/"
            className={
              selectedMenu === "photos"
                ? `${css.sidebar_link} ${css.sidebar_selected}`
                : css.sidebar_link
            }
            onClick={() => {
              setSelectedMenu("photos")
            }}
          >
            <HeartIcon fill={"#0076FF"} className={css.sidebar_icon} /> All
            photos
          </Link>
        </li>
        <li className={css.sidebar_item}>
          <Link href="/deleted-photos" className={css.sidebar_link}>
            <Img fill={"#0076FF"} className={css.sidebar_icon} />
            Recently&nbsp;deleted
          </Link>
        </li>
        <li className={css.sidebar_item}>
          <Link
            href="/settings"
            className={
              selectedMenu === "favorites"
                ? `${css.sidebar_link} ${css.sidebar_selected}`
                : css.sidebar_link
            }
            onClick={() => {
              setSelectedMenu("favorites")
            }}
          >
            <Img fill={"#0076FF"} className={css.sidebar_icon} /> Favorites
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default SideBar
