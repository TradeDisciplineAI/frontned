export interface Nation {
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

export const NATIONS: Nation[] = [
  { name: 'USA', flag: '🇺🇸', lat: 37.09, lng: -95.71, color: '#00ff88' },
  { name: 'United Kingdom', flag: '🇬🇧', lat: 55.37, lng: -3.43, color: '#00ccff' },
  { name: 'Japan', flag: '🇯🇵', lat: 36.2, lng: 138.25, color: '#ffff00' },
  { name: 'South Africa', flag: '🇿🇦', lat: -30.55, lng: 22.93, color: '#ff3366' },
  { name: 'Canada', flag: '🇨🇦', lat: 56.13, lng: -106.34, color: '#ff9500' },
  { name: 'Brazil', flag: '🇧🇷', lat: -14.23, lng: -51.92, color: '#00e5ff' },
  { name: 'Germany', flag: '🇩🇪', lat: 51.16, lng: 10.45, color: '#ff2d55' },
  { name: 'France', flag: '🇫🇷', lat: 46.22, lng: 2.21, color: '#af52de' },
  { name: 'India', flag: '🇮🇳', lat: 20.59, lng: 78.96, color: '#ff9f0a' },
  { name: 'China', flag: '🇨🇳', lat: 35.86, lng: 104.19, color: '#ff3b30' },
  { name: 'Australia', flag: '🇦🇺', lat: -25.27, lng: 133.77, color: '#5856d6' },
  { name: 'Singapore', flag: '🇸🇬', lat: 1.35, lng: 103.82, color: '#ffcc00' },
  { name: 'Switzerland', flag: '🇨🇭', lat: 46.82, lng: 8.23, color: '#e066ff' },
  { name: 'UAE', flag: '🇦🇪', lat: 23.42, lng: 53.85, color: '#34c759' },
];
