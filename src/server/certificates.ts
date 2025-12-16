import { promises as fs } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { logger } from '../shared/log.js.js'
import { LOGGER_CONTEXTS } from '../shared/constants.js.js'

const certLogger = logger.child(LOGGER_CONTEXTS.AUTH_CLIENT)
const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CERT_DIR = join(__dirname, '../../.certs')

/**
 * Check if certificates exist
 */
async function certificatesExist(): Promise<boolean> {
	try {
		const certPath = join(CERT_DIR, 'cert.pem')
		const keyPath = join(CERT_DIR, 'key.pem')
		
		await Promise.all([
			fs.access(certPath),
			fs.access(keyPath),
		])
		
		return true
	} catch {
		return false
	}
}

/**
 * Generate self-signed certificates using openssl
 */
export async function generateCertificates(): Promise<void> {
	// Check if certificates already exist
	if (await certificatesExist()) {
		certLogger.debug('Self-signed certificates already exist')
		return
	}

	certLogger.info('Generating self-signed certificates...')

	// Ensure cert directory exists
	try {
		await fs.mkdir(CERT_DIR, { recursive: true })
	} catch (error) {
		certLogger.error('Failed to create certificate directory', { error })
		throw error
	}

	const certPath = join(CERT_DIR, 'cert.pem')
	const keyPath = join(CERT_DIR, 'key.pem')

	// Generate certificates using openssl
	const opensslCmd = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
		-keyout ${keyPath} -out ${certPath} -days 365`

	try {
		await execAsync(opensslCmd)
		certLogger.info('Self-signed certificates generated successfully')
		certLogger.info(`Certificate: ${certPath}`)
		certLogger.info(`Private key: ${keyPath}`)
		certLogger.warn('Note: You may need to trust this certificate in your system or browser')
	} catch (error: any) {
		certLogger.error('Failed to generate certificates', {
			error: error.message,
		})
		throw new Error(
			`Failed to generate self-signed certificates. Please ensure openssl is installed and available in PATH.\nError: ${error.message}`,
		)
	}
}
