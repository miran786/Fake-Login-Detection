import { useEffect, useState } from 'react';
import { Globe, Smartphone, MapPin, Monitor, Chrome } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useLocationData } from '../hooks/useLocationData';

interface SecurityInfoProps {
  className?: string;
}

interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

interface LocationInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
}

export function SecurityInfo({ className }: SecurityInfoProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const { locationInfo } = useLocationData();

  useEffect(() => {
    // Get device information
    const getBrowserInfo = () => {
      const ua = navigator.userAgent;
      let browser = 'Unknown';

      if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Edg')) browser = 'Edge';

      return browser;
    };

    const getOSInfo = () => {
      const ua = navigator.userAgent;

      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iOS')) return 'iOS';

      return 'Unknown';
    };

    const getDeviceType = () => {
      const ua = navigator.userAgent;

      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
      }
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'Mobile';
      }
      return 'Desktop';
    };

    setDeviceInfo({
      browser: getBrowserInfo(),
      os: getOSInfo(),
      device: getDeviceType(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    });

  }, []);

  if (!deviceInfo || !locationInfo) {
    return null;
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Current Session Details
          </CardTitle>
          <CardDescription>
            Device fingerprint and location data used for ML analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                <p className="text-sm font-medium">{locationInfo.ip}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="text-sm font-medium">
                  {locationInfo.city}, {locationInfo.region}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Country</p>
                <p className="text-sm font-medium">{locationInfo.country}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">ISP Provider</p>
                <p className="text-sm font-medium">{locationInfo.isp}</p>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Device Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Browser</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Chrome className="w-4 h-4" />
                  {deviceInfo.browser}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Operating System</p>
                <p className="text-sm font-medium">{deviceInfo.os}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Device Type</p>
                <p className="text-sm font-medium">{deviceInfo.device}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Screen Resolution</p>
                <p className="text-sm font-medium">{deviceInfo.screenResolution}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Timezone</p>
                <p className="text-sm font-medium">{deviceInfo.timezone}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Language</p>
                <p className="text-sm font-medium">{deviceInfo.language}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Privacy Notice</p>
                <p className="text-muted-foreground">
                  This information is collected to enhance security and detect fraudulent activities.
                  Data is encrypted and processed according to our privacy policy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
