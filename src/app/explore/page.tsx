import { getPublicWords } from "@/app/actions/vocabulary"
import { auth } from "@/auth"
import { PublicWordList } from "@/components/public-word-list"
import { Globe } from "lucide-react"

export default async function ExplorePage() {
  const session = await auth()
  const publicWords = await getPublicWords()

  // Group words by user
  const byUser = publicWords.reduce((acc: Record<string, { name: string; words: typeof publicWords }>, word: typeof publicWords[0]) => {
    const userId = word.userId
    const userName = word.user.name || "Anonymous"
    if (!acc[userId]) {
      acc[userId] = { name: userName, words: [] }
    }
    acc[userId].words.push(word)
    return acc
  }, {} as Record<string, { name: string; words: typeof publicWords }>)

  return (
    <div className="container animate-in" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Globe size={32} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Explore</h1>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>
          Browse vocabulary shared by other learners — {publicWords.length} public words
        </p>
      </header>

      {Object.keys(byUser).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
          No public vocabulary yet. Be the first to share!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(byUser).map(([userId, { name, words }]: [string, any]) => (
            <section key={userId}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--secondary)',
                borderRadius: '0.75rem'
              }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--primary)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {name[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                    {words.length} word{words.length !== 1 ? 's' : ''} shared
                  </div>
                </div>
                {userId === session?.user?.id && (
                  <span style={{ 
                    marginLeft: 'auto',
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    backgroundColor: '#dbeafe', 
                    color: '#1d4ed8' 
                  }}>
                    You
                  </span>
                )}
              </div>
              <PublicWordList words={words} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
