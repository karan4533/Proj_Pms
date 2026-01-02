/**
 * Environment Variable Validation
 * Ensures all required environment variables are present before application starts
 */

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const requiredEnvVars = {
  // Critical - Application will not work without these
  critical: [
    'DATABASE_URL',
    'NEXT_PUBLIC_APP_URL',
  ],
  
  // Required for production
  production: [
    'NODE_ENV',
  ],
  
  // Required for email functionality (at least one provider)
  email: {
    gmail: ['GMAIL_USER', 'GMAIL_APP_PASSWORD'],
    resend: ['RESEND_API_KEY', 'EMAIL_FROM'],
    sendgrid: ['SENDGRID_API_KEY', 'EMAIL_FROM'],
  },
};

function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check critical variables
  requiredEnvVars.critical.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check production variables in production
  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.production.forEach((key) => {
      if (!process.env[key]) {
        warnings.push(`Production environment should have ${key}`);
      }
    });

    // Check email configuration
    const hasGmail = requiredEnvVars.email.gmail.every((key) => process.env[key]);
    const hasResend = requiredEnvVars.email.resend.every((key) => process.env[key]);
    const hasSendgrid = requiredEnvVars.email.sendgrid.every((key) => process.env[key]);

    if (!hasGmail && !hasResend && !hasSendgrid) {
      warnings.push('No email provider configured. Email functionality will not work.');
    }
  }

  // Validate URL formats
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL);
      
      // Check for trailing slash
      if (process.env.NEXT_PUBLIC_APP_URL.endsWith('/')) {
        warnings.push('NEXT_PUBLIC_APP_URL should not have a trailing slash');
      }
      
      // Check for HTTPS in production
      if (
        process.env.NODE_ENV === 'production' &&
        !process.env.NEXT_PUBLIC_APP_URL.startsWith('https://')
      ) {
        warnings.push('NEXT_PUBLIC_APP_URL should use HTTPS in production');
      }
    } catch {
      missing.push('NEXT_PUBLIC_APP_URL (invalid URL format)');
    }
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith('postgresql://') && 
        !process.env.DATABASE_URL.startsWith('postgres://')) {
      warnings.push('DATABASE_URL should start with postgresql:// or postgres://');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validates environment and throws error if critical variables are missing
 * Call this at application startup
 */
export function ensureEnvironmentValid(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('❌ Missing required environment variables:');
    result.missing.forEach((key) => console.error(`  - ${key}`));
    console.error('\nPlease check your .env file and .env.example for reference.');
    throw new Error('Missing required environment variables');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Environment variables validated successfully');
  }
}

/**
 * Get configuration with validated environment variables
 */
export const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  email: {
    provider: getEmailProvider(),
    gmail: {
      user: process.env.GMAIL_USER,
      password: process.env.GMAIL_APP_PASSWORD,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.EMAIL_FROM,
    },
  },
} as const;

function getEmailProvider(): 'gmail' | 'resend' | 'sendgrid' | 'none' {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return 'gmail';
  }
  if (process.env.RESEND_API_KEY) {
    return 'resend';
  }
  if (process.env.SENDGRID_API_KEY) {
    return 'sendgrid';
  }
  return 'none';
}

// Run validation on module load
if (typeof window === 'undefined') {
  // Only run on server side
  ensureEnvironmentValid();
}
