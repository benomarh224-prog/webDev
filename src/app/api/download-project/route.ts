import { NextResponse } from 'next/server'
import { ZipArchive } from 'archiver'
import { existsSync, statSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Directories (relative to project root) to bundle into the source archive.
const DIRECTORIES = ['src', 'prisma', 'public']

// Individual config / metadata files to include at the archive root.
const FILES = [
  'package.json',
  'bun.lock',
  'tsconfig.json',
  'next.config.ts',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'eslint.config.mjs',
  'components.json',
  'README.md',
]

const EXCLUDES = [
  'node_modules',
  '.next',
  '.git',
  '.zscripts',
  'db',
  'skills',
  'examples',
  'tests',
  'download',
  'dev.log',
  'server.log',
]

function shouldExclude(entryPath: string): boolean {
  const normalized = entryPath.replace(/\\/g, '/')
  return EXCLUDES.some((ex) => normalized === ex || normalized.startsWith(ex + '/'))
}

export async function GET() {
  const root = process.cwd()

  // Guard against missing directories so the archive still builds if a path is absent.
  const dirs = DIRECTORIES.filter((d) => {
    try {
      return existsSync(path.join(root, d)) && statSync(path.join(root, d)).isDirectory()
    } catch {
      return false
    }
  })
  const files = FILES.filter((f) => {
    try {
      return existsSync(path.join(root, f))
    } catch {
      return false
    }
  })

  const archive = new ZipArchive()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let errored = false

      archive.on('data', (chunk: Buffer) => {
        if (!errored) controller.enqueue(new Uint8Array(chunk))
      })
      archive.on('end', () => {
        if (!errored) controller.close()
      })
      archive.on('error', (err: Error) => {
        errored = true
        controller.error(err)
      })

      try {
        for (const dir of dirs) {
          archive.directory(
            path.join(root, dir),
            dir,
            (entry) => {
              const name = entry?.name ?? ''
              if (shouldExclude(name) || (entry?.type === 'directory' && EXCLUDES.includes(name))) {
                return false as const
              }
              return entry
            }
          )
        }
        for (const file of files) {
          const fp = path.join(root, file)
          if (existsSync(fp)) {
            archive.file(fp, { name: file })
          }
        }
        archive.finalize()
      } catch (err) {
        errored = true
        controller.error(err)
      }
    },
  })

  const filename = 'portfolio-source.zip'

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
