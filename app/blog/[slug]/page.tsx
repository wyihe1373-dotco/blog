import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'
import PostNav from './PostNav'
import EventLoopDiagram from '@/components/Blog/EventLoopDiagram'

export function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), 'content/posts'))
  return files
    .filter(f => f.endsWith('.mdx'))
    .map(f => ({ slug: f.replace('.mdx', '') }))
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const file = fs.readFileSync(
    path.join(process.cwd(), 'content/posts', `${slug}.mdx`),
    'utf-8'
  )
  const { data, content } = matter(file)

  return (
    <>
      <PostNav title={data.title} />

      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-[#050510] to-[#050510] pt-16 pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[180px] md:w-[300px] h-[180px] md:h-[300px] bg-primary/15 rounded-full blur-[80px] md:blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-[120px] md:w-[200px] h-[120px] md:h-[200px] bg-accent/10 rounded-full blur-[60px] md:blur-[80px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 pt-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(data.tags ?? []).map((tag: string) => (
              <span key={tag} className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {data.title}
          </h1>

          {data.description && (
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-5 max-w-2xl">
              {data.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span>{data.date}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Article body */}
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pb-16">
        <article className="post-body">
          <MDXRemote
            source={content}
            components={{
              pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
                <div className="code-block">
                  <pre {...props}>{children}</pre>
                </div>
              ),
              EventLoopDiagram,
            }}
          />
        </article>
      </main>
    </>
  )
}
