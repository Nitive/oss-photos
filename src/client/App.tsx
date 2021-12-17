import { createContext } from "preact"
import { useEffect } from "preact/compat"
import { useContext } from "preact/hooks"
import { Route, Switch, useLocation } from "wouter-preact"
import Layout from "./components/Layout"
import DeletedPhotosListPage from "./pages/DeletedPhotosListPage"
import FavoritesListPage from "./pages/FavoritesPhotosListPage"
import PhotosListPage from "./pages/PhotosListPage"
import Settings from "./pages/Settings"
import { fetchMetaData, setFilter } from "./store"

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

  const location = useLocation()
  const path = location[0]

  useEffect(() => {
    setFilter(
      (
        {
          "/": "all",
          "/favorites": "favorites",
          "/deleted-photos": "deleted",
        } as const
      )[path] || "all"
    )
  }, [path])

  return (
    <AppCtx.Provider value={props.ctx}>
      <Layout>
        <Switch>
          <Route path="/" component={PhotosListPage} />
          <Route path="/favorites" component={FavoritesListPage} />
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
