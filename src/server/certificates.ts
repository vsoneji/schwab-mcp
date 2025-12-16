import { promises as fs } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LOGGER_CONTEXTS } from '../shared/constants.js'
import { logger } from '../shared/log.js'

const certLogger = logger.child(LOGGER_CONTEXTS.AUTH_CLIENT)

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

		await Promise.all([fs.access(certPath), fs.access(keyPath)])

		return true
	} catch {
		return false
	}
}

/**
 * Generate self-signed certificates using Node.js crypto module
 * This works cross-platform without requiring OpenSSL to be installed
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

	try {
		// Create a self-signed certificate using the selfsigned package
		// This works cross-platform without requiring OpenSSL
		const selfsigned = await import('selfsigned')
		const attrs = [{ name: 'commonName', value: 'localhost' }]
		const pems = await selfsigned.default.generate(attrs, {
			keySize: 2048,
			algorithm: 'sha256',
			extensions: [
				{
					name: 'basicConstraints',
					cA: true,
				},
				{
					name: 'keyUsage',
					keyCertSign: true,
					digitalSignature: true,
					nonRepudiation: true,
					keyEncipherment: true,
					dataEncipherment: true,
				},
				{
					name: 'extKeyUsage',
					serverAuth: true,
					clientAuth: true,
					codeSigning: true,
					timeStamping: true,
				},
				{
					name: 'subjectAltName',
					altNames: [
						{
							type: 2, // DNS
							value: 'localhost',
						},
						{
							type: 7, // IP
							ip: '127.0.0.1',
						},
					],
				},
			],
		})

		// Write certificate and private key to files
		await Promise.all([
			fs.writeFile(certPath, pems.cert, 'utf-8'),
			fs.writeFile(keyPath, pems.private, 'utf-8'),
		])

		certLogger.info('Self-signed certificates generated successfully')
		certLogger.info(`Certificate: ${certPath}`)
		certLogger.info(`Private key: ${keyPath}`)
		certLogger.warn(
			'Note: You may need to trust this certificate in your system or browser',
		)
	} catch (error: any) {
		certLogger.error('Failed to generate certificates', {
			error: error.message,
		})
		throw new Error(
			`Failed to generate self-signed certificates.\nError: ${error.message}`,
		)
	}
}
