import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import MainLayout from "@/layouts/MainLayout"
import Zapiska from "@/pages/Zapiska";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/zapiski"
            element={<Zapiska />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
