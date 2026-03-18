import { NextResponse } from 'next/server'
// Rota descontinuada — use /api/tarefas-modelo
export async function GET() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/tarefas-modelo' }, { status: 410 }) }
export async function POST() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/tarefas-modelo' }, { status: 410 }) }
