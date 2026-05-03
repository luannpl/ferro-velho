import React from 'react'
import { prisma } from '@/lib/prisma'
import ClientList from './ClientList'

interface SearchParams {
  page?: string
  limit?: string
  search?: string
}

export default async function ClientePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { page = '1', limit = '10', search = '' } = await searchParams

  const currentPage = Number(page) || 1
  const itemsPerPage = Number(limit) || 10
  const offset = (currentPage - 1) * itemsPerPage

  const whereClause = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { cpf: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where: whereClause,
      skip: offset,
      take: itemsPerPage,
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.client.count({
      where: whereClause,
    }),
  ])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <ClientList 
      clients={clients} 
      totalCount={totalCount} 
      totalPages={totalPages} 
    />
  )
}
