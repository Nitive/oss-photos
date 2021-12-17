import { useStore } from "@nanostores/preact"
import Lock from "../../icons/Lock"
import { $metaData, changeGridMode, MetadataState } from "../../store"
import css from "./styles.module.scss"

const headerButtons = ["small", "medium", "large"] as Array<
  MetadataState["gridMode"]
>

const unlockPhoto = async (password: string) => {
  const res = await fetch("http://localhost:3000/unlock-photo", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

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
            if (!password?.trim()) {
              alert("Password cannot be empty")
            } else {
              unlockPhoto(password.trim())
            }
          }}
        >
          <Lock fill={"#0076ff80"} className={css.header_lock} />
        </div>
      </div>
    </header>
  )
}

export default Header
