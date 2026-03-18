import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const isLogado = !!req.auth
    const isLoginPage = req.nextUrl.pathname === '/login'

    if (!isLogado && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isLogado && isLoginPage) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}