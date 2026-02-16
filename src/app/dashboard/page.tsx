import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Bookmark as BookmarkIcon, User as UserIcon } from 'lucide-react'
import BookmarkList from '@/components/BookmarkList'
import AddBookmarkForm from '@/components/AddBookmarkForm'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
              <BookmarkIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartBookmark</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-sm text-zinc-400 sm:flex">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-800 p-1">
                {user.user_metadata.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="User" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-full w-full text-zinc-500" />
                )}
              </div>
              <span className="max-w-[150px] truncate">{user.email}</span>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="mt-2 text-zinc-400">Welcome back! Manage your bookmarks below.</p>
        </div>

        <AddBookmarkForm />
        
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-200">Your Bookmarks</h3>
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
            {bookmarks?.length || 0} Saved
          </span>
        </div>

        <BookmarkList initialBookmarks={bookmarks || []} />
      </main>

      <footer className="mt-20 border-t border-zinc-900 bg-zinc-950 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-zinc-600">
            &copy; 2024 SmartBookmark App. All rights reserved. Built with Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}
