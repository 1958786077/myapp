'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
 

interface PostData {
  type: 'portfolio' | 'blog' | 'thoughts'
  title: string
  content: string
  image: string
}

export default function AdminEdit() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState<PostData>({
    type: 'portfolio',
    title: '',
    content: '',
    image: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus !== 'true') {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)

    // Load post data
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const post = posts.find((p: any) => p.id === parseInt(postId))
    
    if (post) {
      setFormData({
        type: post.type,
        title: post.title,
        content: post.content,
        image: post.image || ''
      })
    } else {
      router.push('/admin')
    }
    
    setLoading(false)
  }, [postId, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update post in localStorage
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const updatedPosts = posts.map((p: any) => 
      p.id === parseInt(postId) 
        ? { ...p, ...formData }
        : p
    )
    localStorage.setItem('posts', JSON.stringify(updatedPosts))
    
    // Redirect to admin
    router.push('/admin')
  }

  if (!isAuthenticated || loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 relative allow-select">
      {/* 背景动画肌理 */}
      <div className="background-texture">
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element" style={{animationDelay: '-5s', top: '70%', right: '10%'}}></div>
        <div className="drift-element" style={{animationDelay: '-10s', bottom: '20%', left: '60%'}}></div>
      </div>
      
      
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-[#383838] pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-[#ABABAB] hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              编辑内容
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[#ABABAB] mb-4">
              选择类型
            </label>
            <div className="grid grid-cols-3 gap-4">
              {([
                { key: 'portfolio' as const, label: '作品集' },
                { key: 'blog' as const, label: '博客' },
                { key: 'thoughts' as const, label: '牢骚' }
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: key })}
                  className={`py-4 px-6 text-sm font-semibold transition-colors border-2 ${
                    formData.type === key
                      ? 'border-white text-white bg-white/5'
                      : 'border-[#383838] text-[#ABABAB] hover:border-white hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#ABABAB] mb-2">
              标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入标题..."
              className="w-full px-4 py-3 bg-[#111] border border-[#383838] text-white placeholder:text-[#ABABAB] focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-[#ABABAB] mb-2">
              图片链接（可选）
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#111] border border-[#383838] text-white placeholder:text-[#ABABAB] focus:outline-none focus:border-white transition-colors"
            />
            {formData.image && (
              <div className="mt-4 border border-[#383838] overflow-hidden">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[#ABABAB] mb-2">
              内容 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="输入内容..."
              rows={12}
              className="w-full px-4 py-3 bg-[#111] border border-[#383838] text-white placeholder:text-[#ABABAB] focus:outline-none focus:border-white transition-colors resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-[#383838]">
            <Link
              href="/admin"
              className="flex-1 py-3 px-6 border-2 border-[#383838] text-[#ABABAB] font-semibold text-center hover:border-white hover:text-white transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-white text-black font-semibold hover:bg-[#ABABAB] transition-colors"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
