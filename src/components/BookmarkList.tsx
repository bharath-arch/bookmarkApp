'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, ExternalLink, Bookmark as BookmarkIcon, Loader2 } from 'lucide-react'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

const supabase = createClient();

export default function BookmarkList({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  useEffect(() => {
    console.log('--- INITIALIZING REALTIME ---');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookmarks' 
        },
        (payload) => {
          console.log('REALTIME PAYLOAD:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as Bookmark;
            setBookmarks((prev) => {
              if (prev.find(b => b.id === newRecord.id)) return prev;
              return [newRecord, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        console.log('SUBSCRIPTION STATUS:', status);
      });

    // Fallback: Listen for local events if real-time is slow/blocked
    const handleLocalAdd = (e: any) => {
      const newBookmark = e.detail;
      setBookmarks((prev) => {
        if (prev.find(b => b.id === newBookmark.id)) return prev;
        return [newBookmark, ...prev];
      });
    };
    window.addEventListener('bookmark-added', handleLocalAdd);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('bookmark-added', handleLocalAdd);
    };
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark.')
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50">
          <BookmarkIcon className="h-8 w-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-300">No bookmarks yet</h3>
        <p className="mt-1 text-zinc-500">Start by adding your favorite links above.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl"
        >
          <div className="mb-4">
            <h4 className="line-clamp-1 font-semibold text-zinc-100">{bookmark.title}</h4>
            <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{bookmark.url}</p>
          </div>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800/50">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              <ExternalLink className="h-3 w-3" />
              Visit Link
            </a>
            <button
              onClick={() => handleDelete(bookmark.id)}
              className="rounded-lg p-2 text-zinc-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
              title="Delete Bookmark"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
