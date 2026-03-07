import { getAllPosts } from '@/lib/posts'
import BlogCarousel from './Carousel'

export default function Blog() {
  const posts = getAllPosts()

  return (
    <section id="blog" className="py-16 md:py-24 overflow-hidden">
      <div className="px-6 max-w-6xl mx-auto mb-10">
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">HIGHLIGHTS</p>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">工作亮点</h2>
        </div>
      </div>
      <BlogCarousel posts={posts} />
    </section>
  )
}
