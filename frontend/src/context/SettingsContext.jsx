import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../utils/api';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        app_logo: '/logo.png'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingsAPI.getAll();
            if (data && data.app_logo) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Fetch settings failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateLogo = async (formData) => {
        try {
            const response = await settingsAPI.updateLogo(formData);
            if (response.logoPath) {
                setSettings(prev => ({ ...prev, app_logo: response.logoPath }));
                return response;
            }
        } catch (error) {
            console.error('Update logo failed:', error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateLogo }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
