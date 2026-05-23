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
            path="/zapiska"
            element={<Zapiska />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
