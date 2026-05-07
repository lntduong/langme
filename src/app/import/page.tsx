"use client"

import { useState, useRef } from "react"
import { Upload, FileJson, FileSpreadsheet, Check, AlertCircle, Download, Trash2, X } from "lucide-react"
import { bulkImport } from "@/app/actions/vocabulary"
import { useRouter } from "next/navigation"

type WordEntry = {
  word: string
  phonetic?: string
  meaning: string
  language: string
  isPublic?: boolean
}

const JSON_EXAMPLE = `[
  { "word": "hello", "phonetic": "/həˈloʊ/", "meaning": "xin chào", "language": "EN" },
  { "word": "你好", "phonetic": "nǐ hǎo", "meaning": "xin chào", "language": "ZH" },
  { "word": "book", "phonetic": "/bʊk/", "meaning": "cuốn sách", "language": "EN" },
  { "word": "学习", "phonetic": "xuéxí", "meaning": "học tập", "language": "ZH" }
]`

const CSV_EXAMPLE = `word,phonetic,meaning,language
hello,/həˈloʊ/,xin chào,EN
你好,nǐ hǎo,xin chào,ZH
book,/bʊk/,cuốn sách,EN
学习,xuéxí,học tập,ZH`

export default function ImportPage() {
  const [mode, setMode] = useState<"json" | "csv">("json")
  const [text, setText] = useState("")
  const [preview, setPreview] = useState<WordEntry[]>([])
  const [error, setError] = useState("")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function parseJSON(input: string): WordEntry[] {
    const data = JSON.parse(input)
    if (!Array.isArray(data)) throw new Error("JSON must be an array of objects")
    return data.map((item: any, i: number) => {
      if (!item.word) throw new Error(`Row ${i + 1}: missing "word"`)
      if (!item.meaning) throw new Error(`Row ${i + 1}: missing "meaning"`)
      return {
        word: String(item.word),
        phonetic: item.phonetic ? String(item.phonetic) : undefined,
        meaning: String(item.meaning),
        language: String(item.language || "EN").toUpperCase(),
        isPublic: Boolean(item.isPublic),
      }
    })
  }

  function parseCSV(input: string): WordEntry[] {
    const lines = input.trim().split("\n")
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row")
    
    const header = lines[0].split(",").map(h => h.trim().toLowerCase())
    const wordIdx = header.indexOf("word")
    const phoneticIdx = header.indexOf("phonetic")
    const meaningIdx = header.indexOf("meaning")
    const langIdx = header.indexOf("language")

    if (wordIdx === -1) throw new Error('CSV header must contain "word"')
    if (meaningIdx === -1) throw new Error('CSV header must contain "meaning"')

    return lines.slice(1).filter(l => l.trim()).map((line, i) => {
      // Simple CSV parse — handle quoted fields
      const cols = parseCSVLine(line)
      if (!cols[wordIdx]) throw new Error(`Row ${i + 2}: missing word`)
      if (!cols[meaningIdx]) throw new Error(`Row ${i + 2}: missing meaning`)
      return {
        word: cols[wordIdx],
        phonetic: phoneticIdx !== -1 ? cols[phoneticIdx] : undefined,
        meaning: cols[meaningIdx],
        language: langIdx !== -1 ? (cols[langIdx] || "EN").toUpperCase() : "EN",
      }
    })
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  function handleParse() {
    setError("")
    setResult(null)
    try {
      const parsed = mode === "json" ? parseJSON(text) : parseCSV(text)
      setPreview(parsed)
    } catch (e: any) {
      setError(e.message)
      setPreview([])
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      setText(content)
      // Auto-detect format
      if (file.name.endsWith(".json")) setMode("json")
      else if (file.name.endsWith(".csv")) setMode("csv")
    }
    reader.readAsText(file, "utf-8")
  }

  async function handleImport() {
    if (preview.length === 0) return
    setImporting(true)
    setError("")
    try {
      const res = await bulkImport(preview)
      setResult(res)
      setPreview([])
      setText("")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setImporting(false)
    }
  }

  function loadExample() {
    setText(mode === "json" ? JSON_EXAMPLE : CSV_EXAMPLE)
  }

  return (
    <div className="container animate-in" style={{ paddingBottom: '4rem', maxWidth: '900px' }}>
      <header style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Upload size={32} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Import Vocabulary</h1>
        </div>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Bulk import words using JSON or CSV format. Supports both English and Chinese.
        </p>
      </header>

      {/* Success Banner */}
      {result && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem',
          backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
        }}>
          <Check size={20} />
          <span style={{ fontWeight: 600 }}>Successfully imported {result.imported} words!</span>
          <button onClick={() => router.push("/")} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Go to Dashboard
          </button>
        </div>
      )}

      <div className="card" style={{ padding: '1.5rem' }}>
        {/* Format Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--secondary)', borderRadius: '0.5rem', padding: '0.25rem' }}>
            <button
              onClick={() => { setMode("json"); setPreview([]); setError("") }}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.15s ease',
                backgroundColor: mode === "json" ? 'white' : 'transparent',
                color: mode === "json" ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: mode === "json" ? '0 1px 3px rgb(0 0 0 / 0.1)' : 'none',
              }}
            >
              <FileJson size={16} /> JSON
            </button>
            <button
              onClick={() => { setMode("csv"); setPreview([]); setError("") }}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.15s ease',
                backgroundColor: mode === "csv" ? 'white' : 'transparent',
                color: mode === "csv" ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: mode === "csv" ? '0 1px 3px rgb(0 0 0 / 0.1)' : 'none',
              }}
            >
              <FileSpreadsheet size={16} /> CSV
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={loadExample} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
              Load Example
            </button>
            <input ref={fileRef} type="file" accept=".json,.csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
              <Upload size={14} /> Upload File
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "json" ? 
              '[\n  { "word": "hello", "phonetic": "/həˈloʊ/", "meaning": "xin chào", "language": "EN" }\n]' :
              'word,phonetic,meaning,language\nhello,/həˈloʊ/,xin chào,EN'
            }
            style={{
              width: '100%', minHeight: '200px', padding: '1rem',
              borderRadius: '0.75rem', border: '1px solid var(--border)',
              fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.8125rem',
              resize: 'vertical', backgroundColor: '#fafafa',
              lineHeight: 1.6,
            }}
          />
          {text && (
            <button onClick={() => { setText(""); setPreview([]); setError("") }}
              style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--muted-foreground)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Format Hint */}
        <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          {mode === "json" ? (
            <span>Format: <code style={{ backgroundColor: 'var(--secondary)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>
              {'[{ "word": "...", "phonetic": "...", "meaning": "...", "language": "EN|ZH" }]'}
            </code></span>
          ) : (
            <span>Header: <code style={{ backgroundColor: 'var(--secondary)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>
              word,phonetic,meaning,language
            </code></span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            fontSize: '0.875rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Parse Button */}
        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Preview Import
        </button>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <span style={{ fontWeight: 700 }}>Preview</span>
              <span style={{ marginLeft: '0.75rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                {preview.length} words ready to import
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setPreview([])} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                <Trash2 size={14} /> Cancel
              </button>
              <button onClick={handleImport} disabled={importing} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                {importing ? "Importing..." : `Import ${preview.length} Words`}
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>WORD</th>
                  <th style={thStyle}>PHONETIC</th>
                  <th style={thStyle}>MEANING</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>LANG</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((word, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ ...tdStyle, color: 'var(--muted-foreground)', width: '50px' }}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, fontSize: word.language === 'ZH' ? '1.125rem' : '0.9375rem' }}>
                      {word.word}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--muted-foreground)' }}>{word.phonetic || "—"}</td>
                    <td style={tdStyle}>{word.meaning}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        padding: '0.125rem 0.5rem', borderRadius: '1rem',
                        fontSize: '0.6875rem', fontWeight: 700,
                        backgroundColor: word.language === 'EN' ? '#dbeafe' : '#fef3c7',
                        color: word.language === 'EN' ? '#1d4ed8' : '#b45309',
                      }}>
                        {word.language}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '0.75rem 1.25rem',
  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
  color: 'var(--muted-foreground)', textTransform: 'uppercase',
}

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1.25rem', fontSize: '0.9375rem',
}
