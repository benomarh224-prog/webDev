import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminSession()
  return Response.json({ admin })
}
