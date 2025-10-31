'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
 

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 默认密码是 "admin"
    if (password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true')
      router.push('/admin')
      setError('')
    } else {
      setError('密码错误，请重试')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative allow-select">
      {/* 背景动画肌理 */}
      <div className="background-texture">
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element"></div>
        <div className="drift-element" style={{animationDelay: '-5s', top: '70%', right: '10%'}}></div>
        <div className="drift-element" style={{animationDelay: '-10s', bottom: '20%', left: '60%'}}></div>
      </div>
      
      
      <div className="w-full max-w-md border border-[#383838] p-8 relative z-10">
        <h1 className="text-3xl font-semibold text-white mb-2">管理后台</h1>
        <p className="text-[#ABABAB] text-sm mb-8">输入密码以访问管理功能</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#ABABAB] mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 bg-[#111] border border-[#383838] text-white placeholder:text-[#ABABAB] focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-white text-black font-semibold hover:bg-[#ABABAB] transition-colors"
          >
            登录
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-[#383838]">
          <a 
            href="/" 
            className="text-[#ABABAB] hover:text-white transition-colors text-sm"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
