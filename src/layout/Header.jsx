import { Navbar, Container, Nav } from 'react-bootstrap';
import { CloudSunFill } from 'react-bootstrap-icons';

export default function Header() {
    return (
        <Navbar
            expand="lg"
            className="glass-navbar mb-4 py-3 sticky-top"
            collapseOnSelect
        >
            <Container>

                {/* Logo y título */}
                <Navbar.Brand href="#" className="d-flex align-items-center gap-2 fw-bold mb-0">
                    <CloudSunFill size={26} style={{ color: '#FFB74D' }} />
                    <span className="display-font">Weather STA</span>
                    <span className="eyebrow ms-1">TNA</span>
                </Navbar.Brand>

                {/* Botón Hamburguesa */}
                <Navbar.Toggle aria-controls="navbarScroll" />

                {/* Contenido colapsable */}
                <Navbar.Collapse id="navbarScroll">
                    <Nav className="me-auto display-font">
                        <Nav.Link href="#" className="nav-link fw-bold">
                            Inicio
                        </Nav.Link>
                        {/* Próximos links */}
                    </Nav>
                </Navbar.Collapse>

            </Container>
        </Navbar>
    );
}
