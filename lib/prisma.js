import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    })
}

module.exports = globalForPrisma.prisma