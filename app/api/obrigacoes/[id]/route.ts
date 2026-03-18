import { NextResponse } from 'next/server'
// Rota descontinuada — use /api/tarefas-modelo/[id]
export async function GET() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/tarefas-modelo/[id]' }, { status: 410 }) }
export async function PUT() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/tarefas-modelo/[id]' }, { status: 410 }) }
export async function DELETE() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/tarefas-modelo/[id]' }, { status: 410 }) }
