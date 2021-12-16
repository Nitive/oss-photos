// @ts-ignore
import * as css from "./styles.module.scss"
import FillHeartIcon from "../../icons/FillHeartIcon"
import { useState } from "preact/hooks"

const headerButtons = ["Small", "Medium", "Large"]

const Header = () => {
  const [photoSize, setPhotoSize] = useState("Small")
  return (
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
  )
}

export default Header
