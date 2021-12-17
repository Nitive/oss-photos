// @ts-ignore
import * as css from "./styles.module.scss"
import { useState } from "preact/hooks"

const setPassowrd = async (password: string) => {
  const response = await fetch("http://localhost:3000/password", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

const Settings = () => {
  const [fistPassword, setFistPassword] = useState("")
  const [secondPassword, setSecondPassword] = useState("")
  const [differentPassword, setDifferentPassword] = useState(false)

  return (
    <div className={css.settings}>
      <h1 className={css.settings_title}>Password for protected photos</h1>
      <form
        className={css.settings_form}
        onSubmit={(e: any) => {
          e.preventDefault()
          const identicalPasswords = fistPassword === secondPassword
          if (!identicalPasswords) {
            setDifferentPassword(true)
          } else {
            console.log(secondPassword, "sdsfsdfdsf")
            setPassowrd(secondPassword)
          }
        }}
      >
        <input
          value={fistPassword}
          type="password"
          required
          className={css.settings_input}
          placeholder="password"
          onChange={(e: any) => {
            setFistPassword(e.target.value)
            setDifferentPassword(false)
          }}
        ></input>
        <input
          value={secondPassword}
          type="password"
          required
          className={css.settings_input}
          placeholder="confirm password"
          onChange={(e: any) => {
            setSecondPassword(e.target.value)
            setDifferentPassword(false)
          }}
        ></input>
        {differentPassword && (
          <div className={css.settings_error}>Passwords are not the same</div>
        )}
        <button className={css.settings_button} type="submit">
          Save password
        </button>
      </form>
    </div>
  )
}

export default Settings
