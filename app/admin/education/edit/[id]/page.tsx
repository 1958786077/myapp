'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
 

interface Education {
  id: number
  degree: string
  school: string
  schoolLink?: string
  major: string
  startDate: string
  endDate: string
  location: string
  description?: string
  createdAt: string
}

export default function EditEducation() {
  const router = useRouter()
  const params = useParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [education, setEducation] = useState<Education | null>(null)
  
  const [formData, setFormData] = useState({
    degree: '',
    school: '',
    schoolLink: '',
    major: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
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

      // Load education data
      const educations = JSON.parse(localStorage.getItem('educations') || '[]')
      const educationId = parseInt(params.id as string)
      const educationData = educations.find((e: Education) => e.id === educationId)
      
      if (educationData) {
        setEducation(educationData)
        setFormData({
          degree: educationData.degree,
          school: educationData.school,
          schoolLink: educationData.schoolLink || '',
          major: educationData.major,
          startDate: educationData.startDate,
          endDate: educationData.endDate,
          location: educationData.location,
          description: educationData.description || ''
        })
      } else {
        router.push('/admin?tab=education')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!education) return
    
    // Get existing educations
    const existingEducations = JSON.parse(localStorage.getItem('educations') || '[]')
    
    // Update education
    const updatedEducation: Education = {
      ...education,
      degree: formData.degree,
      school: formData.school,
      schoolLink: formData.schoolLink.trim() || undefined,
      major: formData.major,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
      description: formData.description || undefined
    }
    
    // Update in array
    const updatedEducations = existingEducations.map((e: Education) => 
      e.id === education.id ? updatedEducation : e
    )
    
    // Sort by start date (newest first)
    updatedEducations.sort((a: Education, b: Education) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    
    // Save to localStorage
    localStorage.setItem('educations', JSON.stringify(updatedEducations))
    
    // Redirect to admin page
    router.push('/admin?tab=education')
  }

  const handleDelete = () => {
    if (!education) return
    
    if (confirm('确定要删除这个教育背景吗？')) {
      const existingEducations = JSON.parse(localStorage.getItem('educations') || '[]')
      const updatedEducations = existingEducations.filter((e: Education) => e.id !== education.id)
      localStorage.setItem('educations', JSON.stringify(updatedEducations))
      router.push('/admin?tab=education')
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

  if (!isAuthenticated || !education) {
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
          <h1 className="text-2xl font-semibold text-white mb-2">编辑教育背景</h1>
          <div className="h-px bg-[#383838] mb-6"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">学位 *</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：学士学位、硕士学位"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">学校名称 *</label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：某某大学"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">学校链接（可选）</label>
              <input
                type="url"
                name="schoolLink"
                value={formData.schoolLink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：https://www.university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">专业 *</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：平面设计"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">地点 *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                placeholder="例如：北京，中国"
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
              <label className="block text-sm font-medium text-white mb-2">结束时间 *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">描述（可选）</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
              placeholder="例如：主修平面设计，辅修数字媒体艺术。在校期间获得多项设计奖项。"
            />
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
              onClick={() => router.push('/admin?tab=education')}
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
