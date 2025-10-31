'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
 

interface WorkExperience {
  id: number
  position: string
  positionLink?: string
  company: string
  startDate: string
  endDate: string
  location: string
  responsibilities: string[]
  clients?: string
  companyLink?: string
  createdAt: string
}

export default function EditWorkExperience() {
  const router = useRouter()
  const params = useParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [workExperience, setWorkExperience] = useState<WorkExperience | null>(null)
  
  const [formData, setFormData] = useState({
    position: '',
    positionLink: '',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    responsibilities: [''],
    clients: '',
    companyLink: ''
  })

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true'
      setIsAuthenticated(isLoggedIn)
      
      if (!isLoggedIn) {
        router.push('/admin/login')
        return
      }

      // Load work experience data
      const experiences = JSON.parse(localStorage.getItem('workExperiences') || '[]')
      const experienceId = parseInt(params.id as string)
      const experience = experiences.find((exp: WorkExperience) => exp.id === experienceId)
      
      if (experience) {
        setWorkExperience(experience)
        setFormData({
          position: experience.position,
          positionLink: experience.positionLink || '',
          company: experience.company,
          startDate: experience.startDate,
          endDate: experience.endDate === 'present' ? '' : experience.endDate,
          location: experience.location,
          responsibilities: experience.responsibilities.length > 0 ? experience.responsibilities : [''],
          clients: experience.clients || '',
          companyLink: experience.companyLink || ''
        })
      } else {
        router.push('/admin?tab=work')
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router, params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...formData.responsibilities]
    newResponsibilities[index] = value
    setFormData(prev => ({
      ...prev,
      responsibilities: newResponsibilities
    }))
  }

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }))
  }

  const removeResponsibility = (index: number) => {
    if (formData.responsibilities.length > 1) {
      const newResponsibilities = formData.responsibilities.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        responsibilities: newResponsibilities
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workExperience) return
    
    // Get existing work experiences
    const existingExperiences = JSON.parse(localStorage.getItem('workExperiences') || '[]')
    
    // Update work experience
    const updatedExperience: WorkExperience = {
      ...workExperience,
      position: formData.position,
      positionLink: formData.positionLink.trim() || undefined,
      company: formData.company,
      startDate: formData.startDate,
      endDate: formData.endDate || 'present',
      location: formData.location,
      responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
      clients: formData.clients || undefined,
      companyLink: formData.companyLink || undefined
    }
    
    // Update in array
    const updatedExperiences = existingExperiences.map((exp: WorkExperience) => 
      exp.id === workExperience.id ? updatedExperience : exp
    )
    
    // Sort by start date (newest first)
    updatedExperiences.sort((a: WorkExperience, b: WorkExperience) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    
    // Save to localStorage
    localStorage.setItem('workExperiences', JSON.stringify(updatedExperiences))
    
    // Redirect to admin page
    router.push('/admin?tab=work')
  }

  const handleDelete = () => {
    if (!workExperience) return
    
    if (confirm('确定要删除这个工作经历吗？')) {
      const existingExperiences = JSON.parse(localStorage.getItem('workExperiences') || '[]')
      const updatedExperiences = existingExperiences.filter((exp: WorkExperience) => exp.id !== workExperience.id)
      localStorage.setItem('workExperiences', JSON.stringify(updatedExperiences))
      router.push('/admin?tab=work')
    }
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

  if (!isAuthenticated || !workExperience) {
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
      
      
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">编辑工作经历</h1>
          <div className="h-px bg-[#383838] mb-6"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">公司名称 *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：创意设计公司"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">公司链接（可选）</label>
              <input
                type="url"
                name="companyLink"
                value={formData.companyLink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：https://www.company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">职位名称 *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：平面设计师"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">职位链接（可选）</label>
              <input
                type="url"
                name="positionLink"
                value={formData.positionLink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：https://linkedin.com/in/position"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">开始时间 *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">结束时间</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="留空表示至今"
              />
              <p className="text-xs text-[#ABABAB] mt-1">留空表示至今</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">工作地点 *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：深圳，中国"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">客户信息（可选）</label>
              <input
                type="text"
                name="clients"
                value={formData.clients}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：平安银行、腾讯等"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">工作职责 *</label>
            {formData.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={responsibility}
                  onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                  required
                  className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                  placeholder={`职责 ${index + 1}`}
                />
                {formData.responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResponsibility(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addResponsibility}
              className="px-4 py-2 bg-[#383838] text-white rounded hover:bg-[#4a4a4a] transition-colors"
            >
              添加职责
            </button>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-white text-black rounded hover:bg-[#f0f0f0] transition-colors"
            >
              保存更改
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin?tab=work')}
              className="px-6 py-2 bg-[#383838] text-white rounded hover:bg-[#4a4a4a] transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              删除
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
