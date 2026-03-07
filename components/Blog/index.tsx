import { getAllPosts } from '@/lib/posts'
import BlogCarousel from './Carousel'

export default function Blog() {
  const posts = getAllPosts()

  return (
    <section id="blog" className="py-24 overflow-hidden">
      <div className="px-6 max-w-6xl mx-auto mb-10">
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">WRITING</p>
        <div className="flex items-end justify-between">
          <h2 className="text-5xl font-bold text-white tracking-tight">Latest Posts</h2>
          <span className="text-slate-500 text-sm font-mono hidden md:block">← drag to explore →</span>
        </div>
      </div>
      <BlogCarousel posts={posts} />
    </section>
  )
}
