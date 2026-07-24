import { Navbar, Container } from 'react-bootstrap';
import { CloudSunFill } from 'react-bootstrap-icons';

export default function Header() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-secondary mb-4">
            <Container>
                <Navbar.Brand href="#" className="d-flex align-items-center gap-2 fw-bold">
                    <CloudSunFill size={28} className="text-warning" />
                    Weather STA - TNA
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
}



