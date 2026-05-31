"use client"

import { useEffect } from 'react'

export default function ClientLoader() {
  useEffect(() => {
    // Import do custom element image-slot apenas no cliente para evitar erros no SSR
    import('../lib/image-slot.js')
  }, [])

  return null
}
