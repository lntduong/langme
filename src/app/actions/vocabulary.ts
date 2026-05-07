"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function addWord(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const word = formData.get("word") as string
  const phonetic = formData.get("phonetic") as string
  const meaning = formData.get("meaning") as string
  const language = formData.get("language") as string
  const isPublic = formData.get("isPublic") === "true"

  await prisma.vocabulary.create({
    data: {
      word,
      phonetic,
      meaning,
      language,
      isPublic,
      userId: session.user.id
    }
  })

  revalidatePath("/")
}

export async function getWords() {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.vocabulary.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getPublicWords() {
  return await prisma.vocabulary.findMany({
    where: { isPublic: true },
    include: { user: { select: { name: true, id: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateWord(id: string, data: { word: string; phonetic: string; meaning: string; language: string; isPublic?: boolean }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existing = await prisma.vocabulary.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) throw new Error("Not found")

  await prisma.vocabulary.update({
    where: { id },
    data: {
      word: data.word,
      phonetic: data.phonetic,
      meaning: data.meaning,
      language: data.language,
      ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
    }
  })

  revalidatePath("/")
  revalidatePath("/explore")
}

export async function togglePublic(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existing = await prisma.vocabulary.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) throw new Error("Not found")

  await prisma.vocabulary.update({
    where: { id },
    data: { isPublic: !existing.isPublic }
  })

  revalidatePath("/")
  revalidatePath("/explore")
}

export async function deleteWord(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existing = await prisma.vocabulary.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) throw new Error("Not found")

  await prisma.vocabulary.delete({ where: { id } })

  revalidatePath("/")
  revalidatePath("/explore")
}

export async function bulkImport(
  words: { word: string; phonetic?: string; meaning: string; language: string; isPublic?: boolean }[]
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!words || words.length === 0) throw new Error("No words provided")
  if (words.length > 500) throw new Error("Maximum 500 words per import")

  const data = words.map(w => ({
    word: w.word.trim(),
    phonetic: w.phonetic?.trim() || null,
    meaning: w.meaning.trim(),
    language: (w.language || "EN").toUpperCase(),
    isPublic: w.isPublic ?? false,
    userId: session.user!.id,
  }))

  // Validate
  for (const d of data) {
    if (!d.word || !d.meaning) throw new Error(`Missing word or meaning for: ${d.word || '(empty)'}`)
    if (d.language !== "EN" && d.language !== "ZH") throw new Error(`Invalid language "${d.language}" for word "${d.word}". Must be EN or ZH.`)
  }

  const result = await prisma.vocabulary.createMany({ data })

  revalidatePath("/")
  revalidatePath("/explore")

  return { imported: result.count }
}
