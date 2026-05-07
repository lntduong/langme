"use client"

import { useState } from "react"
import { Volume2, Search, X } from "lucide-react"

type PublicWord = {
  id: string
  word: string
  phonetic: string | null
  meaning: string
  language: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  user: { name: string | null; id: string }
}

export function PublicWordList({ words }: { words: PublicWord[] }) {
  const [search, setSearch] = useState("")

  const filtered = words.filter((w: any) =>
    search === "" ||
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.meaning.toLowerCase().includes(search.toLowerCase()) ||
    (w.phonetic && w.phonetic.toLowerCase().includes(search.toLowerCase()))
  )

  function handleSpeak(word: string, language: string) {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = language === "ZH" ? "zh-CN" : "en-US"
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {words.length > 5 && (
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.25rem', borderRadius: '0.5rem', height: '36px', fontSize: '0.875rem' }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={thStyle}>TỪ VỰNG</th>
              <th style={thStyle}>PHIÊN ÂM</th>
              <th style={thStyle}>NGHĨA</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No matching words.
                </td>
              </tr>
            ) : (
              filtered.map((word) => (
                <tr
                  key={word.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: word.language === 'ZH' ? '1.25rem' : '1rem' }}>
                        {word.word}
                      </span>
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: word.language === 'EN' ? '#dbeafe' : '#fef3c7',
                        color: word.language === 'EN' ? '#1d4ed8' : '#b45309',
                      }}>
                        {word.language}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--muted-foreground)' }}>
                    {word.phonetic || "—"}
                  </td>
                  <td style={tdStyle}>
                    {word.meaning}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => handleSpeak(word.word, word.language)} style={actionBtnStyle} title="Listen">
                      <Volume2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1.5rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: 'var(--muted-foreground)',
  textTransform: 'uppercase',
}

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  fontSize: '0.9375rem',
}

const actionBtnStyle: React.CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--primary)',
  color: 'white',
  transition: 'opacity 0.15s ease',
}
