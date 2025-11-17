// Type definitions for Web APIs that may not be in all environments
declare global {
  interface Navigator {
    connection: any;
    deviceMemory: number;
    computePressure: any;
  }
}

export interface ClientMetrics {
  downlink: number;
  rtt: number;
  deviceMemory: number;
  cpuPressure: string;
}

export function getNetworkInfo() {
  const connection = navigator.connection;
  if (connection) {
    return {
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
  }
  return {
    downlink: -1,
    rtt: -1,
  };
}

export function getDeviceMemory() {
  const memory = navigator.deviceMemory;
  if (memory) {
    return memory;
  }
  return -1;
}

let cpuPressure = 'nominal';

try {
  const observer = new (window as any).ComputePressureObserver((update: any) => {
    cpuPressure = update.state;
  });
  observer.observe();
} catch (e) {
  // Compute Pressure API not supported
}

export function getCpuPressure() {
  return cpuPressure;
}
