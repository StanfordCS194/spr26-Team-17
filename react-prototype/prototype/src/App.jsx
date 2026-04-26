import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductPage from "./components/ProductPage";
import HomePage from "./pages/HomePage";
import { productCatalog } from "./data/siteData";

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  return null;
}

function PageFrame({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <ScrollManager />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={`${location.pathname}${location.hash}`}>
          <Route
            path="/"
            element={
              <PageFrame>
                <HomePage />
              </PageFrame>
            }
          />
          {productCatalog.map((product) => (
            <Route
              key={product.slug}
              path={product.route}
              element={
                <PageFrame>
                  <ProductPage {...product} />
                </PageFrame>
              }
            />
          ))}
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
