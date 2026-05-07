import { auth } from "@/auth"
import { getWords } from "./actions/vocabulary"
import { AddWordForm } from "@/components/add-word-form"
import { WordList } from "@/components/word-list"
import { BookOpen, GraduationCap } from "lucide-react"
import Link from "next/link"

export default async function Dashboard() {
  const session = await auth()
  const words = await getWords()
  
  const enCount = words.filter(w => w.language === 'EN').length
  const zhCount = words.filter(w => w.language === 'ZH').length

  return (
    <div className="container animate-in" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Hello, {session?.user?.name || 'Explorer'} 👋
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>
          You've learned {words.length} words so far. Keep going!
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <section>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap />
            Quick Stats
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{enCount}</div>
              <div style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>English Words</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{zhCount}</div>
              <div style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Chinese Words</div>
            </div>
          </div>

          <Link href="/study" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            <BookOpen />
            Start Study Session
          </Link>
        </section>

        <section>
          <h2 style={{ marginBottom: '1.5rem' }}>Add New Word</h2>
          <div className="card" style={{ padding: '1.5rem' }}>
            <AddWordForm />
          </div>
        </section>
      </div>

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Vocabulary</h2>
        <WordList words={words} />
      </section>
    </div>
  )
}
