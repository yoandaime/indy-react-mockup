import { createContext, useContext, useState } from "react"

const ViewModeContext = createContext(null)

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState("admin")

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext)
  if (!ctx) throw new Error("useViewMode must be used within a ViewModeProvider")
  return ctx
}
