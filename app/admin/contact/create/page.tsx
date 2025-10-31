'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
 

interface ContactLink {
  id: number
  label: string
  value: string
  link?: string
  createdAt: string
}

export default function CreateContactLink() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    link: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.label.trim() || !formData.value.trim()) {
      alert('请填写标签和值')
      return
    }

    // Get existing contact links
    const existingContactLinks = JSON.parse(localStorage.getItem('contactLinks') || '[]')
    
    // Create new contact link
    const newContactLink: ContactLink = {
      id: Date.now(),
      label: formData.label.trim(),
      value: formData.value.trim(),
      link: formData.link.trim() || undefined,
      createdAt: new Date().toISOString()
    }

    // Add to existing contact links
    const updatedContactLinks = [...existingContactLinks, newContactLink]
    
    // Save to localStorage
    localStorage.setItem('contactLinks', JSON.stringify(updatedContactLinks))
    
    // Redirect to admin page
    router.push('/admin?tab=contact')
  }

  return (
    <div className="min-h-screen text-white relative allow-select">
      {/* 背景动画肌理 */}
      <div className="background-texture">
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element" style={{animationDelay: '-5s', top: '70%', right: '10%'}}></div>
        <div className="drift-element" style={{animationDelay: '-10s', bottom: '20%', left: '60%'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">添加联系方式</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">标签 *</label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#383838] rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                placeholder="例如：邮箱、电话、QQ等"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">值 *</label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#383838] rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                placeholder="例如：john@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">链接（可选）</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#383838] rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                placeholder="https://example.com"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-[#f0f0f0] transition-colors font-medium"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin?tab=contact')}
                className="px-6 py-3 bg-[#383838] text-white rounded-lg hover:bg-[#4a4a4a] transition-colors font-medium"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}