'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
 

interface Skill {
  id: number
  category: string
  skills: string[]
  createdAt: string
}

export default function EditSkill() {
  const router = useRouter()
  const params = useParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [skill, setSkill] = useState<Skill | null>(null)
  
  const [formData, setFormData] = useState({
    category: '',
    skills: ['']
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

      // Load skill data
      const skills = JSON.parse(localStorage.getItem('skills') || '[]')
      const skillId = parseInt(params.id as string)
      const skillData = skills.find((s: Skill) => s.id === skillId)
      
      if (skillData) {
        setSkill(skillData)
        setFormData({
          category: skillData.category,
          skills: skillData.skills.length > 0 ? skillData.skills : ['']
        })
      } else {
        router.push('/admin?tab=skills')
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router, params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills]
    newSkills[index] = value
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }))
  }

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }))
  }

  const removeSkill = (index: number) => {
    if (formData.skills.length > 1) {
      const newSkills = formData.skills.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        skills: newSkills
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!skill) return
    
    // Get existing skills
    const existingSkills = JSON.parse(localStorage.getItem('skills') || '[]')
    
    // Update skill
    const updatedSkill: Skill = {
      ...skill,
      category: formData.category,
      skills: formData.skills.filter(s => s.trim() !== '')
    }
    
    // Update in array
    const updatedSkills = existingSkills.map((s: Skill) => 
      s.id === skill.id ? updatedSkill : s
    )
    
    // Sort by category
    updatedSkills.sort((a: Skill, b: Skill) => a.category.localeCompare(b.category))
    
    // Save to localStorage
    localStorage.setItem('skills', JSON.stringify(updatedSkills))
    
    // Redirect to admin page
    router.push('/admin?tab=skills')
  }

  const handleDelete = () => {
    if (!skill) return
    
    if (confirm('确定要删除这个技能分类吗？')) {
      const existingSkills = JSON.parse(localStorage.getItem('skills') || '[]')
      const updatedSkills = existingSkills.filter((s: Skill) => s.id !== skill.id)
      localStorage.setItem('skills', JSON.stringify(updatedSkills))
      router.push('/admin?tab=skills')
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

  if (!isAuthenticated || !skill) {
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
          <h1 className="text-2xl font-semibold text-white mb-2">编辑技能分类</h1>
          <div className="h-px bg-[#383838] mb-6"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">技能分类 *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
              placeholder="例如：设计软件、编程语言、其他技能"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">技能列表 *</label>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  required
                  className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#383838] rounded text-white focus:outline-none focus:border-white"
                  placeholder={`技能 ${index + 1}`}
                />
                {formData.skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-[#383838] text-white rounded hover:bg-[#4a4a4a] transition-colors"
            >
              添加技能
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
              onClick={() => router.push('/admin?tab=skills')}
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

