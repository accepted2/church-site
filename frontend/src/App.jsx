import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import MainLayout from "@/layouts/MainLayout"
import Zapiska from "@/pages/Zapiska";
import PaymentResult from '@/pages/PaymentResult';

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
          <Route
            path="/payment/success"
            element={<PaymentResult />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
