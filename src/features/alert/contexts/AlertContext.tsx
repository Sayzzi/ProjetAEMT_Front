import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Alert Types
export type AlertType = 'error' | 'success' | 'warning' | 'info';

// Struct Alert
export interface Alert {
    id: number;
    type: AlertType;
    title: string;
    message: string;
}

// Context interface
interface AlertContextType {
    alerts: Alert[];
    showAlert: (type: AlertType, title: string, message: string) => void;
    showError: (title: string, message: string) => void;
    showSuccess: (title: string, message: string) => void;
    removeAlert: (id: number) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
}

let globalShowError: ((title: string, message: string) => void) | null = null;

export function getGlobalShowError() {
    return globalShowError;
}

// Provider
export function AlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [nextId, setNextId] = useState(1);

    // Add an alert
    const showAlert = useCallback((type: AlertType, title: string, message: string) => {
        const id = nextId;
        setNextId(prev => prev + 1);

        setAlerts(prev => [...prev, { id, type, title, message }]);

        // Auto-suppress after 5 sec
        setTimeout(() => {
            removeAlert(id);
        }, 5000);
    }, [nextId]);

    // Shortcuts
    const showError = useCallback((title: string, message: string) => {
        showAlert('error', title, message);
    }, [showAlert]);

    const showSuccess = useCallback((title: string, message: string) => {
        showAlert('success', title, message);
    }, [showAlert]);

    // Delete alert
    const removeAlert = useCallback((id: number) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    // Expose showError
    globalShowError = showError;

    return (
        <AlertContext.Provider value={{ alerts, showAlert, showError, showSuccess, removeAlert }}>
            {children}
        </AlertContext.Provider>
    );
}
