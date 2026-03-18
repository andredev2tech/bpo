import { NextResponse } from 'next/server'
// Rota descontinuada — use /api/clientes/slug/[slug]/tarefas-config/[id]
export async function PATCH() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/clientes/slug/[slug]/tarefas-config/[id]' }, { status: 410 }) }
export async function DELETE() { return NextResponse.json({ error: 'Rota descontinuada. Use /api/clientes/slug/[slug]/tarefas-config/[id]' }, { status: 410 }) }
