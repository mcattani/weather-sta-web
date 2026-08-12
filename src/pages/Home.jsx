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
import { formatearFechaISO } from '../util/formatDate';
import SEO from '../components/SEO';

import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import GlassCard from '../components/GlassCard';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const CITY = 'Buenos Aires';

export default function Home() {
    const [sensorData, setSensorData] = useState(null);
    const [weatherApiData, setWeatherApiData] = useState(null);
    const [sensorLoading, setSensorLoading] = useState(true);
    // Inicialización de estado para la API del clima.
    let initialWeatherStatus = 'loading';

    // Si no hay clave de API, mostrar error por consola y no mostrar datos.
    if (!WEATHER_API_KEY) {
        console.error('Falta la clave VITE_WEATHER_API_KEY.');
        initialWeatherStatus = 'error';
    }

    const [weatherError, setWeatherError] = useState(null);
    const [weatherStatus, setWeatherStatus] = useState(initialWeatherStatus);

    const loading = sensorLoading || weatherStatus === 'loading';

    // Estado de la estación y clase del badge, calculados en effect
    const [estadoEstacion, setEstadoEstacion] = useState('Sin datos');
    const [badgeStatusClass, setBadgeStatusClass] = useState('is-offline');

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

                    // Calcular estado de la estación en el momento que llega el dato
                    if (doc.timestamp) {
                        // ts es la fecha de la lectura del sensor
                        const ts = new Date(doc.timestamp).getTime();
                        // ageMs es la diferencia en milisegundos entre la fecha actual y la lectura del sensor
                        const ageMs = Date.now() - ts;
                        // Cantidad de milisegundos que debe tener la estación para que se considera offline
                        const oneHourMs = 60 * 60 * 1000;

                        if (ageMs > oneHourMs) {
                            setEstadoEstacion('Estación Offline');
                            setBadgeStatusClass('is-offline');
                        } else {
                            setEstadoEstacion('Estación Online');
                            setBadgeStatusClass('is-online');
                        }
                    } else {
                        setEstadoEstacion('Sin datos');
                        setBadgeStatusClass('is-offline');
                    }
                } else {
                    // No hay documentos en la colección
                    setSensorData(null);
                    setEstadoEstacion('Sin datos');
                    setBadgeStatusClass('is-offline');
                }

                setSensorLoading(false);
            },
            (err) => {
                console.error('Error Firestore:', err);
                // En caso de error, tratamos como ausencia de datos
                setSensorData(null);
                setEstadoEstacion('Sin datos');
                setBadgeStatusClass('is-offline');
                setSensorLoading(false);
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

    // Mensaje de alerta solo para errores de la API externa (WeatherAPI).
    let alertMessage;
    let alertVariant;
    if (weatherError) {
        alertMessage = weatherError;
        alertVariant = 'danger';
    } else {
        alertMessage = undefined;
        alertVariant = 'info';
    }

    // Formateo de la última lectura
    let ultimaLectura = 'N/A';
    if (sensorData?.timestamp) {
        ultimaLectura = formatearFechaISO(sensorData.timestamp);
    }

    // El estado de la estación se actualiza directamente desde onSnapshot
    // Temperatura (nulo si no hay dato)
    let temperaturaValor = null;
    if (sensorData?.temperatura != null) {
        temperaturaValor = sensorData.temperatura.toFixed(1);
    }

    // Sensación térmica (texto alternativo si no hay datos externos)
    let temperaturaSubtitle = 'Sin datos de sensación';
    if (weatherApiData?.current) {
        temperaturaSubtitle = `Sensación térmica: ${weatherApiData.current.feelslike_c}°C`;
    }

    // Humedad
    let humedadValor = null;
    if (sensorData?.humedad != null) {
        humedadValor = sensorData.humedad.toFixed(1);
    }

    // Punto de rocío / subtítulo
    let humedadSubtitle = 'Sin datos de rocío';
    if (weatherApiData?.current) {
        const dew = weatherApiData.current.dewpoint_c ?? '--';
        humedadSubtitle = `Punto de rocío: ${dew}°C`;
    }

    // Presión
    let presionValor = null;
    if (sensorData?.presion != null) {
        presionValor = sensorData.presion.toFixed(1);
    }

    // Viento — velocidad y subtítulo de dirección
    let vientoValor = null;
    let vientoSubtitle = 'Sin datos de viento';
    if (weatherApiData?.current) {
        vientoValor = weatherApiData.current.wind_kph;
        vientoSubtitle = `Dirección: ${weatherApiData.current.wind_dir}`;
    }

    // UV — calcular nivel primero, luego preparar valores para mostrar
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

    let uvMostrar = null;
    let uvSubtitle = 'Sin datos de UV';
    if (weatherApiData?.current) {
        uvMostrar = weatherApiData.current.uv;
        uvSubtitle = `Nivel: ${uvNivel}`;
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
                            value={temperaturaValor}
                            unit="°C"
                            subtitle={temperaturaSubtitle}
                            isLive
                        />
                    </Col>

                    {/* Humedad */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Humedad"
                            icon={<DropletHalf size={20} style={{ color: 'var(--accent-teal)' }} />}
                            value={humedadValor}
                            unit="%"
                            subtitle={humedadSubtitle}
                            isLive
                        />
                    </Col>

                    {/* Presión atmosférica */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Presión"
                            icon={<Speedometer2 size={20} style={{ color: '#C98A1A' }} />}
                            value={presionValor}
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
                            value={vientoValor}
                            unit="km/h"
                            subtitle={vientoSubtitle}
                        />
                    </Col>

                    {/* UV */}
                    <Col xs={12} sm={6} lg={3}>
                        <GlassCard
                            title="Índice UV"
                            icon={<Sun size={20} style={{ color: '#E0A400' }} />}
                            value={uvMostrar}
                            subtitle={uvSubtitle}
                        />
                    </Col>
                </Row>

            </Container>
        </>
    );
}
