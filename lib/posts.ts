import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'content/posts')

export interface PostMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir)
  return files
    .filter(f => f.endsWith('.mdx'))
    .map(file => {
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8')
      const { data } = matter(raw)
      return {
        slug: file.replace('.mdx', ''),
        title: data.title,
        date: data.date,
        tags: data.tags ?? [],
        description: data.description ?? '',
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
