"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LogOut, User, BookOpen, Languages, Globe, Upload, Home, Menu, X } from "lucide-react"
import { useState } from "react"

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Globe },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/import", label: "Import", icon: Upload },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Don't show navbar on auth pages
  if (pathname?.startsWith("/auth")) return null

  return (
    <>
      {/* ─── Top Bar ─── */}
      <nav className="glass" style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px' }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Languages size={28} />
            <span>LangMe</span>
          </Link>

          {/* Desktop Links */}
          {session && (
            <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {NAV_ITEMS.slice(1).map(item => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                      fontSize: '0.8125rem', fontWeight: 600,
                      color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                      backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {session ? (
              <>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: '0.875rem',
                }}>
                  {session.user?.name?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <button onClick={() => signOut()} title="Logout" style={{
                  color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center',
                  padding: '0.375rem', borderRadius: '0.5rem',
                }}>
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Mobile Bottom Navigation ─── */}
      {session && (
        <div className="nav-mobile" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: 'white',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -4px 12px rgb(0 0 0 / 0.05)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.625rem', fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                  transition: 'color 0.15s ease',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '20px', height: '3px', borderRadius: '0 0 3px 3px',
                    backgroundColor: 'var(--primary)',
                  }} />
                )}
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}

      <style>{`
        /* Mobile: hide desktop nav, show bottom bar */
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          main { padding-bottom: 72px; }
        }
        /* Desktop: show desktop nav, hide bottom bar */
        @media (min-width: 641px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}
