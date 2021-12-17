import { useStore } from "@nanostores/preact"
import HeartIcon from "../../icons/HeartIcon"
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
        <HeartIcon filled className={css.header_heart} />
      </div>
    </header>
  )
}

export default Header
