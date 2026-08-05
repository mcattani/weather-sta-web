import { Link, useLocation, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            <SEO
                title="Página no encontrada"
                description="La ruta solicitada no existe en Weather STA Web."
                keywords="404, página no encontrada, error, error 404, ruta no encontrada"
            />
            <div className="container my-5">
                <div className="glass-hero mx-auto text-center py-4 px-3 px-sm-4" style={{ maxWidth: 640 }}>
                    <div className="mb-4">
                        <div className="display-4 fw-bold text-warning mb-3">404</div>
                        <h2 className="mb-3">Página no encontrada</h2>
                        <p className="text-muted mb-4">
                            La ruta <code>{location.pathname}</code> no existe.
                        </p>
                    </div>
                    <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                        <Link to="/" className="btn btn-primary px-4">
                            Ir al inicio
                        </Link>
                        <button
                            className="btn btn-outline-secondary px-4"
                            onClick={() => navigate(-1)}
                        >
                            Volver atrás
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}