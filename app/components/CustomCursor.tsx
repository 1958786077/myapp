'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 检测是否为手机端
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    
    if (isMobile) {
      return // 手机端不执行自定义光标逻辑
    }
    
    let animationFrame: number
    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let isInitialized = false

    // 初始化光标位置
    const initializeCursor = () => {
      if (cursorRef.current && !isInitialized) {
        // 使用屏幕中心作为初始位置
        mouseX = window.innerWidth / 2
        mouseY = window.innerHeight / 2
        
        // 立即设置光标位置
        cursorX = mouseX
        cursorY = mouseY
        cursorRef.current.style.left = cursorX + 'px'
        cursorRef.current.style.top = cursorY + 'px'
        cursorRef.current.style.opacity = '1'
        isInitialized = true
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      // 如果是第一次移动，立即设置位置到真实鼠标位置
      if (!isInitialized) {
        if (cursorRef.current) {
          cursorX = mouseX
          cursorY = mouseY
          cursorRef.current.style.left = cursorX + 'px'
          cursorRef.current.style.top = cursorY + 'px'
          cursorRef.current.style.opacity = '1'
          isInitialized = true
        }
      }
    }

    const animateCursor = () => {
      if (isInitialized) {
        // 使用更快的缓动函数，减少延迟感
        const ease = 0.25
        cursorX += (mouseX - cursorX) * ease
        cursorY += (mouseY - cursorY) * ease
        
        if (cursorRef.current) {
          cursorRef.current.style.left = cursorX + 'px'
          cursorRef.current.style.top = cursorY + 'px'
        }
      }
      
      animationFrame = requestAnimationFrame(animateCursor)
    }

    // 立即初始化光标
    initializeCursor()
    animateCursor()

    const handleMouseEnter = (e: Event) => {
      if (cursorRef.current) {
        const target = e.target as HTMLElement
        // 检查是否是箭头文字链接
        if (target.classList.contains('arrow-text') && target.tagName === 'A') {
          cursorRef.current.classList.add('arrow-hover')
        } else {
          cursorRef.current.classList.add('hovering')
        }
      }
    }

    const handleMouseLeave = (e: Event) => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove('hovering', 'arrow-hover')
      }
    }

    // 使用事件委托来处理动态元素
    const handleMouseOver = (e: Event) => {
      const target = e.target as HTMLElement
      // 检查是否是可交互元素
      if (target.matches('a[href], button, [role="button"], input, textarea, select')) {
        handleMouseEnter(e)
      }
    }

    const handleMouseOut = (e: Event) => {
      const target = e.target as HTMLElement
      // 检查是否是可交互元素
      if (target.matches('a[href], button, [role="button"], input, textarea, select')) {
        handleMouseLeave(e)
      }
    }

    // 页面可见性变化处理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialized) {
        // 页面重新可见时重新初始化光标
        initializeCursor()
      }
    }

    // 添加全局事件监听器
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseout', handleMouseOut, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])


  // 检测是否为手机端
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
    window.innerWidth <= 768
  )

  // 手机端不渲染自定义光标
  if (isMobile) {
    return null
  }

  return <div ref={cursorRef} className="custom-cursor"></div>
}
