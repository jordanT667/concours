export interface ErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path?: string;
  details?: string;
}

export const ErrorCode = {
  RESOURCE_NOT_FOUND:   'ERR_001',
  BAD_REQUEST:          'ERR_002',
  VALIDATION_FAILED:    'ERR_003',
  FORBIDDEN_ACCESS:     'ERR_004',
  UNAUTHORIZED:         'ERR_005',
  DUPLICATE_RESOURCE:   'ERR_006',
  INTERNAL_SERVER_ERROR:'ERR_500',
  DATABASE_ERROR:       'ERR_501',
  SERVICE_UNAVAILABLE:  'ERR_502',
} as const;
