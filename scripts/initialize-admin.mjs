import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function initializeAdmin() {
  const db = new PrismaClient()
  try {
    // Existing admin accounts and passwords are always preserved.
    if (await db.admin.count()) {
      console.log('Existing admin account preserved.')
      return
    }
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD
    if (!email || !password || password.length < 12) {
      throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters before first deployment')
    }
    const passwordHash = await bcrypt.hash(password, 12)
    await db.admin.upsert({
      where: { email }, update: {},
      create: { email, passwordHash, name: 'Houssam' },
    })
    console.log('Initial admin account created.')
  } finally {
    await db.$disconnect()
  }
}
