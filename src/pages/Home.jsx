import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import {
    ThermometerHalf,
    DropletHalf,
    Speedometer2,
    Wind,
    ClockHistory,
    GeoAltFill
} from 'react-bootstrap-icons';

import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function formatearFechaISO(fechaISO) {
    const fecha = new Date(fechaISO);

    if (Number.isNaN(fecha.getTime())) {
        return 'Fecha no disponible';
    }

    const opciones = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    return new Intl.DateTimeFormat('es-AR', opciones).format(fecha);
}

export default function Home() {
    const [sensorData, setSensorData] = useState(null);
    const [weatherApiData, setWeatherApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sensorError, setSensorError] = useState(null);
    const [weatherError, setWeatherError] = useState(null);
    const [sensorStatus, setSensorStatus] = useState('loading');
    const [weatherStatus, setWeatherStatus] = useState('loading');

    // Variables de configuración para la API de WeatherApi.
    const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    const CITY = 'Buenos Aires';

    // Finaliza la pantalla de carga cuando una fuente ya respondió.
    useEffect(() => {
        if (sensorStatus !== 'loading' || weatherStatus !== 'loading') {
            setLoading(false);
        }
    }, [sensorStatus, weatherStatus]);

    // Suscripción a Firestore para recibir el último dato de los sensores en tiempo real.
    useEffect(() => {
        const q = query(
            collection(db, "datos_sensores"),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0].data();
                    setSensorData(doc);
                    setSensorError(null);
                    setSensorStatus('ready');
                } else {
                    setSensorError("No hay datos disponibles");
                    setSensorStatus('error');
                }
            },
            (err) => {
                console.error('Error Firestore:', err);
                setSensorError("Error al conectar con la base de datos.");
                setSensorStatus('error');
            }
        );

        return () => unsubscribe();
    }, []);

    // Consulta adicional a WeatherAPI para completar la información visual del dashboard.
    useEffect(() => {
        if (!WEATHER_API_KEY) {
            setWeatherError("Falta la clave VITE_WEATHER_API_KEY.");
            setWeatherStatus('error');
            return;
        }

        const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${CITY}&aqi=no&lang=es`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.current) {
                    setWeatherApiData(data);
                    setWeatherError(null);
                    setWeatherStatus('ready');
                } else {
                    setWeatherError("No se pudieron obtener datos del clima.");
                    setWeatherStatus('error');
                }
            })
            .catch((err) => {
                console.error('Error Weather API:', err);
                setWeatherError("Error al conectar con la API de Weather.");
                setWeatherStatus('error');
            });
    }, [WEATHER_API_KEY, CITY]);

    // Pantalla de carga inicial mientras llegan los datos.
    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="info" role="status" />
                <p className="mt-2 text-muted">Cargando datos de la estación...</p>
            </Container>
        );
    }

    const alertMessage = sensorError || weatherError;
    const alertVariant = sensorError && weatherError ? 'warning' : 'danger';
    const ultimaLectura = sensorData?.timestamp ? formatearFechaISO(sensorData.timestamp) : 'N/A';
    const hayDatosRecientes = Boolean(sensorData?.timestamp);
    const estadoEstacion = hayDatosRecientes ? 'Estación Online' : 'Sin datos recientes';
    const varianteBadge = hayDatosRecientes ? 'success' : 'warning';

    // Render principal del dashboard con valores de respaldo si alguna fuente falla.
    return (
        <Container className="mb-5">
            {alertMessage && (
                <Alert variant={alertVariant} className="mb-3">
                    {alertMessage}
                </Alert>
            )}

            {/* Cabecera con la ubicación y la hora de la última lectura. */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0">Condiciones Actuales</h2>
                    <small className="text-muted d-flex align-items-center gap-1 mt-1">
                        <GeoAltFill size={14} /> {CITY} |
                        <ClockHistory size={14} className="ms-1" /> Última Lectura: {ultimaLectura}
                    </small>
                </div>
                <Badge bg={varianteBadge} className="px-3 py-2 fs-6">
                    {estadoEstacion}
                </Badge>
            </div>

            <Row className="g-4">
                {/* Temperatura medida por el sensor SHT30 y sensación térmica externa. */}
                <Col md={6} lg={3}>
                    <Card className="h-100 bg-dark-subtle border-secondary">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-start">
                                <Card.Title className="text-muted fs-6">Temperatura</Card.Title>
                                <ThermometerHalf size={24} className="text-danger" />
                            </div>
                            <div className="my-3">
                                <h1 className="display-5 fw-bold mb-0">
                                    {sensorData?.temperatura != null ? `${sensorData.temperatura.toFixed(1)} °C` : '-- °C'}
                                </h1>
                                {weatherApiData?.current ? (
                                    <small className="text-muted">
                                        Sensación térmica: {weatherApiData.current.feelslike_c}°C
                                    </small>
                                ) : (
                                    <small className="text-muted">Sin datos de sensación térmica</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Humedad relativa medida por el sensor SHT30. */}
                <Col md={6} lg={3}>
                    <Card className="h-100 bg-dark-subtle border-secondary">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-start">
                                <Card.Title className="text-muted fs-6">Humedad</Card.Title>
                                <DropletHalf size={24} className="text-info" />
                            </div>
                            <div className="my-3">
                                <h1 className="display-5 fw-bold mb-0">
                                    {sensorData?.humedad != null ? `${sensorData.humedad.toFixed(1)} %` : '-- %'}
                                </h1>
                                {weatherApiData?.current ? (
                                    <small className="text-muted">
                                        Punto de rocío estimado: {weatherApiData.current.dewpoint_c ?? '--'}°C
                                    </small>
                                ) : (
                                    <small className="text-muted">Sin datos de punto de rocío</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Presión atmosférica medida por el sensor BMP280. */}
                <Col md={6} lg={3}>
                    <Card className="h-100 bg-dark-subtle border-secondary">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-start">
                                <Card.Title className="text-muted fs-6">Presión Atmosférica</Card.Title>
                                <Speedometer2 size={24} className="text-warning" />
                            </div>
                            <div className="my-3">
                                <h1 className="display-5 fw-bold mb-0">
                                    {sensorData?.presion != null ? sensorData.presion.toFixed(1) : '--'}
                                </h1>
                                <small className="text-muted">hPa (Hectopascales)</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Estado general y viento obtenidos desde la API meteorológica externa. */}
                <Col md={6} lg={3}>
                    <Card className="h-100 bg-dark-subtle border-secondary">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-start">
                                <Card.Title className="text-muted fs-6">Estado / Viento</Card.Title>
                                <Wind size={24} className="text-primary" />
                            </div>
                            <div className="my-2">
                                {weatherApiData?.current ? (
                                    <>
                                        <div className="d-flex align-items-center gap-2">
                                            <img
                                                src={weatherApiData.current.condition.icon}
                                                alt={weatherApiData.current.condition.text}
                                                width={48}
                                            />
                                            <span className="fw-semibold">{weatherApiData.current.condition.text}</span>
                                        </div>
                                        <small className="text-muted d-block mt-1">
                                            Viento: {weatherApiData.current.wind_kph} km/h ({weatherApiData.current.wind_dir})
                                        </small>
                                    </>
                                ) : (
                                    <small className="text-muted">Sin datos del clima</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
