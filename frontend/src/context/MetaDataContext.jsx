import { createContext, useContext, useState } from 'react'

const MetaDataContext = createContext()

export function MetaDataProvider({ children }) {
  const [metaData, setMetaData] = useState({})

  return (
    <MetaDataContext.Provider value={{ metaData, setMetaData }}>
      {children}
    </MetaDataContext.Provider>
  )
}

export function useMetaData() {
  return useContext(MetaDataContext)
}