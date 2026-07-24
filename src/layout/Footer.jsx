import { Container } from "react-bootstrap";
import { FaBlogger } from "react-icons/fa";
import packageJson from "../../package.json";

export default function Footer() {
    const appVersion = import.meta.env.VITE_APP_VERSION || packageJson.version;

    return (
        <footer className="bg-dark text-white text-center py-3 mt-5">
            <Container>
                <hr />
                <p className="mb-0">
                    2026 🄯 -{" "}
                    <a
                        href="https://thenerdyapprentice.blogspot.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white"
                        style={{ textDecoration: "none" }}
                    >
                        The Nerdy Apprentice{" "}
                        <FaBlogger
                            size={18}
                            style={{ verticalAlign: "middle" }}
                        />
                    </a>{" "}
                    - Todos los errores reservados. (v{appVersion})
                </p>
            </Container>
        </footer>
    );
}