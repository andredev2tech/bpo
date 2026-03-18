import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                senha: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.senha) return null

                const usuario = await prisma.usuario.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!usuario || !usuario.ativo) return null

                const senhaOk = await bcrypt.compare(
                    credentials.senha as string,
                    usuario.senhaHash
                )
                if (!senhaOk) return null

                return {
                    id: usuario.id,
                    name: usuario.nome,
                    email: usuario.email,
                }
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id
            return token
        },
        session({ session, token }) {
            if (token?.id) session.user.id = token.id as string
            return session
        },
    },
})