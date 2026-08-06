import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [showLang, setShowLang] = useState(false)

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowLang(false)
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 h-14 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-gray-50 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-primary/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder={t('navbar.search')}
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
          >
            <span>🌐</span>
            <span className="uppercase">{i18n.language?.split('-')[0] || 'en'}</span>
          </button>
          
          {showLang && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)}></div>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-slide-up origin-top-right">
                <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">English (EN)</button>
                <button onClick={() => changeLanguage('hi')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">हिन्दी (HI)</button>
                <button onClick={() => changeLanguage('gu')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">ગુજરાતી (GU)</button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 font-body">{user.name}</span>
        </div>
        <button
          onClick={logout}
          className="ml-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
