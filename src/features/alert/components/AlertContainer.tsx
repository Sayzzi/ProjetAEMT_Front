// Conteneur qui affiche toutes les alertes en haut à droite
import { useAlert } from '../contexts/AlertContext';
import './AlertContainer.css';

export function AlertContainer() {
    const { alerts, removeAlert } = useAlert();

    if (alerts.length === 0) return null;

    return (
        <div className="alert-container">
            {alerts.map(alert => (
                <div key={alert.id} className={`alert alert-${alert.type}`}>
                    <div className="alert-icon">
                        {alert.type === 'error' && '!'}
                        {alert.type === 'success' && '✓'}
                        {alert.type === 'warning' && '⚠'}
                        {alert.type === 'info' && 'i'}
                    </div>
                    <div className="alert-content">
                        <div className="alert-title">{alert.title}</div>
                        <div className="alert-message">{alert.message}</div>
                    </div>
                    <button
                        className="alert-close"
                        onClick={() => removeAlert(alert.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
