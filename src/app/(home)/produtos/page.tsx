import React from 'react'
import { prisma } from '@/lib/prisma'
import ProductList from './ProductList'

interface SearchParams {
  page?: string
  limit?: string
  search?: string
}

export default async function ProdutosPage({
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
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip: offset,
      take: itemsPerPage,
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.product.count({
      where: whereClause,
    }),
  ])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <ProductList 
      products={products} 
      totalCount={totalCount} 
      totalPages={totalPages} 
    />
  )
}