import { Route, Switch } from "wouter-preact"
import PhotosListPage from "./pages/PhotosListPage"
import SettingsPage from "./pages/FavoritesPhotosListPage"
import DeletedPhotosListPage from "./pages/DeletedPhotosListPage"
import Layout from "./components/Layout"
import { createContext } from "preact"
import { useContext } from "preact/hooks"
import Settings from "./pages/Settings"
import { fetchMetaData } from "./store"
import { useEffect } from "preact/compat"

export interface AppContext {
  // TODO
}

export const AppCtx = createContext<AppContext>({} as AppContext)

export function useAppContext() {
  return useContext(AppCtx)
}

export function App(props: { ctx: AppContext }) {
  useEffect(() => {
    fetchMetaData()
  }, [])

  return (
    <AppCtx.Provider value={props.ctx}>
      <Layout>
        <Switch>
          <Route path="/" component={PhotosListPage} />
          <Route path="/favorites" component={SettingsPage} />
          <Route path="/deleted-photos" component={DeletedPhotosListPage} />
          <Route path="/settings" component={Settings} />
          <Route path="/:rest*">
            <h1>Page not found</h1>
          </Route>
        </Switch>
      </Layout>
    </AppCtx.Provider>
  )
}
