import { Card } from 'react-bootstrap';

export default function GlassCard({
    title,
    icon,
    value,
    unit,
    subtitle,
    isLive = false,
    isCondition = false,
    conditionIcon
}) {
    return (
        <Card className="glass-card h-100 border-0">
            <Card.Body className="d-flex flex-column justify-content-between p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="eyebrow">{title}</span>
                    <span className={`icon-chip ${isLive ? 'live-pulse' : ''} ${conditionIcon ? 'p-1' : ''}`}>
                        {conditionIcon ? (
                            <img src={conditionIcon} alt={title} width={32} height={32} />
                        ) : (
                            icon
                        )}
                    </span>
                </div>
                <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-2 px-1">
                    {isCondition ? (
                        <h2 className="condition-readout mb-1 text-wrap">
                            {value || 'Sin datos'}
                        </h2>
                    ) : (
                        <div className="readout-lg mb-1">
                            {value != null ? value : '--'}
                            {unit && <span className="readout-unit"> {unit}</span>}
                        </div>
                    )}
                    {subtitle && (
                        <small className="text-muted d-block text-truncate w-100">
                            {subtitle}
                        </small>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
