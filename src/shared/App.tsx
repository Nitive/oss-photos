import { Route, Switch } from "wouter-preact"
import { AppContext, AppCtx } from "./application/app-context"

export function App(props: { ctx: AppContext }) {
  return (
    <AppCtx.Provider value={props.ctx}>
      <Switch>
        <Route path="/">
          main page
        </Route>
        <Route path="/:rest*">
          <h1>Page not found</h1>
        </Route>
      </Switch>
    </AppCtx.Provider>
  )
}
