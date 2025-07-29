#!/usr/bin/env node

const { spawn } = require('child_process')
const { execSync } = require('child_process')

console.log('🔒 Starting HTTPS development server for geolocation...\n')

// Kill any existing Next.js processes
try {
  execSync('pkill -f "next dev" 2>/dev/null', { stdio: 'ignore' })
} catch (error) {
  // Ignore error if no processes to kill
}

console.log('🚀 Starting Next.js with HTTPS...')
console.log('⚠️  You will see a security warning in your browser')
console.log('   Click "Advanced" → "Proceed to localhost (unsafe)"')
console.log(
  '   This is normal for local development with self-signed certificates'
)
console.log('🔄 API proxy enabled to avoid CORS issues with backend')
console.log('   Frontend: https://localhost:3000')
console.log('   Backend API: Proxied through Next.js\n')

// Start Next.js with experimental HTTPS
const nextProcess = spawn('npm', ['run', 'dev', '--', '--experimental-https'], {
  stdio: 'inherit',
  shell: true,
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...')
  nextProcess.kill('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM')
  process.exit(0)
})

// Wait a bit then show instructions
setTimeout(() => {
  console.log('\n📍 HTTPS server should be running on: https://localhost:3000')
  console.log(
    '🦊 Firefox users: This HTTPS setup is required for geolocation to work'
  )
  console.log(
    '🔧 To test geolocation: Click "Enable Location" in the chat interface'
  )
  console.log(
    '✅ CORS issues resolved: API requests are proxied through Next.js\n'
  )
}, 3000)

nextProcess.on('exit', code => {
  process.exit(code)
})
