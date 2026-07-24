import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import {
    ThermometerHalf,
    DropletHalf,
    Speedometer2,
    Wind,
    ClockHistory,
    GeoAltFill,
    CloudSun,
    Sun
} from 'react-bootstrap-icons';

import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const CITY = 'Buenos Aires';

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
    const [sensorError, setSensorError] = useState(null);
    const [weatherError, setWeatherError] = useState(
        WEATHER_API_KEY ? null : 'Falta la clave VITE_WEATHER_API_KEY.'
    );
    const [sensorStatus, setSensorStatus] = useState('loading');
    const [weatherStatus, setWeatherStatus] = useState(
        WEATHER_API_KEY ? 'loading' : 'error'
    );

    const loading = sensorStatus === 'loading' || weatherStatus === 'loading';

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
    const uvValue = weatherApiData?.current?.uv;
    let uvNivel = 'Sin datos';

    if (uvValue != null) {
        if (uvValue <= 2) {
            uvNivel = 'Bajo';
        } else if (uvValue <= 5) {
            uvNivel = 'Moderado';
        } else if (uvValue <= 7) {
            uvNivel = 'Alto';
        } else if (uvValue <= 10) {
            uvNivel = 'Muy alto';
        } else {
            uvNivel = 'Extremo';
        }
    }

    // Render principal del dashboard con valores de respaldo si alguna fuente falla.
    return (
        <Container className="mb-5 px-2 px-md-3">
            {alertMessage && (
                <Alert variant={alertVariant} className="mb-3 rounded-4 border-0 shadow-sm">
                    {alertMessage}
                </Alert>
            )}

            {/* Cabecera */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2 p-3 p-md-4 rounded-4 border border-secondary-subtle bg-dark-subtle shadow-sm">
                <div>
                    <h2 className="fw-bold mb-1">Condiciones Actuales</h2>
                    <small className="text-muted d-flex flex-wrap align-items-center gap-1">
                        <GeoAltFill size={14} /> {CITY}
                        <span className="mx-1">•</span>
                        <ClockHistory size={14} /> Última Lectura: {ultimaLectura}
                    </small>
                </div>
                <Badge bg={varianteBadge} className="px-3 py-2 fs-6 rounded-pill">
                    {estadoEstacion}
                </Badge>
            </div>

            <Row className="g-3 g-lg-4">
                {/* Estado general del clima obtenido desde la API meteorológica externa. */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 bg-gradient" style={{ background: 'linear-gradient(135deg, rgba(13,110,253,0.16), rgba(13,110,253,0.05))' }}>
                        <Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title className="text-muted fs-6 mb-0">Estado</Card.Title>
                                <CloudSun size={24} className="text-primary" />
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 py-2 px-1">
                                {weatherApiData?.current ? (
                                    <>
                                        <img
                                            src={weatherApiData.current.condition.icon}
                                            alt={weatherApiData.current.condition.text}
                                            width={48}
                                            className="mb-2"
                                        />
                                        <span className="fw-semibold fs-6" style={{ lineHeight: 1.2, maxWidth: '100%' }}>
                                            {weatherApiData.current.condition.text}
                                        </span>
                                    </>
                                ) : (
                                    <small className="text-muted d-block">Sin datos del clima</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Temperatura medida por el sensor SHT30 y sensación térmica externa. */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 bg-gradient" style={{ background: 'linear-gradient(135deg, rgba(255,99,132,0.18), rgba(255,99,132,0.05))' }}>
                        <Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title className="text-muted fs-6 mb-0">Temperatura</Card.Title>
                                <ThermometerHalf size={24} className="text-danger" />
                            </div>
                            <div>
                                <h1 className="display-6 fw-bold mb-2">
                                    {sensorData?.temperatura != null ? `${sensorData.temperatura.toFixed(1)} °C` : '-- °C'}
                                </h1>
                                {weatherApiData?.current ? (
                                    <small className="text-muted d-block">
                                        Sensación térmica: {weatherApiData.current.feelslike_c}°C
                                    </small>
                                ) : (
                                    <small className="text-muted d-block">Sin datos de sensación térmica</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Humedad relativa medida por el sensor SHT30. */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 bg-gradient" style={{ background: 'linear-gradient(135deg, rgba(13,202,240,0.16), rgba(13,202,240,0.05))' }}>
                        <Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title className="text-muted fs-6 mb-0">Humedad</Card.Title>
                                <DropletHalf size={24} className="text-info" />
                            </div>
                            <div>
                                <h1 className="display-6 fw-bold mb-2">
                                    {sensorData?.humedad != null ? `${sensorData.humedad.toFixed(1)} %` : '-- %'}
                                </h1>
                                {weatherApiData?.current ? (
                                    <small className="text-muted d-block">
                                        Punto de rocío estimado: {weatherApiData.current.dewpoint_c ?? '--'}°C
                                    </small>
                                ) : (
                                    <small className="text-muted d-block">Sin datos de punto de rocío</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Presión atmosférica medida por el sensor BMP280. */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 bg-gradient" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.16), rgba(255,193,7,0.05))' }}>
                        <Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title className="text-muted fs-6 mb-0">Presión Atmosférica</Card.Title>
                                <Speedometer2 size={24} className="text-warning" />
                            </div>
                            <div>
                                <h1 className="display-6 fw-bold mb-2">
                                    {sensorData?.presion != null ? sensorData.presion.toFixed(1) : '--'}
                                </h1>
                                <small className="text-muted d-block">hPa (Hectopascales)</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Viento */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 bg-gradient" style={{ background: 'linear-gradient(135deg, rgba(111,66,193,0.16), rgba(111,66,193,0.05))' }}>
                        <Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title className="text-muted fs-6 mb-0">Viento</Card.Title>
                                <Wind size={24} className="text-purple" />
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 py-2 px-1">
                                {weatherApiData?.current ? (
                                    <>
                                        <h3 className="fw-bold mb-1">{weatherApiData.current.wind_kph} km/h</h3>
                                        <small className="text-muted d-block">Dirección: {weatherApiData.current.wind_dir}</small>
                                    </>
                                ) : (
                                    <small className="text-muted d-block">Sin datos de viento</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* UV */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 bg-gradient" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.18), rgba(255,193,7,0.05))' }}>
                        <Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title className="text-muted fs-6 mb-0">UV</Card.Title>
                                <Sun size={24} className="text-warning" />
                            </div>
                            <div className="text-center py-2">
                                {weatherApiData?.current ? (
                                    <>
                                        <h3 className="fw-bold mb-1">{weatherApiData.current.uv}</h3>
                                        <small className="text-muted d-block">Índice ultravioleta</small>
                                        <span className="fw-semibold mt-2 d-inline-block">{uvNivel}</span>
                                    </>
                                ) : (
                                    <small className="text-muted d-block">Sin datos de UV</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
}
