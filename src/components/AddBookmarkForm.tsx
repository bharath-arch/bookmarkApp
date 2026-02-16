'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2 } from 'lucide-react'

const supabase = createClient()

export default function AddBookmarkForm() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !url) return

    setIsPending(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        setIsPending(false)
        return
    }

    console.log('Inserting bookmark:', { title, url, user_id: user.id })
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ title, url, user_id: user.id }])
      .select()

    if (error) {
      console.error('INSERT ERROR:', error)
      alert('Failed to add bookmark: ' + error.message)
    } else if (data && data[0]) {
      console.log('INSERT SUCCESS:', data)
      // Trigger local update for same-tab responsiveness
      window.dispatchEvent(new CustomEvent('bookmark-added', { detail: data[0] }));
      setTitle('')
      setUrl('')
    }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-1">
          <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. My Favorite Tool"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="url" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            URL
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
