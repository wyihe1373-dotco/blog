import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const file = fs.readFileSync(
    path.join(process.cwd(), 'content/posts', `${slug}.mdx`),
    'utf-8'
  )
  const { data, content } = matter(file)

  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <a href="/" className="text-accent font-mono text-sm hover:text-white transition-colors mb-8 inline-block">
        ← Back
      </a>
      <h1 className="text-4xl font-bold text-white mb-4">{data.title}</h1>
      <p className="text-slate-500 font-mono text-sm mb-12">{data.date}</p>
      <article className="prose prose-invert prose-indigo max-w-none">
        <MDXRemote source={content} />
      </article>
    </main>
  )
}
