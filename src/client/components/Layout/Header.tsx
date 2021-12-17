import { useStore } from "@nanostores/preact"
import HeartIcon from "../../icons/HeartIcon"
import Lock from "../../icons/Lock"
import { $metaData, changeGridMode, MetadataState } from "../../store"
import css from "./styles.module.scss"

const headerButtons = ["small", "medium", "large"] as Array<
  MetadataState["gridMode"]
>

const Header = () => {
  const { gridMode } = useStore($metaData)

  return (
    <header className={css.header}>
      <h1 className={css.header_title}>OSS Photos</h1>
      <div className={css.header_right}>
        <div className={css.header_btns}>
          {headerButtons.map((button) => {
            const btnClass = `${css.header_btn} ${
              gridMode === button ? css.btn_border : ""
            }`

            return (
              <button
                key={button}
                className={btnClass}
                onClick={() => {
                  changeGridMode(button)
                }}
              >
                {button}
              </button>
            )
          })}
        </div>
        <div
          onClick={() => {
            const password = prompt("Type password")
            console.log(password, "||||||||||||")
          }}
        >
          <Lock fill={"#0076ff80"} className={css.header_lock} />
        </div>
      </div>
    </header>
  )
}

export default Header
