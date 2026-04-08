"use client"

import { useState } from "react"
import { Bell, Search, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import Link from "next/link"

interface HeaderProps {
  title?: string
  subtitle?: string
  user?: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
  } | null
  showSearch?: boolean
  showQuickAdd?: boolean
}

const quickAddOptions = [
  { label: "Add Lead", href: "/admin/leads" },
  { label: "Add Client", href: "/admin/clients" },
  { label: "New Project", href: "/admin/projects" },
  { label: "Create Invoice", href: "/admin/invoices" },
]

export function Header({ title, subtitle, user, showSearch = true, showQuickAdd = true }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="premium-header">
      <div className="premium-header-left">
        {title && (
          <div>
            <h1 className="premium-title">{title}</h1>
            {subtitle && <p className="premium-subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="premium-header-right">
        {/* Search */}
        {showSearch && (
          <div className="premium-search-wrapper">
            {searchOpen ? (
              <div className="premium-search-expanded">
                <Search className="premium-search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search leads, clients, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="premium-search-input"
                  autoFocus
                />
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="premium-search-close"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSearchOpen(true)}
                className="premium-search-btn"
              >
                <Search size={18} />
                <span className="premium-search-text">Search</span>
                <span className="premium-search-shortcut">⌘K</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Add */}
        {showQuickAdd && (
          <div className="premium-quick-add-wrapper">
            <button 
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="premium-quick-add-btn"
            >
              <Plus size={18} />
              <span>Add New</span>
            </button>
            
            {quickAddOpen && (
              <>
                <div 
                  className="premium-dropdown-overlay"
                  onClick={() => setQuickAddOpen(false)}
                />
                <div className="premium-quick-add-dropdown">
                  <div className="premium-dropdown-header">Quick Actions</div>
                  {quickAddOptions.map((option) => (
                    <Link
                      key={option.href}
                      href={option.href}
                      className="premium-dropdown-item"
                      onClick={() => setQuickAddOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="premium-notifications-wrapper">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="premium-notifications-btn"
          >
            <Bell size={18} />
            <span className="premium-notifications-badge">3</span>
          </button>
          
          {notificationsOpen && (
            <>
              <div 
                className="premium-dropdown-overlay"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="premium-notifications-dropdown">
                <div className="premium-dropdown-header">
                  <span>Notifications</span>
                  <button className="premium-dropdown-mark-read">Mark all read</button>
                </div>
                <div className="premium-notifications-list">
                  <div className="premium-notification-item unread">
                    <div className="premium-notification-dot" />
                    <div className="premium-notification-content">
                      <p className="premium-notification-title">New lead added</p>
                      <p className="premium-notification-desc">Acme Corp was added to leads</p>
                      <p className="premium-notification-time">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="premium-notification-item unread">
                    <div className="premium-notification-dot" />
                    <div className="premium-notification-content">
                      <p className="premium-notification-title">Invoice paid</p>
                      <p className="premium-notification-desc">INV-0004 payment received</p>
                      <p className="premium-notification-time">1 hour ago</p>
                    </div>
                  </div>
                  <div className="premium-notification-item">
                    <div className="premium-notification-content">
                      <p className="premium-notification-title">Project milestone</p>
                      <p className="premium-notification-desc">Website Redesign reached 50%</p>
                      <p className="premium-notification-time">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        {user && (
          <div className="premium-user-avatar">
            {getInitials(user.full_name || user.email)}
          </div>
        )}
      </div>
    </header>
  )
}