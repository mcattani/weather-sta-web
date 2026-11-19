import { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Container, Spinner } from 'react-bootstrap';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import SEO from '../components/SEO';
import { db } from '../firebase';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Períodos rápidos disponibles en el selector
const PERIODS = [
    { days: 1, label: '24 h' },
    { days: 7, label: '7 días' },
    { days: 30, label: '30 días' }
];

const timeFormatter = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
});
const dayFormatter = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short'
});
const tooltipDateFormatter = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

function getTimestampMillis(value) {
    if (value == null || value === '') {
        return null;
    }

    // Firebase Timestamp tiene toDate(); también aceptamos fechas interpretables por Date
    const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
    const timestamp = date.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
}

function getNumericValue(value) {
    if (value == null || value === '') {
        return null;
    }

    // Los valores no numéricos quedan como null para no dibujarlos como si fueran cero
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function formatAxisDate(value, days) {
    const date = new Date(value);
    // En 24 horas se prioriza la hora; en períodos largos, el día y el mes
    return days === 1 ? timeFormatter.format(date) : dayFormatter.format(date);
}

function formatTooltipDate(value) {
    return tooltipDateFormatter.format(new Date(value));
}

function ChartTooltip({ formatter }) {
    return (
        // El tooltip comparte las superficies translúcidas y los colores del tema glass.
        <Tooltip
            labelFormatter={formatTooltipDate}
            formatter={formatter}
            contentStyle={{
                background: 'rgba(255, 255, 255, 0.68)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '0.75rem',
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'blur(14px) saturate(160%)',
                WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                color: 'var(--ink)'
            }}
            labelStyle={{ color: 'var(--ink)', fontWeight: 600 }}
        />
    );
}

export default function History() {
    const [periodDays, setPeriodDays] = useState(7);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Evita que una consulta anterior reemplace los datos del último período elegido
        let isCurrentRequest = true;

        async function loadReadings() {
            setLoading(true);
            setError(null);

            const end = new Date();
            const start = new Date(end.getTime() - periodDays * DAY_IN_MS);
            const readingsQuery = query(
                collection(db, 'datos_sensores'),
                // timestamp está guardado como texto ISO, por eso los límites usan el mismo formato
                where('timestamp', '>=', start.toISOString()),
                where('timestamp', '<=', end.toISOString()),
                orderBy('timestamp', 'asc')
            );

            try {
                const snapshot = await getDocs(readingsQuery);
                // Normaliza cada documento para los gráficos y descarta fechas inválidas
                const nextReadings = snapshot.docs.flatMap((document) => {
                    const sensor = document.data();
                    const timestamp = getTimestampMillis(sensor.timestamp);

                    if (timestamp == null) {
                        return [];
                    }

                    return [{
                        timestamp,
                        temperature: getNumericValue(sensor.temperatura),
                        humidity: getNumericValue(sensor.humedad),
                        pressure: getNumericValue(sensor.presion)
                    }];
                });

                if (isCurrentRequest) {
                    setReadings(nextReadings);
                }
            } catch (requestError) {
                console.error('Error al obtener el histórico:', requestError);
                if (isCurrentRequest) {
                    setError('No se pudo cargar el histórico. Intenta nuevamente más tarde.');
                }
            } finally {
                if (isCurrentRequest) {
                    setLoading(false);
                }
            }
        }

        loadReadings();

        return () => {
            isCurrentRequest = false;
        };
        // Cada cambio de período vuelve a consultar únicamente ese intervalo
    }, [periodDays]);

    return (
        <>
            <SEO
                title="Histórico de mediciones"
                description="Histórico de temperatura, humedad y presión de la estación meteorológica."
                keywords="histórico, temperatura, humedad, presión, estación meteorológica"
            />

            <Container className="mb-5 px-2 px-md-3">
                <div className="glass-hero d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3 p-3 p-md-4">
                    <div>
                        <span className="eyebrow d-block mb-1">Estación meteorológica</span>
                        <h2 className="fw-bold mb-1">Histórico de mediciones</h2>
                        <small className="text-muted">
                            Registros cada 30 minutos. Selecciona el período que quieres consultar.
                        </small>
                    </div>

                    <ButtonGroup className="glass-period-group" aria-label="Período del histórico">
                        {/* El período activo se refleja visualmente y para lectores de pantalla */}
                        {PERIODS.map(({ days, label }) => (
                            <Button
                                key={days}
                                type="button"
                                className={`glass-period-btn${periodDays === days ? ' active' : ''}`}
                                aria-pressed={periodDays === days}
                                onClick={() => setPeriodDays(days)}
                            >
                                {label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>

                {error && (
                    <Alert variant="danger" className="glass-alert rounded-4 border-0">
                        {error}
                    </Alert>
                )}

                {loading && (
                    <div className="glass-loading text-center">
                        <Spinner
                            animation="border"
                            style={{ color: 'var(--accent-teal)' }}
                            role="status"
                        />
                        <p className="mt-3 mb-0 text-muted">Cargando mediciones...</p>
                    </div>
                )}

                {!loading && !error && readings.length === 0 && (
                    <Alert variant="info" className="glass-alert rounded-4 border-0">
                        No hay mediciones para el período seleccionado.
                    </Alert>
                )}

                {!loading && !error && readings.length > 0 && (
                    <>
                        <section className="glass-card p-3 p-md-4 mb-4" aria-labelledby="temperature-humidity-title">
                            <div className="mb-3">
                                <h3 id="temperature-humidity-title" className="h5 fw-bold mb-1">
                                    Temperatura y humedad
                                </h3>
                                <small className="text-muted">
                                    Temperatura en °C y humedad relativa en %.
                                </small>
                            </div>

                            <div className="history-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={readings}
                                        margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
                                        accessibilityLayer
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="rgba(18, 48, 71, 0.16)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            dataKey="timestamp"
                                            type="number"
                                            scale="time"
                                            domain={['dataMin', 'dataMax']}
                                            tickFormatter={(value) => formatAxisDate(value, periodDays)}
                                            tick={{ fill: 'var(--ink-soft)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'rgba(18, 48, 71, 0.24)' }}
                                            minTickGap={24}
                                        />
                                        {/* Cada magnitud usa su propia escala: °C a la izquierda y % a la derecha */}
                                        <YAxis
                                            yAxisId="temperature"
                                            width={48}
                                            domain={['auto', 'auto']}
                                            tickFormatter={(value) => `${value}°`}
                                            tick={{ fill: 'var(--ink-soft)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            yAxisId="humidity"
                                            orientation="right"
                                            width={48}
                                            domain={[0, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            tick={{ fill: 'var(--ink-soft)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            formatter={(value, name) => [
                                                value == null
                                                    ? 'Sin dato'
                                                    : `${value}${name === 'Humedad' ? '%' : ' °C'}`,
                                                name
                                            ]}
                                        />
                                        <Legend wrapperStyle={{ color: 'var(--ink)' }} />
                                        <Line
                                            yAxisId="temperature"
                                            type="monotone"
                                            dataKey="temperature"
                                            name="Temperatura"
                                            stroke="#B94730"
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                            connectNulls={false}
                                        />
                                        <Line
                                            yAxisId="humidity"
                                            type="monotone"
                                            dataKey="humidity"
                                            name="Humedad"
                                            stroke="#0F6F68"
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                            connectNulls={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="glass-card p-3 p-md-4" aria-labelledby="pressure-title">
                            <div className="mb-3">
                                <h3 id="pressure-title" className="h5 fw-bold mb-1">
                                    Presión atmosférica
                                </h3>
                                <small className="text-muted">Presión en hPa.</small>
                            </div>

                            <div className="history-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={readings}
                                        margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
                                        accessibilityLayer
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="rgba(18, 48, 71, 0.16)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            dataKey="timestamp"
                                            type="number"
                                            scale="time"
                                            domain={['dataMin', 'dataMax']}
                                            tickFormatter={(value) => formatAxisDate(value, periodDays)}
                                            tick={{ fill: 'var(--ink-soft)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'rgba(18, 48, 71, 0.24)' }}
                                            minTickGap={24}
                                        />
                                        {/* La presión tiene una escala independiente, expresada en hPa */}
                                        <YAxis
                                            width={56}
                                            domain={['auto', 'auto']}
                                            tickFormatter={(value) => `${value}`}
                                            tick={{ fill: 'var(--ink-soft)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            formatter={(value) => [
                                                value == null ? 'Sin dato' : `${value} hPa`,
                                                'Presión'
                                            ]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="pressure"
                                            name="Presión"
                                            stroke="#375F93"
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                            connectNulls={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </>
                )}
            </Container>
        </>
    );
}
