"use client"

import { useState } from "react"
import { addWord } from "@/app/actions/vocabulary"
import { Plus, Globe, Lock } from "lucide-react"

export function AddWordForm() {
  const [language, setLanguage] = useState("EN")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await addWord(formData)
      e.currentTarget.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button 
          type="button"
          onClick={() => setLanguage("EN")}
          className={`btn ${language === 'EN' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '0.5rem' }}
        >
          English
        </button>
        <button 
          type="button"
          onClick={() => setLanguage("ZH")}
          className={`btn ${language === 'ZH' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '0.5rem', backgroundColor: language === 'ZH' ? '#f59e0b' : '' }}
        >
          Chinese
        </button>
      </div>
      
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="isPublic" value={String(isPublic)} />
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Word</label>
        <input name="word" className="input" placeholder={language === 'EN' ? 'e.g. Serendipity' : 'e.g. 你好'} required />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phonetic (Optional)</label>
        <input name="phonetic" className="input" placeholder={language === 'EN' ? 'e.g. /ˌserənˈdipədē/' : 'e.g. nǐ hǎo'} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Meaning</label>
        <input name="meaning" className="input" placeholder="Translation or definition" required />
      </div>

      {/* Public/Private Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setIsPublic(false)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            borderRadius: '0.75rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: `2px solid ${!isPublic ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: !isPublic ? '#f0f9ff' : 'white',
            color: !isPublic ? 'var(--primary)' : 'var(--muted-foreground)',
            transition: 'all 0.15s ease',
          }}
        >
          <Lock size={14} />
          Private
        </button>
        <button
          type="button"
          onClick={() => setIsPublic(true)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            borderRadius: '0.75rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: `2px solid ${isPublic ? '#22c55e' : 'var(--border)'}`,
            backgroundColor: isPublic ? '#f0fdf4' : 'white',
            color: isPublic ? '#16a34a' : 'var(--muted-foreground)',
            transition: 'all 0.15s ease',
          }}
        >
          <Globe size={14} />
          Public
        </button>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
        <Plus size={18} />
        {loading ? "Adding..." : "Add Word"}
      </button>
    </form>
  )
}
