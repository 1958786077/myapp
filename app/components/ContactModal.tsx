'use client'

import { useEffect, useRef } from 'react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  qqNumber?: string
  telegramUsername?: string
}

export default function ContactModal({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  qqNumber, 
  telegramUsername 
}: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div 
        ref={modalRef}
        className="relative bg-[#2a2a2a] shadow-2xl max-w-md w-full mx-4"
        style={{
          border: '1px dashed rgba(255, 255, 255, 0.3)',
          borderRadius: '8px'
        }}
      >
        {/* 关闭按钮区域 */}
        <div className="absolute top-0 left-0 w-12 h-12" 
             style={{ 
               borderRight: '1px dashed rgba(255, 255, 255, 0.3)',
               borderBottom: '1px dashed rgba(255, 255, 255, 0.3)'
             }}>
          <button
            onClick={onClose}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M12 4L4 12M4 4L12 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 pt-16">
          <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
          
          <div className="space-y-4">
            <p className="text-[#ABABAB] text-sm leading-relaxed">{content}</p>
            
            {/* 联系方式 */}
            <div className="space-y-3">
              {qqNumber && (
                <div className="flex items-center space-x-3 p-3 bg-[#1a1a1a] rounded border border-[#404040]">
                  <div className="w-8 h-8 bg-[#12B7F5] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Q</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">QQ</p>
                    <p className="text-[#ABABAB] text-xs">{qqNumber}</p>
                  </div>
                </div>
              )}
              
              {telegramUsername && (
                <div className="flex items-center space-x-3 p-3 bg-[#1a1a1a] rounded border border-[#404040]">
                  <div className="w-8 h-8 bg-[#0088CC] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Telegram</p>
                    <p className="text-[#ABABAB] text-xs">@{telegramUsername}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
