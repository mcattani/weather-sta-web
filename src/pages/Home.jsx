import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
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
import SEO from '../components/SEO';

import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import GlassCard from '../components/GlassCard';

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
    }, []);

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
        <>
            <SEO
                title="Home"
                description="Datos meteorológicos actuales obtenidos del ESP32 WeatherStation y Weather API"
                keywords="panel en vivo, datos meteorológicos, Buenos Aires, Weather STA, Weather API, ESP32, WeatherStation"
            />
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
                        <GlassCard
                            title="Estado"
                            icon={<CloudSun size={20} style={{ color: '#2F8FD1' }} />}
                            conditionIcon={weatherApiData?.current?.condition?.icon}
                            value={weatherApiData?.current?.condition?.text}
                            subtitle="Condición del clima"
                            isCondition
                        />
                    </Col>

                    {/* Temperatura */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Temperatura"
                            icon={<ThermometerHalf size={20} style={{ color: 'var(--accent-coral)' }} />}
                            value={sensorData?.temperatura != null ? sensorData.temperatura.toFixed(1) : null}
                            unit="°C"
                            subtitle={weatherApiData?.current ? `Sensación térmica: ${weatherApiData.current.feelslike_c}°C` : 'Sin datos de sensación'}
                            isLive
                        />
                    </Col>

                    {/* Humedad */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Humedad"
                            icon={<DropletHalf size={20} style={{ color: 'var(--accent-teal)' }} />}
                            value={sensorData?.humedad != null ? sensorData.humedad.toFixed(1) : null}
                            unit="%"
                            subtitle={weatherApiData?.current ? `Punto de rocío: ${weatherApiData.current.dewpoint_c ?? '--'}°C` : 'Sin datos de rocío'}
                            isLive
                        />
                    </Col>

                    {/* Presión atmosférica */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Presión"
                            icon={<Speedometer2 size={20} style={{ color: '#C98A1A' }} />}
                            value={sensorData?.presion != null ? sensorData.presion.toFixed(1) : null}
                            unit="hPa"
                            subtitle="Presión barométrica"
                            isLive
                        />
                    </Col>

                    {/* Viento */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Viento"
                            icon={<Wind size={20} style={{ color: '#6F5FD1' }} />}
                            value={weatherApiData?.current ? weatherApiData.current.wind_kph : null}
                            unit="km/h"
                            subtitle={weatherApiData?.current ? `Dirección: ${weatherApiData.current.wind_dir}` : 'Sin datos de viento'}
                        />
                    </Col>

                    {/* UV */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Índice UV"
                            icon={<Sun size={20} style={{ color: '#E0A400' }} />}
                            value={weatherApiData?.current ? weatherApiData.current.uv : null}
                            subtitle={weatherApiData?.current ? `Nivel: ${uvNivel}` : 'Sin datos de UV'}
                        />
                    </Col>
                </Row>

            </Container>
        </>
    );
}
