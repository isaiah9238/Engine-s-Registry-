export interface SecurityScannerParams {
  targetEndpoint: string;
  enforceStrictTls?: boolean;
}

export interface SecurityViolation {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface SecurityAuditResult {
  success: boolean;
  skill: 'custom-security-scanner';
  targetEndpoint: string;
  complianceScore: number;
  violations: SecurityViolation[];
  executedAt: string;
  error?: string;
}

/**
 * Validates endpoint URL formatting and protocol constraints.
 */
const validateEndpoint = (urlStr: string, enforceStrictTls: boolean): SecurityViolation[] => {
  const violations: SecurityViolation[] = [];
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') {
      violations.push({
        code: 'INSECURE_PROTOCOL',
        severity: 'critical',
        message: 'Endpoint must use HTTPS protocol to comply with zero-trust invariants.',
      });
    }

    if (enforceStrictTls && !parsed.hostname.endsWith('.internal') && !parsed.protocol.startsWith('https')) {
      violations.push({
        code: 'TLS_STRICT_FAILED',
        severity: 'high',
        message: 'Strict TLS compliance failed: insecure network route.',
      });
    }
  } catch {
    violations.push({
      code: 'MALFORMED_URL',
      severity: 'critical',
      message: `Value '${urlStr}' is not a valid absolute URL.`,
    });
  }
  return violations;
};

/**
 * In-process runtime handler for custom-security-scanner.
 */
export const execute = async (
  params: SecurityScannerParams
): Promise<SecurityAuditResult> => {
  const executedAt = new Date().toISOString();

  if (!params || typeof params.targetEndpoint !== 'string' || params.targetEndpoint.trim() === '') {
    return {
      success: false,
      skill: 'custom-security-scanner',
      targetEndpoint: params?.targetEndpoint ?? '',
      complianceScore: 0,
      violations: [
        {
          code: 'INVALID_PARAMETER',
          severity: 'critical',
          message: 'targetEndpoint is required and must be a non-empty string.',
        },
      ],
      executedAt,
      error: 'Parameter validation failed',
    };
  }

  const enforceStrictTls = Boolean(params.enforceStrictTls);
  const violations = validateEndpoint(params.targetEndpoint, enforceStrictTls);
  const complianceScore = violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 35);

  return {
    success: violations.length === 0,
    skill: 'custom-security-scanner',
    targetEndpoint: params.targetEndpoint,
    complianceScore,
    violations,
    executedAt,
  };
};