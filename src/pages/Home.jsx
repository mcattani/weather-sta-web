import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
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
                <div className="glass-loading mx-auto" style={{ maxWidth: 360 }}>
                    <Spinner animation="border" style={{ color: 'var(--accent-teal)' }} role="status" />
                    <p className="mt-3 mb-0 text-muted">Cargando datos de la estación...</p>
                </div>
            </Container>
        );
    }

    const alertMessage = sensorError || weatherError;
    const alertVariant = sensorError && weatherError ? 'warning' : 'danger';
    const ultimaLectura = sensorData?.timestamp ? formatearFechaISO(sensorData.timestamp) : 'N/A';
    const hayDatosRecientes = Boolean(sensorData?.timestamp);
    const estadoEstacion = hayDatosRecientes ? 'Estación Online' : 'Sin datos recientes';
    const badgeStatusClass = hayDatosRecientes ? 'is-online' : 'is-offline';
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
                <Alert variant={alertVariant} className="glass-alert mb-3 rounded-4 border-0">
                    {alertMessage}
                </Alert>
            )}

            {/* Cabecera */}
            <div className="glass-hero d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2 p-3 p-md-4">
                <div>
                    <span className="eyebrow d-block mb-1">Panel en vivo</span>
                    <h2 className="fw-bold mb-1">Condiciones Actuales</h2>
                    <small className="text-muted d-flex flex-wrap align-items-center gap-1">
                        <GeoAltFill size={14} /> {CITY}
                        <span className="mx-1">•</span>
                        <ClockHistory size={14} /> Última Lectura: {ultimaLectura}
                    </small>
                </div>
                <span className={`glass-badge ${badgeStatusClass} px-3 py-2 rounded-pill`}>
                    {estadoEstacion}
                </span>
            </div>

            <Row className="g-3 g-lg-4">
                {/* Estado general del clima */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="glass-card h-100 border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="eyebrow">Estado</span>
                                <span className="icon-chip p-1">
                                    {weatherApiData?.current?.condition?.icon ? (
                                        <img
                                            src={weatherApiData.current.condition.icon}
                                            alt={weatherApiData.current.condition.text}
                                            width={32}
                                            height={32}
                                        />
                                    ) : (
                                        <CloudSun size={20} style={{ color: '#2F8FD1' }} />
                                    )}
                                </span>
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-2 px-1">
                                {weatherApiData?.current ? (
                                    <>
                                        <h2 className="fs-6 fw-semibold mb-1 text-wrap" style={{ lineHeight: 1.25 }}>
                                            {weatherApiData.current.condition.text}
                                        </h2>
                                        <small className="text-muted d-block">Condición del clima</small>
                                    </>
                                ) : (
                                    <small className="text-muted d-block">Sin datos del clima</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Temperatura */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="glass-card h-100 border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="eyebrow">Temperatura</span>
                                <span className="icon-chip live-pulse">
                                    <ThermometerHalf size={20} style={{ color: 'var(--accent-coral)' }} />
                                </span>
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-2 px-1">
                                <div className="readout-lg mb-1">
                                    {sensorData?.temperatura != null ? sensorData.temperatura.toFixed(1) : '--'}
                                    <span className="readout-unit"> °C</span>
                                </div>
                                {weatherApiData?.current ? (
                                    <small className="text-muted d-block text-truncate w-100">
                                        Sensación: {weatherApiData.current.feelslike_c}°C
                                    </small>
                                ) : (
                                    <small className="text-muted d-block">Sin datos de sensación</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Humedad */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="glass-card h-100 border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="eyebrow">Humedad</span>
                                <span className="icon-chip live-pulse">
                                    <DropletHalf size={20} style={{ color: 'var(--accent-teal)' }} />
                                </span>
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-2 px-1">
                                <div className="readout-lg mb-1">
                                    {sensorData?.humedad != null ? sensorData.humedad.toFixed(1) : '--'}
                                    <span className="readout-unit"> %</span>
                                </div>
                                {weatherApiData?.current ? (
                                    <small className="text-muted d-block text-truncate w-100">
                                        Punto rocío: {weatherApiData.current.dewpoint_c ?? '--'}°C
                                    </small>
                                ) : (
                                    <small className="text-muted d-block">Sin datos de rocío</small>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Presión atmosférica */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="glass-card h-100 border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="eyebrow">Presión</span>
                                <span className="icon-chip live-pulse">
                                    <Speedometer2 size={20} style={{ color: '#C98A1A' }} />
                                </span>
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-2 px-1">
                                <div className="readout-lg mb-1">
                                    {sensorData?.presion != null ? sensorData.presion.toFixed(1) : '--'}
                                    <span className="readout-unit"> hPa</span>
                                </div>
                                <small className="text-muted d-block text-truncate w-100">Presión barométrica</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Viento */}
                <Col xs={12} sm={6} lg={3}>
                    <Card className="glass-card h-100 border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="eyebrow">Viento</span>
                                <span className="icon-chip">
                                    <Wind size={20} style={{ color: '#6F5FD1' }} />
                                </span>
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-2 px-1">
                                {weatherApiData?.current ? (
                                    <>
                                        <div className="readout-lg mb-1">
                                            {weatherApiData.current.wind_kph}
                                            <span className="readout-unit"> km/h</span>
                                        </div>
                                        <small className="text-muted d-block text-truncate w-100">
                                            Dirección: {weatherApiData.current.wind_dir}
                                        </small>
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
                    <Card className="glass-card h-100 border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="eyebrow">Índice UV</span>
                                <span className="icon-chip">
                                    <Sun size={20} style={{ color: '#E0A400' }} />
                                </span>
                            </div>
                            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-2 px-1">
                                {weatherApiData?.current ? (
                                    <>
                                        <div className="readout-lg mb-1">{weatherApiData.current.uv}</div>
                                        <small className="text-muted d-block text-truncate w-100">
                                            Nivel: {uvNivel}
                                        </small>
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
