// Line-style inline icons (currentColor) — no emoji/clip-art, per AECOM guardrails.
const S = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconGrid = (p) => (<svg {...S} {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>)
export const IconMap = (p) => (<svg {...S} {...p}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>)
export const IconChart = (p) => (<svg {...S} {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>)
export const IconEye = (p) => (<svg {...S} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>)
export const IconTruck = (p) => (<svg {...S} {...p}><path d="M1 3h13v11H1z"/><path d="M14 7h5l3 3v4h-8z"/><circle cx="5.5" cy="17.5" r="1.6"/><circle cx="18" cy="17.5" r="1.6"/></svg>)
export const IconBot = (p) => (<svg {...S} {...p}><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M12 7V4M9 13h.01M15 13h.01"/><path d="M2 12v3M22 12v3"/></svg>)
export const IconBolt = (p) => (<svg {...S} {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>)
export const IconDroplet = (p) => (<svg {...S} {...p}><path d="M12 2.5s6 6.3 6 10.5a6 6 0 1 1-12 0C6 8.8 12 2.5 12 2.5z"/></svg>)
export const IconPlay = (p) => (<svg {...S} {...p}><polygon points="6 4 20 12 6 20 6 4"/></svg>)
export const IconPause = (p) => (<svg {...S} {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>)
export const IconReset = (p) => (<svg {...S} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>)
export const IconClose = (p) => (<svg {...S} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>)
export const IconShield = (p) => (<svg {...S} {...p}><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/></svg>)
export const IconArrowRight = (p) => (<svg {...S} {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>)
export const IconList = (p) => (<svg {...S} {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>)
export const IconNetwork = (p) => (<svg {...S} {...p}><circle cx="5" cy="6" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="12" r="2.4"/><path d="M7.2 7l9.6 4M7.2 17l9.6-4"/></svg>)

export const ASSET_ICON = { bolt: IconBolt, tower: IconGrid, droplet: IconDroplet, pump: IconDroplet }
