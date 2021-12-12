import { createContext } from "preact"
import { useContext } from "preact/hooks"

export interface AppContext {
  // TODO
}

export const AppCtx = createContext<AppContext>({} as AppContext)

export function useAppContext() {
  return useContext(AppCtx)
}