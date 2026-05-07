"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function getQuizWords(language?: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  const words = await prisma.vocabulary.findMany({
    where: { 
      userId: session.user.id,
      ...(language ? { language } : {})
    },
  })

  // Shuffle and pick up to 10
  const shuffled = words.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, 10)

  // For each word, get 3 random other meanings as distractors
  return selected.map(word => {
    const distractors = words
      .filter(w => w.id !== word.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning)
    
    const options = [word.meaning, ...distractors].sort(() => 0.5 - Math.random())
    
    return {
      ...word,
      options
    }
  })
}

export async function saveStudyResult(score: number, total: number) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.studyHistory.create({
    data: {
      userId: session.user.id,
      score,
      total
    }
  })
}
