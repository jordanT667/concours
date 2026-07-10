export interface DeviceInfo {
  ipAddress: string;
  deviceClass: string;
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
  userAgent?: string;
}

export interface SessionDto {
  sessionId: string;
  deviceInfo: DeviceInfo;
  lastUsedAt: string;
  expiresAt: string;
}
