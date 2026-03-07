import { getAllPosts } from '@/lib/posts'

export default function Blog() {
  const posts = getAllPosts().slice(0, 3)

  return (
    <section id="blog" className="py-24 px-6 max-w-6xl mx-auto">
      <p className="text-accent font-mono text-sm tracking-widest mb-2">WRITING</p>
      <h2 className="text-4xl font-bold text-white mb-12">Latest Posts</h2>

      <div className="space-y-4">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block glass rounded-xl p-6 hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm mt-1">{post.description}</p>
                <div className="flex gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 shrink-0 ml-4">
                <div>{post.date}</div>
                <div>{post.readingTime}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
