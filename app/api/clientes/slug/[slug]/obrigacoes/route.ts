import { NextResponse } from 'next/server'
// Rota descontinuada — use /api/clientes/slug/[slug]/tarefas-config
export async function GET() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/clientes/slug/[slug]/tarefas-config' }, { status: 410 }) }
export async function POST() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/clientes/slug/[slug]/tarefas-config' }, { status: 410 }) }
