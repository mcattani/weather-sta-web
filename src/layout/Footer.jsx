import { Container } from "react-bootstrap";
import { JournalText } from "react-bootstrap-icons";
import packageJson from "../../package.json";

export default function Footer() {
    const appVersion = import.meta.env.VITE_APP_VERSION || packageJson.version;

    return (
        <footer className="glass-footer text-center py-3 mt-5">
            <Container>
                <p className="mb-0 small">
                    2026 🄯 -{" "}
                    <a
                        href="https://thenerdyapprentice.blogspot.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", fontWeight: 600 }}
                    >
                        The Nerdy Apprentice{" "}
                        <JournalText
                            size={16}
                            style={{ verticalAlign: "middle" }}
                        />
                    </a>{" "}
                    - Todos los errores reservados. (v{appVersion})
                </p>
            </Container>
        </footer>
    );
}
