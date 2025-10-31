'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
 

interface Post {
  id: number
  type: 'portfolio' | 'blog' | 'thoughts'
  title: string
  content: string
  image?: string
  date: string
}

interface WorkExperience {
  id: number
  position: string
  company: string
  startDate: string
  endDate: string
  location: string
  responsibilities: string[]
  clients?: string
  companyLink?: string
  createdAt: string
}

interface Skill {
  id: number
  category: string
  skills: string[]
  createdAt: string
}

interface Education {
  id: number
  degree: string
  school: string
  major: string
  startDate: string
  endDate: string
  location: string
  description?: string
  createdAt: string
}

interface Testimonial {
  id: number
  content: string
  authorName: string
  position: string
  company?: string
  authorLink?: string
  createdAt: string
}

interface ContactLink {
  id: number
  label: string
  value: string
  link?: string
  createdAt: string
}

export default function Admin() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'portfolio' | 'blog' | 'thoughts' | 'work' | 'skills' | 'education' | 'testimonials' | 'contact'>('all')
  const [query, setQuery] = useState('')
  const [showActions, setShowActions] = useState(false)
  const [showMoreStats, setShowMoreStats] = useState(false)
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([])
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([])

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus !== 'true') {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)

    // Check for tab parameter in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab')
      if (tab && ['all', 'portfolio', 'blog', 'thoughts', 'work', 'skills', 'education', 'testimonials', 'contact'].includes(tab)) {
        setActiveTab(tab as any)
      }
    }

    // Load posts
    const loadPosts = () => {
      const storedPosts = localStorage.getItem('posts')
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts))
      }
    }

    // Load work experiences
    const loadWorkExperiences = () => {
      const storedExperiences = localStorage.getItem('workExperiences')
      if (storedExperiences) {
        const experiences = JSON.parse(storedExperiences)
        // Sort by start date (newest first)
        experiences.sort((a: WorkExperience, b: WorkExperience) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
        setWorkExperiences(experiences)
      }
    }

    // Load skills
    const loadSkills = () => {
      const storedSkills = localStorage.getItem('skills')
      if (storedSkills) {
        const skillsData = JSON.parse(storedSkills)
        // Sort by category
        skillsData.sort((a: Skill, b: Skill) => a.category.localeCompare(b.category))
        setSkills(skillsData)
      }
    }

    // Load educations
    const loadEducations = () => {
      const storedEducations = localStorage.getItem('educations')
      if (storedEducations) {
        const educationsData = JSON.parse(storedEducations)
        // Sort by start date (newest first)
        educationsData.sort((a: Education, b: Education) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
        setEducations(educationsData)
      }
    }

    // Load testimonials
    const loadTestimonials = () => {
      const storedTestimonials = localStorage.getItem('testimonials')
      if (storedTestimonials) {
        const testimonialsData = JSON.parse(storedTestimonials)
        // Sort by creation date (newest first)
        testimonialsData.sort((a: Testimonial, b: Testimonial) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setTestimonials(testimonialsData)
      }
    }

    // Load contact links
    const loadContactLinks = () => {
      const storedContactLinks = localStorage.getItem('contactLinks')
      if (storedContactLinks) {
        const contactLinksData = JSON.parse(storedContactLinks)
        // Sort by creation date (oldest first for display order)
        contactLinksData.sort((a: ContactLink, b: ContactLink) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        setContactLinks(contactLinksData)
      }
    }

    loadPosts()
    loadWorkExperiences()
    loadSkills()
    loadEducations()
    loadTestimonials()
    loadContactLinks()
    window.addEventListener('storage', () => {
      loadPosts()
      loadWorkExperiences()
      loadSkills()
      loadEducations()
      loadTestimonials()
      loadContactLinks()
    })
    return () => window.removeEventListener('storage', () => {
      loadPosts()
      loadWorkExperiences()
      loadSkills()
      loadEducations()
      loadTestimonials()
      loadContactLinks()
    })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    router.push('/admin/login')
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这条内容吗？')) {
      const updatedPosts = posts.filter(post => post.id !== id)
      localStorage.setItem('posts', JSON.stringify(updatedPosts))
      setPosts(updatedPosts)
    }
  }

  const handleDeleteWorkExperience = (id: number) => {
    if (confirm('确定要删除这个工作经历吗？')) {
      const updatedExperiences = workExperiences.filter(exp => exp.id !== id)
      localStorage.setItem('workExperiences', JSON.stringify(updatedExperiences))
      setWorkExperiences(updatedExperiences)
    }
  }

  const handleDeleteSkill = (id: number) => {
    if (confirm('确定要删除这个技能分类吗？')) {
      const updatedSkills = skills.filter(s => s.id !== id)
      localStorage.setItem('skills', JSON.stringify(updatedSkills))
      setSkills(updatedSkills)
    }
  }

  const handleDeleteEducation = (id: number) => {
    if (confirm('确定要删除这个教育背景吗？')) {
      const updatedEducations = educations.filter(e => e.id !== id)
      localStorage.setItem('educations', JSON.stringify(updatedEducations))
      setEducations(updatedEducations)
    }
  }

  const handleDeleteTestimonial = (id: number) => {
    if (confirm('确定要删除这个评价吗？')) {
      const updatedTestimonials = testimonials.filter(t => t.id !== id)
      localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
      setTestimonials(updatedTestimonials)
    }
  }

  const handleDeleteContactLink = (id: number) => {
    if (confirm('确定要删除这个联系方式吗？')) {
      const updatedContactLinks = contactLinks.filter(c => c.id !== id)
      localStorage.setItem('contactLinks', JSON.stringify(updatedContactLinks))
      setContactLinks(updatedContactLinks)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const filteredPostsByTab = activeTab === 'all' 
    ? posts 
    : activeTab === 'work' || activeTab === 'skills' || activeTab === 'education' || activeTab === 'testimonials' || activeTab === 'contact'
    ? []
    : posts.filter(post => post.type === activeTab)
  const searchLower = query.trim().toLowerCase()
  const visiblePosts = filteredPostsByTab.filter(p => !searchLower || (p.title + ' ' + p.content).toLowerCase().includes(searchLower))
  const visibleWork = workExperiences.filter(e => !searchLower || (
    (e.company + ' ' + e.position + ' ' + e.location + ' ' + e.clients).toLowerCase().includes(searchLower) ||
    e.responsibilities.join(' ').toLowerCase().includes(searchLower)
  ))
  const visibleSkills = skills.filter(s => !searchLower || (
    s.category.toLowerCase().includes(searchLower) || s.skills.join(' ').toLowerCase().includes(searchLower)
  ))
  const visibleEducations = educations.filter(e => !searchLower || (
    (e.school + ' ' + e.degree + ' ' + e.major + ' ' + e.location).toLowerCase().includes(searchLower)
  ))
  const visibleTestimonials = testimonials.filter(t => !searchLower || (
    (t.content + ' ' + t.authorName + ' ' + t.position + ' ' + (t.company||'')).toLowerCase().includes(searchLower)
  ))
  const visibleContacts = contactLinks.filter(c => !searchLower || (
    (c.label + ' ' + c.value + ' ' + (c.link||'')).toLowerCase().includes(searchLower)
  ))

  const labels = {
    all: '全部',
    portfolio: '作品集',
    blog: '博客',
    thoughts: '牢骚',
    work: '工作经历',
    skills: '技能',
    education: '教育背景',
    testimonials: '客户评价',
    contact: '联系方式'
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
      
      
      {/* Header */}
      <header className="border-b border-[#383838]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              管理后台
            </h1>
            <div className="flex items-center gap-3 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索..."
                className="hidden md:block px-3 py-2 bg-[#111] border border-[#383838] text-white placeholder:text-[#ABABAB] focus:outline-none focus:border-white text-sm"
              />
              <Link 
                href="/admin/batch-create" 
                className="text-white hover:text-[#ABABAB] transition-colors text-sm md:text-base font-medium border border-green-500/50 px-4 py-2 hover:border-green-500 bg-green-500/10"
              >
                📦 批量添加
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowActions(v => !v)}
                  className="text-white hover:text-[#ABABAB] transition-colors text-sm md:text-base font-medium border border-[#383838] px-4 py-2 hover:border-white"
                >
                  新建 ▾
                </button>
                {showActions && (
                  <div className="absolute right-0 mt-2 w-44 bg-black border border-[#383838] shadow-xl z-20">
                    <Link href="/admin/create" className="block px-4 py-2 text-sm text-[#ABABAB] hover:text-white hover:bg-[#111]">创建内容</Link>
                    <Link href="/admin/work-experience/create" className="block px-4 py-2 text-sm text-[#ABABAB] hover:text-white hover:bg-[#111]">添加工作经历</Link>
                    <Link href="/admin/skills/create" className="block px-4 py-2 text-sm text-[#ABABAB] hover:text-white hover:bg-[#111]">添加技能</Link>
                    <Link href="/admin/education/create" className="block px-4 py-2 text-sm text-[#ABABAB] hover:text-white hover:bg-[#111]">添加教育</Link>
                    <Link href="/admin/testimonials/create" className="block px-4 py-2 text-sm text-[#ABABAB] hover:text-white hover:bg-[#111]">添加评价</Link>
                    <Link href="/admin/contact/create" className="block px-4 py-2 text-sm text-[#ABABAB] hover:text-white hover:bg-[#111]">添加联系方式</Link>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-[#ABABAB] hover:text-white transition-colors text-sm md:text-base"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-5 md:px-10 py-8 md:py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4">
          <div className="border border-[#383838] p-6">
            <p className="text-[#ABABAB] text-sm mb-2">总内容</p>
            <p className="text-3xl font-semibold text-white">{posts.length}</p>
          </div>
          <div className="border border-[#383838] p-6">
            <p className="text-[#ABABAB] text-sm mb-2">作品集</p>
            <p className="text-3xl font-semibold text-white">{posts.filter(p => p.type === 'portfolio').length}</p>
          </div>
          <div className="border border-[#383838] p-6">
            <p className="text-[#ABABAB] text-sm mb-2">博客</p>
            <p className="text-3xl font-semibold text-white">{posts.filter(p => p.type === 'blog').length}</p>
          </div>
          <div className="border border-[#383838] p-6">
            <p className="text-[#ABABAB] text-sm mb-2">牢骚</p>
            <p className="text-3xl font-semibold text-white">{posts.filter(p => p.type === 'thoughts').length}</p>
          </div>
          {showMoreStats && (
            <>
              <div className="border border-[#383838] p-6"><p className="text-[#ABABAB] text-sm mb-2">工作经历</p><p className="text-3xl font-semibold text-white">{workExperiences.length}</p></div>
              <div className="border border-[#383838] p-6"><p className="text-[#ABABAB] text-sm mb-2">技能分类</p><p className="text-3xl font-semibold text-white">{skills.length}</p></div>
              <div className="border border-[#383838] p-6"><p className="text-[#ABABAB] text-sm mb-2">教育背景</p><p className="text-3xl font-semibold text-white">{educations.length}</p></div>
              <div className="border border-[#383838] p-6"><p className="text-[#ABABAB] text-sm mb-2">客户评价</p><p className="text-3xl font-semibold text-white">{testimonials.length}</p></div>
              <div className="border border-[#383838] p-6"><p className="text-[#ABABAB] text-sm mb-2">联系方式</p><p className="text-3xl font-semibold text-white">{contactLinks.length}</p></div>
            </>
          )}
        </div>
        <div className="mb-8">
          <button onClick={() => setShowMoreStats(v => !v)} className="px-3 py-1.5 text-xs border border-[#383838] text-[#ABABAB] hover:text-white hover:border-white transition-colors">
            {showMoreStats ? '隐藏更多统计' : '展开更多统计'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#383838]">
          {(['all', 'portfolio', 'blog', 'thoughts', 'work', 'skills', 'education', 'testimonials', 'contact'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                // Update URL with tab parameter
                const url = new URL(window.location.href)
                url.searchParams.set('tab', tab)
                window.history.replaceState({}, '', url.toString())
              }}
              className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-[#ABABAB] hover:text-white'
              }`}
            >
              {labels[tab]}
            </button>
          ))}
        </div>

        {/* Content List */}
        {activeTab === 'contact' ? (
          /* Contact Links List */
          visibleContacts.length === 0 ? (
            <div className="text-center py-20 border border-[#383838]">
              <div className="inline-block p-6 mb-4">
                <svg className="w-16 h-16 text-[#ABABAB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无联系方式</h3>
              <p className="text-[#ABABAB] mb-6">点击"添加联系方式"按钮开始添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleContacts.map((contactLink) => (
                <div
                  key={contactLink.id}
                  className="border border-[#383838] p-6 hover:border-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-[#ABABAB] uppercase tracking-wider px-2 py-1 border border-[#383838]">
                          联系方式
                        </span>
                        <span className="text-xs text-[#ABABAB]">
                          {new Date(contactLink.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{contactLink.label}</h3>
                      <p className="text-[#ABABAB] text-sm mb-1">{contactLink.value}</p>
                      {contactLink.link && (
                        <p className="text-[#ABABAB] text-sm">{contactLink.link}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/contact/edit/${contactLink.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors border border-blue-400/20 px-3 py-1.5 hover:border-blue-400/40"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteContactLink(contactLink.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors border border-red-400/20 px-3 py-1.5 hover:border-red-400/40"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'skills' ? (
          /* Skills List */
          visibleSkills.length === 0 ? (
            <div className="text-center py-20 border border-[#383838]">
              <div className="inline-block p-6 mb-4">
                <svg className="w-16 h-16 text-[#ABABAB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无技能分类</h3>
              <p className="text-[#ABABAB] mb-6">点击"添加技能"按钮开始添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => setSelectedSkillIds(visibleSkills.map(s => s.id))}
                    className="px-3 py-1 border border-[#383838] text-[#ABABAB] hover:text-white hover:border-white transition-colors"
                  >全选</button>
                  <button
                    onClick={() => setSelectedSkillIds([])}
                    className="px-3 py-1 border border-[#383838] text-[#ABABAB] hover:text-white hover:border-white transition-colors"
                  >清空</button>
                </div>
                <button
                  onClick={() => {
                    if (selectedSkillIds.length === 0) return;
                    if (!confirm(`确认批量删除 ${selectedSkillIds.length} 个技能分类？`)) return;
                    const remaining = skills.filter(s => !selectedSkillIds.includes(s.id));
                    localStorage.setItem('skills', JSON.stringify(remaining));
                    setSkills(remaining);
                    setSelectedSkillIds([]);
                  }}
                  className="px-3 py-1 border border-red-500/40 text-red-400 hover:text-red-300 hover:border-red-400 transition-colors text-sm"
                >批量删除</button>
              </div>
              {visibleSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="border border-[#383838] p-6 hover:border-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedSkillIds.includes(skill.id)}
                          onChange={(e) => {
                            setSelectedSkillIds(prev => e.target.checked ? [...prev, skill.id] : prev.filter(id => id !== skill.id))
                          }}
                          className="w-4 h-4 accent-white"
                        />
                        <span className="text-xs font-medium text-[#ABABAB] uppercase tracking-wider px-2 py-1 border border-[#383838]">
                          技能分类
                        </span>
                        <span className="text-xs text-[#ABABAB]">
                          {new Date(skill.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{skill.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skill.skills.map((skillName, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#1a1a1a] border border-[#383838] text-[#ABABAB] text-sm rounded"
                          >
                            {skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/skills/edit/${skill.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors border border-blue-400/20 px-3 py-1.5 hover:border-blue-400/40"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors border border-red-400/20 px-3 py-1.5 hover:border-red-400/40"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'education' ? (
          /* Education List */
          visibleEducations.length === 0 ? (
            <div className="text-center py-20 border border-[#383838]">
              <div className="inline-block p-6 mb-4">
                <svg className="w-16 h-16 text-[#ABABAB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无教育背景</h3>
              <p className="text-[#ABABAB] mb-6">点击"添加教育"按钮开始添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleEducations.map((education) => (
                <div
                  key={education.id}
                  className="border border-[#383838] p-6 hover:border-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-[#ABABAB] uppercase tracking-wider px-2 py-1 border border-[#383838]">
                          教育背景
                        </span>
                        <span className="text-xs text-[#ABABAB]">
                          {new Date(education.startDate).toLocaleDateString('zh-CN')} - {new Date(education.endDate).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{education.degree}</h3>
                      <p className="text-[#ABABAB] text-sm mb-1">{education.school}</p>
                      <p className="text-[#ABABAB] text-sm mb-1">{education.major}</p>
                      <p className="text-[#ABABAB] text-sm mb-2">{education.location}</p>
                      {education.description && (
                        <p className="text-white text-sm">{education.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/education/edit/${education.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors border border-blue-400/20 px-3 py-1.5 hover:border-blue-400/40"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteEducation(education.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors border border-red-400/20 px-3 py-1.5 hover:border-red-400/40"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'testimonials' ? (
          /* Testimonials List */
          visibleTestimonials.length === 0 ? (
            <div className="text-center py-20 border border-[#383838]">
              <div className="inline-block p-6 mb-4">
                <svg className="w-16 h-16 text-[#ABABAB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无客户评价</h3>
              <p className="text-[#ABABAB] mb-6">点击"添加评价"按钮开始添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border border-[#383838] p-6 hover:border-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-[#ABABAB] uppercase tracking-wider px-2 py-1 border border-[#383838]">
                          客户评价
                        </span>
                        <span className="text-xs text-[#ABABAB]">
                          {new Date(testimonial.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed mb-3">"{testimonial.content}"</p>
                      <div className="text-[#ABABAB] text-sm">
                        <p className="font-medium">{testimonial.authorName}</p>
                        <p>{testimonial.position}</p>
                        {testimonial.company && <p>{testimonial.company}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/testimonials/edit/${testimonial.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors border border-blue-400/20 px-3 py-1.5 hover:border-blue-400/40"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors border border-red-400/20 px-3 py-1.5 hover:border-red-400/40"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'work' ? (
          /* Work Experiences List */
          workExperiences.length === 0 ? (
            <div className="text-center py-20 border border-[#383838]">
              <div className="inline-block p-6 mb-4">
                <svg className="w-16 h-16 text-[#ABABAB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无工作经历</h3>
              <p className="text-[#ABABAB] mb-6">点击"添加工作经历"按钮开始添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workExperiences.map((experience) => (
                <div
                  key={experience.id}
                  className="border border-[#383838] p-6 hover:border-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-[#ABABAB] uppercase tracking-wider px-2 py-1 border border-[#383838]">
                          工作经历
                        </span>
                        <span className="text-xs text-[#ABABAB]">
                          {new Date(experience.startDate).toLocaleDateString('zh-CN')} - {experience.endDate === 'present' ? '至今' : new Date(experience.endDate).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{experience.company}</h3>
                      <p className="text-[#ABABAB] text-sm mb-2">{experience.position} • {experience.location}</p>
                      <div className="text-[#ABABAB] text-sm">
                        <p className="line-clamp-2">{experience.responsibilities[0]}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/work-experience/edit/${experience.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors border border-blue-400/20 px-3 py-1.5 hover:border-blue-400/40"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteWorkExperience(experience.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors border border-red-400/20 px-3 py-1.5 hover:border-red-400/40"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-20 border border-[#383838]">
            <div className="inline-block p-6 mb-4">
              <svg className="w-16 h-16 text-[#ABABAB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">暂无内容</h3>
            <p className="text-[#ABABAB] mb-6">点击"创建内容"按钮开始添加</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setSelectedPostIds(visiblePosts.map(p => p.id))}
                  className="px-3 py-1 border border-[#383838] text-[#ABABAB] hover:text-white hover:border-white transition-colors"
                >全选</button>
                <button
                  onClick={() => setSelectedPostIds([])}
                  className="px-3 py-1 border border-[#383838] text-[#ABABAB] hover:text-white hover:border-white transition-colors"
                >清空</button>
              </div>
              <button
                onClick={() => {
                  if (selectedPostIds.length === 0) return;
                  if (!confirm(`确认批量删除 ${selectedPostIds.length} 条内容？`)) return;
                  const remaining = posts.filter(p => !selectedPostIds.includes(p.id));
                  localStorage.setItem('posts', JSON.stringify(remaining));
                  setPosts(remaining);
                  setSelectedPostIds([]);
                }}
                className="px-3 py-1 border border-red-500/40 text-red-400 hover:text-red-300 hover:border-red-400 transition-colors text-sm"
              >批量删除</button>
            </div>
            {visiblePosts.map((post) => (
              <div
                key={post.id}
                className="border border-[#383838] p-6 hover:border-white transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.includes(post.id)}
                        onChange={(e) => {
                          setSelectedPostIds(prev => e.target.checked ? [...prev, post.id] : prev.filter(id => id !== post.id))
                        }}
                        className="w-4 h-4 accent-white"
                      />
                      <span className="text-xs font-medium text-[#ABABAB] uppercase tracking-wider px-2 py-1 border border-[#383838]">
                        {labels[post.type]}
                      </span>
                      <span className="text-xs text-[#ABABAB]">
                        {new Date(post.date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                    <p className="text-[#ABABAB] text-sm line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors border border-blue-400/20 px-3 py-1.5 hover:border-blue-400/40"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors border border-red-400/20 px-3 py-1.5 hover:border-red-400/40"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#383838]">
          <a 
            href="/" 
            className="text-[#ABABAB] hover:text-white transition-colors text-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </a>
        </div>
      </main>
    </div>
  )
}
