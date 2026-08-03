// Bibliotecas
import { HelmetProvider } from 'react-helmet-async';

import Header from './layout/Header';
import Footer from './layout/Footer'
import Home from './pages/Home';

function App() {
  return (
    <HelmetProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Home />
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
}

export default App

