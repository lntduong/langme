"use client"

import { useState } from "react"
import { Volume2, Pencil, Search, X, Trash2, Check, Globe, Lock } from "lucide-react"
import { updateWord, deleteWord, togglePublic } from "@/app/actions/vocabulary"
import { useRouter } from "next/navigation"

type Word = {
  id: string
  word: string
  phonetic: string | null
  meaning: string
  language: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}

export function WordList({ words }: { words: Word[] }) {
  const [filter, setFilter] = useState<"ALL" | "EN" | "ZH">("ALL")
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ word: "", phonetic: "", meaning: "", language: "" })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const filtered = words.filter((w: any) => {
    const matchLang = filter === "ALL" || w.language === filter
    const matchSearch = search === "" ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase()) ||
      (w.phonetic && w.phonetic.toLowerCase().includes(search.toLowerCase()))
    return matchLang && matchSearch
  })

  function handleSpeak(word: string, language: string) {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = language === "ZH" ? "zh-CN" : "en-US"
    window.speechSynthesis.speak(utterance)
  }

  function startEdit(word: Word) {
    setEditingId(word.id)
    setEditForm({
      word: word.word,
      phonetic: word.phonetic || "",
      meaning: word.meaning,
      language: word.language,
    })
    setDeletingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ word: "", phonetic: "", meaning: "", language: "" })
  }

  async function handleUpdate() {
    if (!editingId) return
    setLoading(true)
    try {
      await updateWord(editingId, editForm)
      setEditingId(null)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePublic(id: string) {
    try {
      await togglePublic(id)
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(id: string) {
    setLoading(true)
    try {
      await deleteWord(id)
      setDeletingId(null)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (words.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
        No words added yet. Start by adding your first word!
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.25rem', borderRadius: '0.5rem', height: '40px' }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--secondary)', borderRadius: '0.5rem', padding: '0.25rem' }}>
          {(["ALL", "EN", "ZH"] as const).map((lang: any) => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              style={{
                padding: '0.375rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                backgroundColor: filter === lang ? 'white' : 'transparent',
                color: filter === lang ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: filter === lang ? '0 1px 3px rgb(0 0 0 / 0.1)' : 'none',
              }}
            >
              {lang === "ALL" ? "All" : lang === "EN" ? "English" : "Chinese"}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
          {filtered.length} words
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={thStyle}>TỪ VỰNG</th>
              <th style={thStyle}>PHIÊN ÂM</th>
              <th style={thStyle}>NGHĨA</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>TRẠNG THÁI</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '150px' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No matching words found.
                </td>
              </tr>
            ) : (
              filtered.map((word) => (
                editingId === word.id ? (
                  /* ─── Edit Row ─── */
                  <tr key={word.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f0f9ff' }}>
                    <td style={tdStyle}>
                      <input
                        className="input"
                        value={editForm.word}
                        onChange={(e) => setEditForm(f => ({ ...f, word: e.target.value }))}
                        style={{ height: '36px', fontSize: '0.9375rem' }}
                        placeholder="Word"
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        className="input"
                        value={editForm.phonetic}
                        onChange={(e) => setEditForm(f => ({ ...f, phonetic: e.target.value }))}
                        style={{ height: '36px', fontSize: '0.9375rem' }}
                        placeholder="Phonetic"
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        className="input"
                        value={editForm.meaning}
                        onChange={(e) => setEditForm(f => ({ ...f, meaning: e.target.value }))}
                        style={{ height: '36px', fontSize: '0.9375rem' }}
                        placeholder="Meaning"
                      />
                    </td>
                    <td style={tdStyle}></td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
                        <button onClick={handleUpdate} disabled={loading} style={{ ...actionBtnStyle, backgroundColor: '#22c55e' }} title="Save">
                          <Check size={16} />
                        </button>
                        <button onClick={cancelEdit} style={{ ...actionBtnStyle, backgroundColor: 'var(--muted-foreground)' }} title="Cancel">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : deletingId === word.id ? (
                  /* ─── Delete Confirmation Row ─── */
                  <tr key={word.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#fef2f2' }}>
                    <td colSpan={4} style={{ ...tdStyle, color: '#dc2626', fontWeight: 600 }}>
                      Xóa "<strong>{word.word}</strong>" ({word.meaning})?
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
                        <button onClick={() => handleDelete(word.id)} disabled={loading} style={{ ...actionBtnStyle, backgroundColor: '#ef4444' }} title="Confirm">
                          <Trash2 size={16} />
                        </button>
                        <button onClick={() => setDeletingId(null)} style={{ ...actionBtnStyle, backgroundColor: 'var(--muted-foreground)' }} title="Cancel">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* ─── Normal Row ─── */
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
                      <button
                        onClick={() => handleTogglePublic(word.id)}
                        title={word.isPublic ? "Click to make private" : "Click to make public"}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '1rem',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          backgroundColor: word.isPublic ? '#dcfce7' : '#f1f5f9',
                          color: word.isPublic ? '#16a34a' : '#94a3b8',
                          border: `1px solid ${word.isPublic ? '#bbf7d0' : '#e2e8f0'}`,
                        }}
                      >
                        {word.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                        {word.isPublic ? "Public" : "Private"}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
                        <button onClick={() => handleSpeak(word.word, word.language)} style={actionBtnStyle} title="Listen">
                          <Volume2 size={16} />
                        </button>
                        <button onClick={() => startEdit(word)} style={actionBtnStyle} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => { setDeletingId(word.id); setEditingId(null) }} style={{ ...actionBtnStyle, backgroundColor: '#ef4444' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
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
  padding: '0.875rem 1.5rem',
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
