import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import {
    GeoAltFill,
    CloudRainHeavy,
    ThermometerHigh,
    ThermometerLow,
    Calendar3
} from 'react-bootstrap-icons';
import SEO from '../components/SEO';
import { formatForecastDate } from '../util/formatDate';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const CITY = 'Buenos Aires';

export default function Forecast() {

    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasWeatherKey = Boolean(WEATHER_API_KEY);

    useEffect(() => {
        // Si no hay clave de API, cortamos la ejecución antes del fetch
        if (!hasWeatherKey) {
            return;
        }

        // Pedimos 3 días porque la API devuelve el día actual + 2 días más.
        const URL = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${CITY}&days=3&aqi=no&alerts=no&lang=es`;

        fetch(URL)
            .then((response) => {
                if (!response.ok) throw new Error('No se pudo consultar el pronóstico.');
                return response.json();
            })
            .then((data) => {
                // En la estructura de Weather API, forecast.forecastday contiene el día actual primero.
                // Como no nos interesa el actual, descartamos el primer elemento con slice(1).
                const nextDays = (data.forecast?.forecastday ?? []).slice(1).map((day) => ({
                    fecha: formatForecastDate(day.date),
                    estadoTiempo: day.day?.condition?.text ?? 'N/D',
                    maxTemp: day.day?.maxtemp_c ?? null,
                    minTemp: day.day?.mintemp_c ?? null,
                    rainChance: day.day?.daily_chance_of_rain ?? null,
                    icon: day.day?.condition?.icon ? `https:${day.day.condition.icon}` : null
                }));

                setForecast(nextDays);
                setError(null);
            })
            .catch((err) => {
                console.error('Error al obtener el pronóstico:', err);
                setError('No se pudo cargar el pronóstico meteorológico.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [hasWeatherKey]);

    // Si no hay clave de entorno, mostramos un mensaje claro y evitamos consultar la API.
    if (!hasWeatherKey) {
        return (
            <Container className="my-4">
                <Alert variant="danger" className="glass-alert rounded-4 border-0">
                    Falta la clave VITE_WEATHER_API_KEY.
                </Alert>
            </Container>
        );
    }

    // 
    if (loading) {
        return (
            <Container className="text-center my-5">
                <div className="glass-loading mx-auto" style={{ maxWidth: 360 }}>
                    <Spinner animation="border" style={{ color: 'var(--accent-teal)' }} role="status" />
                    <p className="mt-3 mb-0 text-muted">Cargando pronóstico...</p>
                </div>
            </Container>
        );
    }

    // Error visible con el mismo estilo glass del sitio
    if (error) {
        return (
            <Container className="my-4">
                <Alert variant="danger" className="glass-alert rounded-4 border-0">
                    {error}
                </Alert>
            </Container>
        );
    }

    // 
    return (
        <>
            <SEO
                title="Pronóstico"
                description="Pronóstico meteorológico para los próximos días en Buenos Aires"
                keywords="pronóstico, clima, Buenos Aires, Weather STA"
            />

            <Container className="mb-5 px-2 px-md-3">
                <div className="glass-hero d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2 p-3 p-md-4">
                    <div>
                        <span className="eyebrow d-block mb-1">Pronóstico</span>
                        <h2 className="fw-bold mb-1">Próximos días</h2>
                        <small className="text-muted d-flex flex-wrap align-items-center gap-1">
                            <GeoAltFill size={14} /> {CITY}
                        </small>
                    </div>
                </div>

                <Row className="g-3 g-lg-4">
                    {forecast.map((day) => {
                        {/* Si la probabilidad de lluvia es baja, ocultamos la fila*/}
                        const shouldShowRainChance = day.rainChance != null && day.rainChance >= 25;

                        return (
                            <Col key={day.fecha} xs={12} md={6} lg={4}>
                                <div className="glass-card h-100 p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="eyebrow d-flex align-items-center gap-2">
                                            <Calendar3 size={14} />
                                            {day.fecha}
                                        </span>

                                        {day.icon && (
                                            <img src={day.icon} alt={day.estadoTiempo} width={36} height={36} />
                                        )}
                                    </div>

                                    <h3 className="condition-readout mb-3">{day.estadoTiempo}</h3>

                                    <div className="d-flex justify-content-center gap-4 mb-3">
                                        <div className="text-center">
                                            <small className="text-muted d-block">Máx.</small>
                                            <div className="d-flex align-items-center justify-content-center gap-1 readout">
                                                <ThermometerHigh size={18} style={{ color: '#B94730' }} />
                                                {day.maxTemp ?? '--'}°
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <small className="text-muted d-block">Mín.</small>
                                            <div className="d-flex align-items-center justify-content-center gap-1 readout">
                                                <ThermometerLow size={18} style={{ color: '#0F6F68' }} />
                                                {day.minTemp ?? '--'}°
                                            </div>
                                        </div>
                                    </div>

                                    {/*
                                        Si la probabilidad de lluvia es < 25, ocultamos la fila para mantener
                                        la tarjeta más limpia
                                    */}
                                    {shouldShowRainChance && (
                                        <div className="text-center">
                                            <small className="text-muted d-block">Prob. de lluvia</small>
                                            <div className="d-flex align-items-center justify-content-center gap-2 fw-semibold">
                                                <CloudRainHeavy size={16} style={{ color: '#3B82F6' }} />
                                                {day.rainChance}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </>
    );
}