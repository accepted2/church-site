import { useEffect } from "react";
import { Outlet } from "react-router-dom"
import { useMetaData } from "@/context/MetaDataContext";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

export default function MainLayout() {
  const { metaData } = useMetaData()

  useEffect(() => {
    if (metaData?.title) {
      document.title = metaData.title
    }
  }, [metaData]);

  return (
    <div className="layout">
      <Header isFixed={metaData?.isHeaderFixed} />
      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}