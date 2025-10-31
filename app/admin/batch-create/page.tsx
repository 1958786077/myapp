'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ContentType = 'posts' | 'work-experience' | 'skills' | 'education' | 'testimonials' | 'contact'

interface BatchPost {
  type: 'portfolio' | 'blog' | 'thoughts'
  title: string
  content: string
  image?: string
}

interface BatchWorkExperience {
  position: string
  positionLink?: string
  company: string
  companyLink?: string
  startDate: string
  endDate: string
  location: string
  responsibilities: string[]
  clients?: string
}

interface BatchSkill {
  category: string
  skills: string[]
}

interface BatchEducation {
  degree: string
  school: string
  schoolLink?: string
  major: string
  startDate: string
  endDate: string
  location: string
  description?: string
}

interface BatchTestimonial {
  content: string
  authorName: string
  position: string
  company?: string
  authorLink?: string
}

interface BatchContact {
  label: string
  value: string
  link?: string
}

export default function BatchCreate() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [contentType, setContentType] = useState<ContentType>('posts')
  const [importMode, setImportMode] = useState<'paste' | 'json' | 'form'>('paste')
  const [pasteText, setPasteText] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [formItems, setFormItems] = useState<any[]>([{}])
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus !== 'true') {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  // 解析粘贴的文本数据
  const parsePasteText = (text: string, type: ContentType): any[] => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const items: any[] = []

    switch (type) {
      case 'posts':
        // 格式：类型|标题|内容|图片链接（可选）
        lines.forEach((line, index) => {
          const parts = line.split('|').map(p => p.trim())
          if (parts.length >= 3) {
            items.push({
              type: parts[0] || 'portfolio',
              title: parts[1] || '',
              content: parts[2] || '',
              image: parts[3] || ''
            })
          }
        })
        break

      case 'work-experience':
        // 格式：公司|职位|开始日期|结束日期|地点|职责（用;分隔）|客户（可选）|公司链接（可选）|职位链接（可选）
        lines.forEach((line) => {
          const parts = line.split('|').map(p => p.trim())
          if (parts.length >= 6) {
            items.push({
              company: parts[0] || '',
              position: parts[1] || '',
              startDate: parts[2] || '',
              endDate: parts[3] || 'present',
              location: parts[4] || '',
              responsibilities: parts[5] ? parts[5].split(';').filter(r => r.trim()) : [],
              clients: parts[6] || '',
              companyLink: parts[7] || '',
              positionLink: parts[8] || ''
            })
          }
        })
        break

      case 'skills':
        // 格式：分类|技能1,技能2,技能3
        lines.forEach((line) => {
          const parts = line.split('|').map(p => p.trim())
          if (parts.length >= 2) {
            items.push({
              category: parts[0] || '',
              skills: parts[1].split(',').map(s => s.trim()).filter(s => s)
            })
          }
        })
        break

      case 'education':
        // 格式：学位|学校|专业|开始日期|结束日期|地点|描述（可选）|学校链接（可选）
        lines.forEach((line) => {
          const parts = line.split('|').map(p => p.trim())
          if (parts.length >= 6) {
            items.push({
              degree: parts[0] || '',
              school: parts[1] || '',
              major: parts[2] || '',
              startDate: parts[3] || '',
              endDate: parts[4] || '',
              location: parts[5] || '',
              description: parts[6] || '',
              schoolLink: parts[7] || ''
            })
          }
        })
        break

      case 'testimonials':
        // 格式：评价内容|作者|职位|公司（可选）|作者链接（可选）
        lines.forEach((line) => {
          const parts = line.split('|').map(p => p.trim())
          if (parts.length >= 3) {
            items.push({
              content: parts[0] || '',
              authorName: parts[1] || '',
              position: parts[2] || '',
              company: parts[3] || '',
              authorLink: parts[4] || ''
            })
          }
        })
        break

      case 'contact':
        // 格式：标签|值|链接（可选）
        lines.forEach((line) => {
          const parts = line.split('|').map(p => p.trim())
          if (parts.length >= 2) {
            items.push({
              label: parts[0] || '',
              value: parts[1] || '',
              link: parts[2] || ''
            })
          }
        })
        break
    }

    return items
  }

  // 验证数据
  const validateItems = (items: any[], type: ContentType): string[] => {
    const errors: string[] = []
    
    items.forEach((item, index) => {
      switch (type) {
        case 'posts':
          if (!item.title || !item.content) {
            errors.push(`第 ${index + 1} 条：标题和内容为必填`)
          }
          if (item.type && !['portfolio', 'blog', 'thoughts'].includes(item.type)) {
            errors.push(`第 ${index + 1} 条：类型必须是 portfolio、blog 或 thoughts`)
          }
          break

        case 'work-experience':
          if (!item.company || !item.position || !item.startDate || !item.location) {
            errors.push(`第 ${index + 1} 条：公司、职位、开始日期和地点为必填`)
          }
          if (!Array.isArray(item.responsibilities) || item.responsibilities.length === 0) {
            errors.push(`第 ${index + 1} 条：至少需要一个工作职责`)
          }
          break

        case 'skills':
          if (!item.category) {
            errors.push(`第 ${index + 1} 条：技能分类为必填`)
          }
          if (!Array.isArray(item.skills) || item.skills.length === 0) {
            errors.push(`第 ${index + 1} 条：至少需要一个技能`)
          }
          break

        case 'education':
          if (!item.degree || !item.school || !item.major || !item.startDate || !item.endDate || !item.location) {
            errors.push(`第 ${index + 1} 条：学位、学校、专业、开始日期、结束日期和地点为必填`)
          }
          break

        case 'testimonials':
          if (!item.content || !item.authorName || !item.position) {
            errors.push(`第 ${index + 1} 条：评价内容、作者和职位为必填`)
          }
          break

        case 'contact':
          if (!item.label || !item.value) {
            errors.push(`第 ${index + 1} 条：标签和值为必填`)
          }
          break
      }
    })

    return errors
  }

  // 预览数据
  const handlePreview = () => {
    try {
      let items: any[] = []
      const newErrors: string[] = []

      if (importMode === 'paste') {
        if (!pasteText.trim()) {
          newErrors.push('请输入要导入的数据')
          setErrors(newErrors)
          return
        }
        items = parsePasteText(pasteText, contentType)
      } else if (importMode === 'json') {
        if (!jsonText.trim()) {
          newErrors.push('请输入 JSON 数据')
          setErrors(newErrors)
          return
        }
        try {
          const parsed = JSON.parse(jsonText)
          items = Array.isArray(parsed) ? parsed : [parsed]
          // 确保每个项都有正确的结构
          items = items.map((item: any) => {
            // 根据类型确保数组字段正确
            if (contentType === 'work-experience' && !Array.isArray(item.responsibilities)) {
              item.responsibilities = item.responsibilities ? [item.responsibilities] : []
            }
            if (contentType === 'skills' && !Array.isArray(item.skills)) {
              item.skills = item.skills ? [item.skills] : []
            }
            return item
          })
        } catch (e: any) {
          newErrors.push('JSON 格式错误：' + (e.message || '请检查语法'))
          setErrors(newErrors)
          setPreview([])
          return
        }
      } else {
        items = formItems.filter(item => {
          // 基本验证，至少有一个必填字段
          if (contentType === 'posts') return item.title || item.content
          if (contentType === 'work-experience') return item.company || item.position
          if (contentType === 'skills') return item.category
          if (contentType === 'education') return item.school || item.degree
          if (contentType === 'testimonials') return item.content
          if (contentType === 'contact') return item.label || item.value
          return false
        })
      }

      if (items.length === 0) {
        newErrors.push('没有找到有效数据')
      } else {
        const validationErrors = validateItems(items, contentType)
        setErrors(validationErrors)
      }

      setPreview(items)
    } catch (error: any) {
      setErrors([error.message || '解析数据时出错'])
    }
  }

  // 执行批量导入
  const handleImport = async () => {
    if (preview.length === 0) {
      alert('请先预览数据')
      return
    }

    if (errors.length > 0) {
      if (!confirm(`有 ${errors.length} 个错误，是否仍要继续导入？`)) {
        return
      }
    }

    setImporting(true)
    setImportProgress(0)

    try {
      const total = preview.length
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < total; i++) {
        const item = preview[i]
        
        try {
          switch (contentType) {
            case 'posts':
              const posts = JSON.parse(localStorage.getItem('posts') || '[]')
              posts.push({
                id: Date.now() + i,
                ...item,
                date: new Date().toISOString()
              })
              localStorage.setItem('posts', JSON.stringify(posts))
              break

            case 'work-experience':
              const experiences = JSON.parse(localStorage.getItem('workExperiences') || '[]')
              experiences.push({
                id: Date.now() + i,
                ...item,
                endDate: item.endDate || 'present',
                responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
                createdAt: new Date().toISOString()
              })
              localStorage.setItem('workExperiences', JSON.stringify(experiences))
              break

            case 'skills':
              const skills = JSON.parse(localStorage.getItem('skills') || '[]')
              skills.push({
                id: Date.now() + i,
                ...item,
                skills: Array.isArray(item.skills) ? item.skills : [],
                createdAt: new Date().toISOString()
              })
              localStorage.setItem('skills', JSON.stringify(skills))
              break

            case 'education':
              const educations = JSON.parse(localStorage.getItem('educations') || '[]')
              educations.push({
                id: Date.now() + i,
                ...item,
                createdAt: new Date().toISOString()
              })
              localStorage.setItem('educations', JSON.stringify(educations))
              break

            case 'testimonials':
              const testimonials = JSON.parse(localStorage.getItem('testimonials') || '[]')
              testimonials.push({
                id: Date.now() + i,
                ...item,
                createdAt: new Date().toISOString()
              })
              localStorage.setItem('testimonials', JSON.stringify(testimonials))
              break

            case 'contact':
              const contacts = JSON.parse(localStorage.getItem('contactLinks') || '[]')
              contacts.push({
                id: Date.now() + i,
                ...item,
                createdAt: new Date().toISOString()
              })
              localStorage.setItem('contactLinks', JSON.stringify(contacts))
              break
          }
          successCount++
        } catch (error) {
          failCount++
        }

        setImportProgress(Math.round(((i + 1) / total) * 100))
      }

      alert(`导入完成！成功：${successCount}，失败：${failCount}`)
      
      // 重置
      setPasteText('')
      setJsonText('')
      setFormItems([{}])
      setPreview([])
      setErrors([])
      
      // 跳转到对应标签页
      const tabMap: Record<ContentType, string> = {
        'posts': 'all',
        'work-experience': 'work',
        'skills': 'skills',
        'education': 'education',
        'testimonials': 'testimonials',
        'contact': 'contact'
      }
      router.push(`/admin?tab=${tabMap[contentType]}`)
    } catch (error: any) {
      alert('导入失败：' + error.message)
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  // 添加表单行
  const addFormItem = () => {
    setFormItems([...formItems, {}])
  }

  // 删除表单行
  const removeFormItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index))
  }

  // 更新表单项
  const updateFormItem = (index: number, field: string, value: any) => {
    const newItems = [...formItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormItems(newItems)
  }

  // 获取格式说明
  const getFormatHelp = (type: ContentType): string => {
    switch (type) {
      case 'posts':
        return '格式：类型|标题|内容|图片链接（可选）\n示例：portfolio|我的作品|这是作品描述|https://example.com/image.jpg'
      case 'work-experience':
        return '格式：公司|职位|开始日期(YYYY-MM-DD)|结束日期(YYYY-MM-DD或present)|地点|职责1;职责2|客户（可选）|公司链接（可选）|职位链接（可选）\n示例：创意公司|设计师|2023-01-01|present|深圳|设计品牌标识;制作宣传物料|平安银行|https://company.com|https://linkedin.com'
      case 'skills':
        return '格式：分类|技能1,技能2,技能3\n示例：设计软件|Photoshop,Illustrator,InDesign'
      case 'education':
        return '格式：学位|学校|专业|开始日期(YYYY-MM-DD)|结束日期(YYYY-MM-DD)|地点|描述（可选）|学校链接（可选）\n示例：学士|某某大学|平面设计|2018-09-01|2022-06-01|北京|主修平面设计|https://university.edu'
      case 'testimonials':
        return '格式：评价内容|作者|职位|公司（可选）|作者链接（可选）\n示例：非常专业的设计师|张经理|产品经理|某科技公司|https://linkedin.com'
      case 'contact':
        return '格式：标签|值|链接（可选）\n示例：邮箱|john@example.com|mailto:john@example.com'
      default:
        return ''
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 relative allow-select">
      <div className="max-w-6xl mx-auto">
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
              批量添加
            </h1>
          </div>
        </div>

        {/* Content Type Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#ABABAB] mb-4">
            选择内容类型
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {([
              { key: 'posts' as ContentType, label: '内容（作品/博客/牢骚）' },
              { key: 'work-experience' as ContentType, label: '工作经历' },
              { key: 'skills' as ContentType, label: '技能' },
              { key: 'education' as ContentType, label: '教育背景' },
              { key: 'testimonials' as ContentType, label: '客户评价' },
              { key: 'contact' as ContentType, label: '联系方式' }
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setContentType(key)
                  setPreview([])
                  setErrors([])
                  setPasteText('')
                  setJsonText('')
                  setFormItems([{}])
                }}
                className={`py-3 px-4 text-xs md:text-sm font-semibold transition-colors border-2 ${
                  contentType === key
                    ? 'border-white text-white bg-white/5'
                    : 'border-[#383838] text-[#ABABAB] hover:border-white hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Import Mode Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#ABABAB] mb-4">
            导入方式
          </label>
          <div className="flex gap-3">
            {(['paste', 'json', 'form'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setImportMode(mode)
                  setPreview([])
                  setErrors([])
                }}
                className={`py-2 px-4 text-sm font-semibold transition-colors border-2 ${
                  importMode === mode
                    ? 'border-white text-white bg-white/5'
                    : 'border-[#383838] text-[#ABABAB] hover:border-white hover:text-white'
                }`}
              >
                {mode === 'paste' ? '文本粘贴' : mode === 'json' ? 'JSON导入' : '表单批量'}
              </button>
            ))}
          </div>
        </div>

        {/* Format Help */}
        {importMode === 'paste' && (
          <div className="mb-6 p-4 bg-[#1a1a1a] border border-[#383838] rounded">
            <p className="text-xs text-[#ABABAB] whitespace-pre-wrap">{getFormatHelp(contentType)}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="mb-6">
          {importMode === 'paste' && (
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="粘贴数据，每行一条..."
              rows={15}
              className="w-full px-4 py-3 bg-[#111] border border-[#383838] text-white placeholder:text-[#ABABAB] focus:outline-none focus:border-white transition-colors resize-none font-mono text-sm"
            />
          )}

          {importMode === 'json' && (
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="粘贴JSON数据..."
              rows={15}
              className="w-full px-4 py-3 bg-[#111] border border-[#383838] text-white placeholder:text-[#ABABAB] focus:outline-none focus:border-white transition-colors resize-none font-mono text-sm"
            />
          )}

          {importMode === 'form' && (
            <div className="space-y-4">
              {formItems.map((item, index) => (
                <div key={index} className="p-4 border border-[#383838] rounded">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#ABABAB]">项目 {index + 1}</span>
                    {formItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFormItem(index)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contentType === 'posts' && (
                      <>
                        <select
                          value={item.type || 'portfolio'}
                          onChange={(e) => updateFormItem(index, 'type', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        >
                          <option value="portfolio">作品集</option>
                          <option value="blog">博客</option>
                          <option value="thoughts">牢骚</option>
                        </select>
                        <input
                          type="text"
                          placeholder="标题"
                          value={item.title || ''}
                          onChange={(e) => updateFormItem(index, 'title', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="url"
                          placeholder="图片链接（可选）"
                          value={item.image || ''}
                          onChange={(e) => updateFormItem(index, 'image', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <textarea
                          placeholder="内容"
                          value={item.content || ''}
                          onChange={(e) => updateFormItem(index, 'content', e.target.value)}
                          rows={3}
                          className="md:col-span-2 px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                      </>
                    )}

                    {contentType === 'work-experience' && (
                      <>
                        <input
                          type="text"
                          placeholder="公司名称 *"
                          value={item.company || ''}
                          onChange={(e) => updateFormItem(index, 'company', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="职位 *"
                          value={item.position || ''}
                          onChange={(e) => updateFormItem(index, 'position', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="date"
                          placeholder="开始日期 *"
                          value={item.startDate || ''}
                          onChange={(e) => updateFormItem(index, 'startDate', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="date"
                          placeholder="结束日期"
                          value={item.endDate || ''}
                          onChange={(e) => updateFormItem(index, 'endDate', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="地点 *"
                          value={item.location || ''}
                          onChange={(e) => updateFormItem(index, 'location', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="客户（可选）"
                          value={item.clients || ''}
                          onChange={(e) => updateFormItem(index, 'clients', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <textarea
                          placeholder="工作职责（用;分隔）*"
                          value={Array.isArray(item.responsibilities) ? item.responsibilities.join(';') : (item.responsibilities || '')}
                          onChange={(e) => updateFormItem(index, 'responsibilities', e.target.value.split(';').filter(r => r.trim()))}
                          rows={3}
                          className="md:col-span-2 px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="url"
                          placeholder="公司链接（可选）"
                          value={item.companyLink || ''}
                          onChange={(e) => updateFormItem(index, 'companyLink', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="url"
                          placeholder="职位链接（可选）"
                          value={item.positionLink || ''}
                          onChange={(e) => updateFormItem(index, 'positionLink', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                      </>
                    )}

                    {contentType === 'skills' && (
                      <>
                        <input
                          type="text"
                          placeholder="技能分类 *"
                          value={item.category || ''}
                          onChange={(e) => updateFormItem(index, 'category', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <textarea
                          placeholder="技能列表（用,分隔）*"
                          value={Array.isArray(item.skills) ? item.skills.join(',') : (item.skills || '')}
                          onChange={(e) => updateFormItem(index, 'skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                          rows={4}
                          className="md:col-span-1 px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                      </>
                    )}

                    {contentType === 'education' && (
                      <>
                        <input
                          type="text"
                          placeholder="学位 *"
                          value={item.degree || ''}
                          onChange={(e) => updateFormItem(index, 'degree', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="学校 *"
                          value={item.school || ''}
                          onChange={(e) => updateFormItem(index, 'school', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="专业 *"
                          value={item.major || ''}
                          onChange={(e) => updateFormItem(index, 'major', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="date"
                          placeholder="开始日期 *"
                          value={item.startDate || ''}
                          onChange={(e) => updateFormItem(index, 'startDate', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="date"
                          placeholder="结束日期 *"
                          value={item.endDate || ''}
                          onChange={(e) => updateFormItem(index, 'endDate', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="地点 *"
                          value={item.location || ''}
                          onChange={(e) => updateFormItem(index, 'location', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <textarea
                          placeholder="描述（可选）"
                          value={item.description || ''}
                          onChange={(e) => updateFormItem(index, 'description', e.target.value)}
                          rows={3}
                          className="md:col-span-1 px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="url"
                          placeholder="学校链接（可选）"
                          value={item.schoolLink || ''}
                          onChange={(e) => updateFormItem(index, 'schoolLink', e.target.value)}
                          className="md:col-span-1 px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                      </>
                    )}

                    {contentType === 'testimonials' && (
                      <>
                        <textarea
                          placeholder="评价内容 *"
                          value={item.content || ''}
                          onChange={(e) => updateFormItem(index, 'content', e.target.value)}
                          rows={4}
                          className="md:col-span-2 px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="作者 *"
                          value={item.authorName || ''}
                          onChange={(e) => updateFormItem(index, 'authorName', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="职位 *"
                          value={item.position || ''}
                          onChange={(e) => updateFormItem(index, 'position', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="公司（可选）"
                          value={item.company || ''}
                          onChange={(e) => updateFormItem(index, 'company', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="url"
                          placeholder="作者链接（可选）"
                          value={item.authorLink || ''}
                          onChange={(e) => updateFormItem(index, 'authorLink', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                      </>
                    )}

                    {contentType === 'contact' && (
                      <>
                        <input
                          type="text"
                          placeholder="标签 *"
                          value={item.label || ''}
                          onChange={(e) => updateFormItem(index, 'label', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="值 *"
                          value={item.value || ''}
                          onChange={(e) => updateFormItem(index, 'value', e.target.value)}
                          className="px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                        <input
                          type="url"
                          placeholder="链接（可选）"
                          value={item.link || ''}
                          onChange={(e) => updateFormItem(index, 'link', e.target.value)}
                          className="md:col-span-2 px-3 py-2 bg-[#1a1a1a] border border-[#383838] text-white focus:outline-none focus:border-white"
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFormItem}
                className="w-full py-2 px-4 bg-[#383838] text-white rounded hover:bg-[#4a4a4a] transition-colors"
              >
                + 添加一项
              </button>
            </div>
          )}
        </div>

        {/* Preview and Errors */}
        {preview.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">预览 ({preview.length} 项)</h3>
              {errors.length > 0 && (
                <span className="text-sm text-red-400">{errors.length} 个错误</span>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto border border-[#383838] rounded p-4 bg-[#1a1a1a]">
              <pre className="text-xs text-[#ABABAB] whitespace-pre-wrap">
                {JSON.stringify(preview.slice(0, 5), null, 2)}
                {preview.length > 5 && `\n... 还有 ${preview.length - 5} 项`}
              </pre>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded">
            <h4 className="text-sm font-semibold text-red-400 mb-2">错误：</h4>
            <ul className="text-xs text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-[#383838]">
          <button
            type="button"
            onClick={handlePreview}
            className="flex-1 py-3 px-6 border-2 border-[#383838] text-[#ABABAB] font-semibold hover:border-white hover:text-white transition-colors"
            disabled={importing}
          >
            预览数据
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="flex-1 py-3 px-6 bg-white text-black font-semibold hover:bg-[#ABABAB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={importing || preview.length === 0}
          >
            {importing ? `导入中 ${importProgress}%` : `批量导入 (${preview.length})`}
          </button>
        </div>

        {/* Progress Bar */}
        {importing && (
          <div className="mt-4">
            <div className="w-full bg-[#383838] rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

