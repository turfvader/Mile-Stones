'use client'

import React, { useState, useEffect, useRef } from 'react'

interface WheelPickerProps {
  value: string
  onChange: (value: string) => void
  items: string[]
  label?: string
}

export function WheelPicker({ value, onChange, items, label }: WheelPickerProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const index = items.indexOf(value)
    if (index !== -1 && containerRef.current) {
      containerRef.current.scrollTop = index * 40 - 40
    }
  }, [value, items])

  const handleScroll = () => {
    if (containerRef.current) {
      const newScrollTop = containerRef.current.scrollTop
      setScrollTop(newScrollTop)
      const index = Math.round((newScrollTop + 40) / 40)
      onChange(items[index])
    }
  }

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-sm text-gray-500 mb-1">{label}</span>}
      <div className="relative h-[120px] w-[80px] overflow-hidden bg-gray-50 rounded-lg">
        <div
          ref={containerRef}
          className="absolute top-0 left-0 right-0 bottom-0 overflow-y-scroll scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
          onScroll={handleScroll}
        >
          <div className="h-[40px]" />
          {items.map((option) => (
            <div
              key={option}
              className={`h-[40px] flex items-center justify-center transition-all duration-200
                ${value === option 
                  ? 'text-[#FF6F61] text-lg font-medium' 
                  : 'text-gray-400 text-base'}`}
              style={{ scrollSnapAlign: 'center' }}
            >
              {option}
            </div>
          ))}
          <div className="h-[40px]" />
        </div>
        <div className="absolute top-[40px] left-0 right-0 h-[40px] border-t border-b border-[#FF6F61] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white opacity-50" />
      </div>
    </div>
  )
}

