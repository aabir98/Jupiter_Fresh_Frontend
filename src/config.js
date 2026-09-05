import { Capacitor } from '@capacitor/core';

const LOCAL_MACHINE_IP = '192.168.0.112';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  Capacitor.isNativePlatform() ? `http://${LOCAL_MACHINE_IP}:8000` : 'http://localhost:8000'
);
