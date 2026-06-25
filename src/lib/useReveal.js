import { useEffect } from 'react'

// React port of aecom-reveal.js: wires scroll-reveal for [data-reveal] nodes
// inside the given ref after mount (the original script only runs once on load).
export function useReveal(ref) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    root.querySelectorAll('[data-reveal-group]').forEach((group) => {
      const step = parseInt(group.getAttribute('data-reveal-group'), 10) || 120
      let i = 0
      group.querySelectorAll('[data-reveal]').forEach((el) => {
        if (!el.hasAttribute('data-reveal-delay')) {
          el.style.setProperty('--aecom-reveal-delay', i * step + 'ms')
        }
        i++
      })
    })

    const items = root.querySelectorAll('[data-reveal]')
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ref])
}
