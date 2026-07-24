import { useEffect } from 'react'
import Header from './layout/Header';
import Footer from './layout/Footer'
import Home from './pages/Home';

function App() {

  useEffect(() => {
    // Establecer el tema oscuro de Bootstrap
    document.body.setAttribute('data-bs-theme', 'dark');
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Header />
      <main className="flex-grow-1">
        <Home />
      </main>
      <Footer />
    </div>
  );
}

export default App
