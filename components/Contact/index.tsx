'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="contact" className="relative py-16 md:py-24 px-6 text-center overflow-hidden" ref={ref}>
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        className="relative z-10 max-w-xs mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="shimmer-text font-mono text-sm tracking-widest mb-8">GET IN TOUCH</p>

        {/* WeChat QR Code */}
        <div className="flex flex-col items-center gap-6">
          <div className="glass rounded-2xl p-4 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/wechat-qr.png`}
              alt="微信二维码"
              width={200}
              height={200}
              className="rounded-lg w-full h-auto block"
            />
            <p className="text-slate-400 font-mono text-xs mt-3">微信扫码添加</p>
          </div>

          {/* Phone */}
          <a
            href="tel:19972037939"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-mono text-sm"
          >
            <span className="text-accent">📱</span>
            19972037939
          </a>
        </div>
      </motion.div>
    </section>
  )
}
