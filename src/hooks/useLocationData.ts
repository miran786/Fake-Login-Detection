import { useState, useEffect } from 'react';

export interface LocationInfo {
    ip: string;
    city: string;
    region: string;
    country: string;
    isp: string;
}

export function useLocationData() {
    const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                setLocationInfo({
                    ip: data.ip || 'Unknown',
                    city: data.city || 'Unknown',
                    region: data.region || 'Unknown',
                    country: data.country_name || 'Unknown',
                    isp: data.org || 'Unknown',
                });
            } catch (error) {
                console.error('Error fetching location:', error);
                setLocationInfo({
                    ip: 'Unknown',
                    city: 'Unknown',
                    region: 'Unknown',
                    country: 'Unknown',
                    isp: 'Unknown',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, []);

    return { locationInfo, isLoading };
}
