import { render } from "preact"
import { App } from "./App"

const root = document.getElementById("app")
if (!root) {
  throw new Error("Could not find #app")
}

const ctx = {
  // TODO
}

render(<App ctx={ctx} />, root)
