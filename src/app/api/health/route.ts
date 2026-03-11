// GET /api/health — unauthenticated liveness check
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
