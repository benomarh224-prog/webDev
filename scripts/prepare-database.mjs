import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

// Apply reviewed, additive migrations only for production deployments.
// Local development uses `db:migrate`; previews must use a separate database.
if (process.env.VERCEL_ENV === 'production') {
  const require = createRequire(import.meta.url)
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], {
    stdio: 'inherit', env: process.env,
  })
  if (result.error || result.status !== 0) {
    console.error('Database migration failed; deployment stopped.')
    process.exit(1)
  }

  const { initializeAdmin } = await import('./initialize-admin.mjs')
  await initializeAdmin()
}
