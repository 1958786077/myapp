'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
 

interface Testimonial {
  id: number
  content: string
  authorName: string
  position: string
  company?: string
  authorLink?: string
  createdAt: string
}

export default function CreateTestimonial() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    content: '',
    authorName: '',
    position: '',
    company: '',
    authorLink: ''
  })

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true'
      setIsAuthenticated(isLoggedIn)
      setLoading(false)
      
      if (!isLoggedIn) {
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get existing testimonials
    const existingTestimonials = JSON.parse(localStorage.getItem('testimonials') || '[]')
    
    // Create new testimonial
    const newTestimonial: Testimonial = {
      id: Date.now(),
      content: formData.content,
      authorName: formData.authorName,
      position: formData.position,
      company: formData.company || undefined,
      createdAt: new Date().toISOString()
    }
    
    // Add to existing testimonials
    const updatedTestimonials = [...existingTestimonials, newTestimonial]
    
    // Sort by creation date (newest first)
    updatedTestimonials.sort((a: Testimonial, b: Testimonial) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Save to localStorage
    localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
    
    // Redirect to admin page
    router.push('/admin?tab=testimonials')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white relative allow-select">
      {/* 背景动画肌理 */}
      <div className="background-texture">
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element" style={{animationDelay: '-5s', top: '70%', right: '10%'}}></div>
        <div className="drift-element" style={{animationDelay: '-10s', bottom: '20%', left: '60%'}}></div>
      </div>
      
      
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">添加客户评价</h1>
          <div className="h-px bg-[#383838] mb-6"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">评价内容 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
              placeholder="请输入客户的评价内容..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">评价人姓名 *</label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：张经理"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">职位 *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：产品经理"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">公司名称（可选）</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：某科技公司"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">评价人链接（可选）</label>
              <input
                type="url"
                name="authorLink"
                value={formData.authorLink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：https://linkedin.com/in/author"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-white text-black rounded hover:bg-[#f0f0f0] transition-colors"
            >
              保存评价
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin?tab=testimonials')}
              className="px-6 py-2 bg-[#383838] text-white rounded hover:bg-[#4a4a4a] transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
