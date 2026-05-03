import React from 'react'

export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-6 w-24 bg-gray-100 rounded-lg"></div>
        </div>

        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
