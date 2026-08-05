// Bibliotecas
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layout
import Header from './layout/Header';
import Footer from './layout/Footer'

// Importamos las páginas con 'lazy' para que se carguen de forma asíncrona.
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Spinner simple para mostrar mientras se carga la página
const PageLoader = () => (
  <div className="glass-loading mx-auto text-center my-5 py-5 text-secondary" style={{ maxWidth: 360 }}>
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Cargando página...</span>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                {/*Ruta no existente*/}
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App

