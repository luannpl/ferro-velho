'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PaginationProps {
  totalPages: number
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-50">
      <div className="flex flex-1 justify-between sm:hidden">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />
        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Página <span className="font-bold">{currentPage}</span> de{' '}
            <span className="font-bold">{totalPages}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <PaginationArrow
            direction="left"
            href={createPageURL(currentPage - 1)}
            isDisabled={currentPage <= 1}
          />
          <div className="flex items-center gap-1">
            {/* Simple page indicators could be added here if needed */}
          </div>
          <PaginationArrow
            direction="right"
            href={createPageURL(currentPage + 1)}
            isDisabled={currentPage >= totalPages}
          />
        </div>
      </div>
    </div>
  )
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string
  direction: 'left' | 'right'
  isDisabled?: boolean
}) {
  const className = `flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 transition-all hover:bg-gray-50 ${
    isDisabled ? 'pointer-events-none opacity-50' : 'active:scale-95'
  }`

  const icon =
    direction === 'left' ? (
      <ChevronLeft className="w-5" />
    ) : (
      <ChevronRight className="w-5" />
    )

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  )
}
