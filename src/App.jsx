import Header from './layout/Header';
import Footer from './layout/Footer'
import Home from './pages/Home';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Home />
      </main>
      <Footer />
    </div>
  );
}

export default App

