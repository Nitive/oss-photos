import { Route, Switch } from "wouter-preact"
import { AppContext, AppCtx } from "./application/app-context"
import PhotosListPage from "./pages/PhotosListPage"
import SettingsPage from "./pages/SettingsPage"
import Layout from "./components/Layout"

export function App(props: { ctx: AppContext }) {
  return (
    <AppCtx.Provider value={props.ctx}>
      <Layout>
        <Switch>
          <Route path="/" component={PhotosListPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/:rest*">
            <h1>Page not found</h1>
          </Route>
        </Switch>
      </Layout>
    </AppCtx.Provider>
  )
}
