// @ts-ignore
import * as css from "./styles.module.scss"
import { useEffect, useState } from "preact/hooks"

const setPassoword = async (password: string) => {
  await fetch("http://localhost:3000/password", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

const changePassoword = async (newPassword: string, oldPassword: string) => {
  await fetch("http://localhost:3000/password/change", {
    method: "POST",
    body: JSON.stringify({ newPassword, oldPassword }),
  })
}

const Settings = () => {
  const [fistPassword, setFistPassword] = useState("")
  const [secondPassword, setSecondPassword] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [differentPassword, setDifferentPassword] = useState(false)
  const [passwordExists, setPasswordExists] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPassword = async () =>
      await fetch("http://localhost:3000/password")
        .then((res) => res.json())
        .then(({ status, isPassordExists }) => {
          if (status === "OK") {
            setPasswordExists(isPassordExists)
          }
        })
        .catch(console.error)
    fetchPassword()
  }, [])

  return (
    <div className={css.settings}>
      <h1 className={css.settings_title}>
        {passwordExists
          ? "Change password for protected photos"
          : "Create password for protected photos"}
      </h1>
      <form
        className={css.settings_form}
        onSubmit={(e: any) => {
          e.preventDefault()
          const identicalPasswords = fistPassword === secondPassword
          if (!identicalPasswords) {
            setDifferentPassword(true)
          } else {
            passwordExists
              ? changePassoword(secondPassword, oldPassword)
              : setPassoword(secondPassword)
          }
        }}
      >
        {passwordExists && (
          <input
            value={oldPassword}
            type="password"
            required
            className={css.settings_input}
            placeholder="type old password"
            onChange={(e: any) => {
              setOldPassword(e.target.value)
            }}
          ></input>
        )}
        <input
          value={fistPassword}
          type="password"
          required
          className={css.settings_input}
          placeholder="new password"
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
          placeholder="confirm new password"
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
