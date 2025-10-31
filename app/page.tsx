'use client'

import { useState, useEffect, useRef } from 'react'
import ContactModal from './components/ContactModal'
import Gallery from './components/Gallery';

// 扩展Window接口以支持全局鼠标位置
declare global {
  interface Window {
    mouseX?: number
    mouseY?: number
  }
}

interface Post {
  id: number
  type: 'portfolio' | 'blog' | 'thoughts'
  title: string
  content: string
  image?: string
  date: string
  timeCategory?: string // 时间分类字段，格式为 /year/mo/day/
}

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
  schoolLink?: string
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

// 时间分类函数
const getTimeCategory = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `/${year}/${month}/${day}/`
}

// 按时间分类组织帖子的函数
const organizePostsByTime = (posts: Post[]) => {
  const timeCategories: { [key: string]: Post[] } = {}
  
  posts.forEach(post => {
    const timeCategory = getTimeCategory(post.date)
    if (!timeCategories[timeCategory]) {
      timeCategories[timeCategory] = []
    }
    timeCategories[timeCategory].push(post)
  })
  
  // 按时间排序（新到老）
  const sortedCategories = Object.keys(timeCategories).sort((a, b) => {
    const dateA = new Date(a.replace(/\//g, '-').slice(1, -1))
    const dateB = new Date(b.replace(/\//g, '-').slice(1, -1))
    return dateB.getTime() - dateA.getTime()
  })
  
  return { timeCategories, sortedCategories }
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([])
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'blog' | 'thoughts'>('about')
  const [numColumns, setNumColumns] = useState(3)
  
  // 动画状态
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  
  // 抽屉状态管理
  const [expandedTimeCategories, setExpandedTimeCategories] = useState<Set<string>>(new Set())
  
  // 移动端菜单状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 联系方式模态框状态
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactModalData, setContactModalData] = useState({
    title: '',
    content: '',
    qqNumber: '',
    telegramUsername: ''
  })

  // 切换时间分类抽屉状态
  const toggleTimeCategory = (timeCategory: string) => {
    setExpandedTimeCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(timeCategory)) {
        newSet.delete(timeCategory)
      } else {
        newSet.add(timeCategory)
      }
      return newSet
    })
  }

  // 处理联系方式点击
  const handleContactClick = (contactLink: ContactLink) => {
    if (contactLink.label.toLowerCase().includes('qq')) {
      setContactModalData({
        title: 'QQ联系方式',
        content: '请添加以下QQ号码进行联系：',
        qqNumber: contactLink.value.replace('QQ: ', '').replace('QQ：', ''),
        telegramUsername: ''
      })
      setIsContactModalOpen(true)
    } else if (contactLink.label.toLowerCase().includes('telegram')) {
      setContactModalData({
        title: 'Telegram联系方式',
        content: '请通过以下Telegram用户名进行联系：',
        qqNumber: '',
        telegramUsername: contactLink.value.replace('Telegram: ', '').replace('Telegram：', '').replace('@', '')
      })
      setIsContactModalOpen(true)
    } else if (contactLink.link) {
      // 其他有链接的联系方式直接打开
      window.open(contactLink.link, contactLink.link.startsWith('http') ? '_blank' : '_self')
    }
  }


  // 页面加载动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // 重叠文本效果
  useEffect(() => {
    const elements = document.querySelectorAll('[data-overlap-text]')
    elements.forEach(e => {
      const text = e.textContent || ''
      const chars = text.split('')
      e.innerHTML = chars.map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')
    })
  }, [])

  useEffect(() => {
    // Load posts from localStorage
    const loadPosts = () => {
      if (typeof window === 'undefined') return;
      try {
        const storedPosts = localStorage.getItem('posts')
        if (storedPosts) {
          const parsed = JSON.parse(storedPosts)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed)
            return
          }
        }
      } catch (e) {
        console.error('Failed to parse posts:', e)
      }
      // 如果没有数据或数据为空，初始化默认数据
      const examples = [
          {
            id: 1,
            type: 'portfolio' as const,
            title: '示例设计作品',
            content: '这是一个示例作品，展示你的设计能力和创造力。点击右上角的管理后台可以添加更多内容。',
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
            date: new Date().toISOString(),
            timeCategory: getTimeCategory(new Date().toISOString())
          },
          {
            id: 2,
            type: 'portfolio' as const,
            title: '品牌设计案例',
            content: '完整的品牌视觉识别系统设计，包括标志、配色方案和品牌形象。',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨天
            timeCategory: getTimeCategory(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          },
          {
            id: 3,
            type: 'blog' as const,
            title: '设计思考',
            content: '移动应用界面设计，注重用户体验和视觉美感。这是一个详细的描述，展示设计的各个方面。',
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 前天
            timeCategory: getTimeCategory(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
          },
          {
            id: 4,
            type: 'thoughts' as const,
            title: '日常随想',
            content: '数字插画创作，运用色彩和构图表达创意理念。这个作品展现了艺术与技术结合的魅力。',
            image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1000&fit=crop',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天前
            timeCategory: getTimeCategory(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
          },
          {
            id: 5,
            type: 'portfolio' as const,
            title: '平面设计',
            content: '海报设计作品，融合传统与现代元素。',
            image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=800&fit=crop',
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4天前
            timeCategory: getTimeCategory(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString())
          }
        ]
        setPosts(examples)
        localStorage.setItem('posts', JSON.stringify(examples))
    }

    loadPosts()
    window.addEventListener('storage', loadPosts)
    return () => window.removeEventListener('storage', loadPosts)
  }, [])

  // Load work experiences from localStorage
  useEffect(() => {
    const loadWorkExperiences = () => {
      if (typeof window === 'undefined') return;
      const storedExperiences = localStorage.getItem('workExperiences')
      if (storedExperiences) {
        try {
          const experiences = JSON.parse(storedExperiences)
          if (Array.isArray(experiences) && experiences.length > 0) {
            // Sort by start date (newest first)
            experiences.sort((a: WorkExperience, b: WorkExperience) => 
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            )
            setWorkExperiences(experiences)
            return
          }
        } catch (e) {
          console.error('Failed to parse work experiences:', e)
        }
      }
      // 如果没有数据或数据为空，初始化默认数据
        // Initial dummy data
        const initialExperiences: WorkExperience[] = [
          {
            id: 1,
            position: '智化设计顾问有限公司',
            company: '装修设计机构',
            startDate: '2025-05-01',
            endDate: 'present',
            location: '现场 & 深圳南山, 中国',
            responsibilities: [
              '负责平安银行各地区分行的品牌设计，包括标志，宣传册，海报，物料的设计内容以及排版等',
              '客户包括：平安银行各地区分行：南山分行，济南分行，上海分行等其他分行'
            ],
            clients: '平安银行各地区分行',
            createdAt: new Date().toISOString()
          }
        ]
        setWorkExperiences(initialExperiences)
        localStorage.setItem('workExperiences', JSON.stringify(initialExperiences))
    }

    loadWorkExperiences()
    window.addEventListener('storage', loadWorkExperiences)
    return () => window.removeEventListener('storage', loadWorkExperiences)
  }, [])

  // Load skills from localStorage
  useEffect(() => {
    const loadSkills = () => {
      if (typeof window === 'undefined') return;
      const storedSkills = localStorage.getItem('skills')
      if (storedSkills) {
        try {
          const skillsData = JSON.parse(storedSkills)
          if (Array.isArray(skillsData) && skillsData.length > 0) {
            // Sort by category
            skillsData.sort((a: Skill, b: Skill) => a.category.localeCompare(b.category))
            setSkills(skillsData)
            return
          }
        } catch (e) {
          console.error('Failed to parse skills:', e)
        }
      }
      // 如果没有数据或数据为空，初始化默认数据
        // Initial dummy data
        const initialSkills: Skill[] = [
          {
            id: 1,
            category: '设计软件',
            skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Sketch'],
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            category: '编程语言',
            skills: ['JavaScript', 'TypeScript', 'HTML/CSS', 'React', 'Next.js'],
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            category: '其他技能',
            skills: ['品牌设计', 'UI/UX设计', '平面设计', '插画', '摄影'],
            createdAt: new Date().toISOString()
          }
        ]
        setSkills(initialSkills)
        localStorage.setItem('skills', JSON.stringify(initialSkills))
    }

    loadSkills()
    window.addEventListener('storage', loadSkills)
    return () => window.removeEventListener('storage', loadSkills)
  }, [])

  // Load educations from localStorage
  useEffect(() => {
    const loadEducations = () => {
      if (typeof window === 'undefined') return;
      const storedEducations = localStorage.getItem('educations')
      if (storedEducations) {
        try {
          const educationsData = JSON.parse(storedEducations)
          if (Array.isArray(educationsData) && educationsData.length > 0) {
            // Sort by start date (newest first)
            educationsData.sort((a: Education, b: Education) => 
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            )
            setEducations(educationsData)
            return
          }
        } catch (e) {
          console.error('Failed to parse educations:', e)
        }
      }
      // 如果没有数据或数据为空，初始化默认数据
        // Initial dummy data
        const initialEducations: Education[] = [
          {
            id: 1,
            degree: '学士学位',
            school: '某某大学',
            major: '平面设计',
            startDate: '2018-09-01',
            endDate: '2022-06-01',
            location: '北京，中国',
            description: '主修平面设计，辅修数字媒体艺术。在校期间获得多项设计奖项。',
            createdAt: new Date().toISOString()
          }
        ]
        setEducations(initialEducations)
        localStorage.setItem('educations', JSON.stringify(initialEducations))
    }

    loadEducations()
    window.addEventListener('storage', loadEducations)
    return () => window.removeEventListener('storage', loadEducations)
  }, [])

  // Load testimonials from localStorage
  useEffect(() => {
    const loadTestimonials = () => {
      if (typeof window === 'undefined') return;
      const storedTestimonials = localStorage.getItem('testimonials')
      if (storedTestimonials) {
        try {
          const testimonialsData = JSON.parse(storedTestimonials)
          if (Array.isArray(testimonialsData) && testimonialsData.length > 0) {
            // Sort by creation date (newest first)
            testimonialsData.sort((a: Testimonial, b: Testimonial) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            setTestimonials(testimonialsData)
            return
          }
        } catch (e) {
          console.error('Failed to parse testimonials:', e)
        }
      }
      // 如果没有数据或数据为空，初始化默认数据
        // Initial dummy data
        const initialTestimonials: Testimonial[] = [
          {
            id: 1,
            content: '非常专业的设计师，对细节的把控非常到位，项目交付质量超出预期。',
            authorName: '张经理',
            position: '产品经理',
            company: '某科技公司',
            createdAt: new Date().toISOString()
          }
        ]
        setTestimonials(initialTestimonials)
        localStorage.setItem('testimonials', JSON.stringify(initialTestimonials))
    }

    loadTestimonials()
    window.addEventListener('storage', loadTestimonials)
    return () => window.removeEventListener('storage', loadTestimonials)
  }, [])

  // Load contact links from localStorage
  useEffect(() => {
    const loadContactLinks = () => {
      if (typeof window === 'undefined') return;
      const storedContactLinks = localStorage.getItem('contactLinks')
      if (storedContactLinks) {
        try {
          const contactLinksData = JSON.parse(storedContactLinks)
          if (Array.isArray(contactLinksData) && contactLinksData.length > 0) {
            // Sort by creation date (oldest first for display order)
            contactLinksData.sort((a: ContactLink, b: ContactLink) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            setContactLinks(contactLinksData)
            return
          }
        } catch (e) {
          console.error('Failed to parse contact links:', e)
        }
      }
      // 如果没有数据或数据为空，初始化默认数据
        // Initial dummy data
        const initialContactLinks: ContactLink[] = [
          {
            id: 1,
            label: '邮箱',
            value: 'huidw@mail.broward.edu',
            link: 'mailto:huidw@mail.broward.edu',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            label: '电话',
            value: '(+86) 191-6366-0454',
            link: 'tel:+8619163660454',
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            label: 'QQ/Telegram',
            value: 'QQ/Telegram',
            createdAt: new Date().toISOString()
          }
        ]
        setContactLinks(initialContactLinks)
        localStorage.setItem('contactLinks', JSON.stringify(initialContactLinks))
    }

    loadContactLinks()
    window.addEventListener('storage', loadContactLinks)
    return () => window.removeEventListener('storage', loadContactLinks)
  }, [])



  // 响应式列数
  useEffect(() => {
    const updateColumns = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        if (width < 768) {
          setNumColumns(1)
        } else if (width < 1024) {
          setNumColumns(2)
        } else {
          setNumColumns(3)
        }
      }
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const labels = {
    about: '#关于',
    portfolio: '#作品集',
    blog: '#博客',
    thoughts: '#牢骚'
  }

  const tabCounts = {
    about: 0,
    portfolio: posts.filter(p => p.type === 'portfolio').length,
    blog: posts.filter(p => p.type === 'blog').length,
    thoughts: posts.filter(p => p.type === 'thoughts').length
  }

  const filteredPosts = activeTab === 'about' ? [] : posts.filter(post => post.type === activeTab)
  
  // 按时间分类组织帖子
  const { timeCategories, sortedCategories } = organizePostsByTime(filteredPosts)

  // 默认展开 博客/牢骚 的时间分组，避免“看起来没内容”的误会
  useEffect(() => {
    if (activeTab === 'blog' || activeTab === 'thoughts') {
      setExpandedTimeCategories(new Set(sortedCategories))
    } else if (activeTab === 'about') {
      setExpandedTimeCategories(new Set())
    }
  }, [activeTab, sortedCategories])

  return (
    <div className="min-h-screen text-white relative">
      {/* 背景动画肌理 */}
      <div className="background-texture">
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element" style={{animationDelay: '-5s', top: '70%', right: '10%'}}></div>
        <div className="drift-element" style={{animationDelay: '-10s', bottom: '20%', left: '60%'}}></div>
      </div>
      
      
      
      {/* Fixed Top Navigation */}
      <header className="border-b border-[#383838] sticky top-0 z-[12010] bg-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* LOGO */}
            <h1 
              className="overlap-text-front text-base md:text-2xl lg:text-3xl font-black text-white cursor-pointer flex-shrink-0"
              style={{ letterSpacing: '-0.25ch' }}
              data-overlap-text="front"
              onClick={() => window.location.href = '/'}
            >
              WEI HUI DONG
            </h1>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {(['about', 'portfolio', 'blog', 'thoughts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs font-semibold transition-colors duration-100 border-b-2 whitespace-nowrap ${
                    activeTab === tab ? 'border-white text-white' : 'border-transparent text-[#ABABAB] hover:text-white hover:border-white'
                  }`}
                >
                  {labels[tab]} <span className="ml-1 opacity-60">{tabCounts[tab]}</span>
                </button>
              ))}
            </nav>
            
            {/* Desktop Admin Button */}
            <a
              href="/admin/login"
              className="hidden md:block text-white hover:text-[#ABABAB] transition-all duration-300 text-sm px-4 py-2 border border-[#383838] hover:border-white flex-shrink-0"
            >
              管理后台
            </a>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-[#ABABAB] transition-colors px-3 py-2 border border-[#383838] hover:border-white"
              aria-label="菜单"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#383838] space-y-2 mobile-menu-enter">
              {(['about', 'portfolio', 'blog', 'thoughts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors border-l-2 ${
                    activeTab === tab 
                      ? 'border-white text-white bg-white/5' 
                      : 'border-transparent text-[#ABABAB] hover:text-white hover:border-white hover:bg-white/5'
                  }`}
                >
                  {labels[tab]} <span className="ml-2 opacity-60">{tabCounts[tab]}</span>
                </button>
              ))}
              <a
                href="/admin/login"
                className="block w-full text-left px-4 py-3 text-sm font-semibold text-[#ABABAB] hover:text-white border-l-2 border-transparent hover:border-white hover:bg-white/5 transition-colors"
              >
                管理后台
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-5 md:px-10 py-8 md:py-12 relative z-10">
        {/* Tab Content */}
        {activeTab === 'portfolio' ? (
          <Gallery />
        ) : activeTab === 'about' ? (
          <div className="max-w-8xl">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
              {/* 左栏：介绍 + 联系方式 */}
              <div className="w-full lg:w-1/4">
                {/* 个人介绍 */}
                <div className="mb-8 lg:mb-12">
                  <h1 
                    className="text-xl lg:text-2xl font-semibold text-white mb-4"
                  >
                    平面设计师
                  </h1>
                  <div 
                    className="h-px bg-[#383838] mb-4 lg:mb-5"
                  ></div>
                  <p 
                    className="text-[#ABABAB] text-sm leading-relaxed"
                  >
                    致力于创造简洁而富有感染力的作品。<br/>
                    相信好的设计能够连接人与技术，传递情感与价值。
                  </p>
                </div>

                {/* 联系方式 */}
                <div className="space-y-0">
                  {contactLinks.length > 0 ? (
                    contactLinks.map((contactLink, index) => (
                      <div 
                        key={contactLink.id} 
                        className="border-t border-[#383838] py-4 group cursor-pointer"
                        onClick={() => handleContactClick(contactLink)}
                        onMouseEnter={() => setHoveredElement(`contact-${contactLink.id}`)}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <div className="text-[#ABABAB] text-sm group-hover:text-black group-hover:bg-white py-3 -my-3 transition-colors duration-100">
                          {contactLink.value} ↗
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#ABABAB] text-sm">暂无联系方式</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 右栏：工作经历和技能 */}
              <div className="w-full lg:w-3/4 lg:ml-auto">
                {/* 工作经历部分 */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 lg:mb-5">
                    工作经历
                  </h2>
                  <div className="h-px bg-[#383838] mb-5"></div>
                  
                  {/* 工作经历列表 */}
                  {workExperiences.length > 0 ? (
                    workExperiences.map((experience, index) => (
                      <div key={experience.id}>
                        <div className="mb-8 group">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* 左栏：工作信息 */}
                            <div className="lg:w-2/4">
                              <h3 className="text-white font-semibold text-sm mb-2">
                                {experience.companyLink ? (
                                  <a 
                                    href={experience.companyLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-[#ABABAB] transition-colors arrow-text"
                                  >
                                    {experience.company} ↗
                                  </a>
                                ) : (
                                  <span className="arrow-text">{experience.company} ↗</span>
                                )}
                              </h3>
                              <div className="text-[#ABABAB] text-sm mb-1">
                                {experience.positionLink ? (
                                  <a 
                                    href={experience.positionLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors arrow-text"
                                  >
                                    {experience.position} ↗
                                  </a>
                                ) : (
                                  <span className="arrow-text">{experience.position} ↗</span>
                                )}
                              </div>
                              <div className="text-[#ABABAB] text-sm mb-1">
                                {new Date(experience.startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })} - {experience.endDate === 'present' ? '至今' : new Date(experience.endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                              </div>
                              <div className="text-[#ABABAB] text-sm">{experience.location}</div>
                            </div>
                            
                            {/* 右栏：职责描述 */}
                            <div className="lg:w-2/4">
                              <ul className="space-y-2 text-white text-sm">
                                {experience.responsibilities.map((responsibility, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="w-1 h-1 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>{responsibility}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        {index < workExperiences.length - 1 && (
                          <div className="h-px bg-[#383838] mb-8"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#ABABAB] text-sm">暂无工作经历</p>
                    </div>
                  )}
                </div>

                {/* 技能部分 */}
                <div className="mt-12">
                  <h2 className="text-lg font-semibold text-white mb-4 lg:mb-5">
                    技能
                  </h2>
                  <div className="h-px bg-[#383838] mb-5"></div>
                  
                  {/* 技能列表 */}
                  {skills.length > 0 ? (
                    skills.map((skillCategory, index) => (
                      <div key={skillCategory.id}>
                        <div className="mb-8 group">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* 左栏：技能分类 */}
                            <div className="lg:w-2/4">
                              <h3 className="text-white font-semibold text-sm mb-2">{skillCategory.category}</h3>
                            </div>
                            
                            {/* 右栏：技能列表 */}
                            <div className="lg:w-2/4">
                              <div className="flex flex-wrap gap-2">
                                {skillCategory.skills.map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="px-3 py-1 bg-[#1a1a1a] border border-[#383838] text-[#ABABAB] text-sm rounded hover:border-white hover:text-white transition-all duration-100"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < skills.length - 1 && (
                          <div className="h-px bg-[#383838] mb-8"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#ABABAB] text-sm">暂无技能信息</p>
                    </div>
                  )}
                </div>

                {/* 教育部分 */}
                <div className="mt-12">
                  <h2 className="text-lg font-semibold text-white mb-4 lg:mb-5">教育背景</h2>
                  <div className="h-px bg-[#383838] mb-5"></div>
                  
                  {/* 教育列表 */}
                  {educations.length > 0 ? (
                    educations.map((education, index) => (
                      <div key={education.id}>
                        <div className="mb-8">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* 左栏：教育信息 */}
                            <div className="lg:w-2/4">
                              <h3 className="text-white font-semibold text-sm mb-2">{education.degree}</h3>
                              <div className="text-[#ABABAB] text-sm mb-1">
                                {education.schoolLink ? (
                                  <a 
                                    href={education.schoolLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors arrow-text"
                                  >
                                    {education.school} ↗
                                  </a>
                                ) : (
                                  <span className="arrow-text">{education.school} ↗</span>
                                )}
                              </div>
                              <div className="text-[#ABABAB] text-sm mb-1">{education.major}</div>
                              <div className="text-[#ABABAB] text-sm mb-1">
                                {new Date(education.startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })} - {new Date(education.endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                              </div>
                              <div className="text-[#ABABAB] text-sm">{education.location}</div>
                            </div>
                            
                            {/* 右栏：描述 */}
                            <div className="lg:w-2/4">
                              {education.description && (
                                <p className="text-white text-sm leading-relaxed">{education.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < educations.length - 1 && (
                          <div className="h-px bg-[#383838] mb-8"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#ABABAB] text-sm">暂无教育信息</p>
                    </div>
                  )}
                </div>

                {/* 评价部分 */}
                <div className="mt-12">
                  <h2 className="text-lg font-semibold text-white mb-4 lg:mb-5">客户评价</h2>
                  <div className="h-px bg-[#383838] mb-5"></div>
                  
                  {/* 评价列表 */}
                  {testimonials.length > 0 ? (
                    testimonials.map((testimonial, index) => (
                      <div key={testimonial.id}>
                        <div className="mb-8">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* 左栏：评价内容 */}
                            <div className="lg:w-2/4">
                              <p className="text-white text-sm leading-relaxed mb-4">"{testimonial.content}"</p>
                            </div>
                            
                            {/* 右栏：评价人信息 */}
                            <div className="lg:w-2/4">
                              <div className="text-[#ABABAB] text-sm mb-1">
                                {testimonial.authorLink ? (
                                  <a 
                                    href={testimonial.authorLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                  >
                                    {testimonial.authorName} ↗
                                  </a>
                                ) : (
                                  testimonial.authorName + ' ↗'
                                )}
                              </div>
                              <div className="text-[#ABABAB] text-sm mb-1">{testimonial.position}</div>
                              {testimonial.company && (
                                <div className="text-[#ABABAB] text-sm">{testimonial.company}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < testimonials.length - 1 && (
                          <div className="h-px bg-[#383838] mb-8"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#ABABAB] text-sm">暂无评价信息</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-24 text-center text-neutral-500">暂无内容。</div>
        ) : (
          <div className="mb-8">
            {sortedCategories.length === 0 ? (
              <div className="text-center py-6 text-[#ABABAB]">暂无内容，请先添加！</div>
            ) : (
              sortedCategories.map((timeCategory, index) => {
                const isExpanded = expandedTimeCategories.has(timeCategory)
                const postsInCategory = timeCategories[timeCategory]
                return (
                  <div key={timeCategory} className="mb-8">
                    {/* 时间分类标题 - 可点击的抽屉头部 */}
                    <div 
                      className="mb-6 cursor-pointer group" 
                      onClick={() => toggleTimeCategory(timeCategory)}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white group-hover:text-[#ABABAB] transition-colors duration-200">
                          {timeCategory}
                        </h2>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[#ABABAB]">
                            {postsInCategory.length} 项内容
                          </span>
                          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg 
                              className="w-5 h-5 text-[#ABABAB] group-hover:text-white transition-colors duration-200" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-[#383838] mt-2"></div>
                    </div>
                    {/* 该时间分类下的帖子 - 可折叠的内容 */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div 
                        className="mb-8"
                        style={{
                          columnCount: numColumns,
                          columnGap: '1.5rem'
                        }}
                      >
                        {postsInCategory.map((post, index) => (
                          <article
                            key={post.id}
                            className="group cursor-pointer border border-[#383838] hover:border-white transition-colors duration-100 mb-6 break-inside-avoid"
                            onMouseEnter={() => setHoveredElement(`post-${post.id}`)}
                            onMouseLeave={() => setHoveredElement(null)}
                          >
                            {post.image && (
                              <div className="relative w-full overflow-hidden border-b border-[#383838]">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="w-full h-auto object-cover transition-transform duration-100 group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="p-6">
                              <span className="inline-block text-xs font-medium text-[#ABABAB] mb-3 uppercase tracking-wider">
                                {labels[post.type]}
                              </span>
                              <h2 className="text-lg font-semibold text-white mb-3 group-hover:text-[#ABABAB] transition-colors duration-100">
                                {post.title}
                              </h2>
                              <p className="text-[#ABABAB] text-sm mb-4 leading-relaxed">
                                {post.content}
                              </p>
                              <div className="pt-4 border-t border-[#383838]">
                                <p className="text-xs text-[#ABABAB]">
                                  {new Date(post.date).toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#383838] mt-20">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-8">
          <p className="text-[#ABABAB] text-sm text-center">
            © 2024 个人空间 · 记录生活点滴
          </p>
        </div>
      </footer>
      
      {/* 联系方式模态框 */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={contactModalData.title}
        content={contactModalData.content}
        qqNumber={contactModalData.qqNumber}
        telegramUsername={contactModalData.telegramUsername}
      />
    </div>
  )
}
