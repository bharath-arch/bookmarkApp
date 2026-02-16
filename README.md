# 🔖 Smart Bookmark App

A production-ready personal bookmark manager built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. This app allows users to save, organize, and manage their links with real-time synchronization across devices.

## 🚀 Features

- **Google OAuth**: Fast and secure authentication.
- **Real-time Updates**: Instant UI synchronization when bookmarks are added or deleted.
- **Private Storage**: Secure Row Level Security (RLS) ensuring users only see their own bookmarks.
- **Modern UI**: Sleek dark-mode interface built with Tailwind CSS and Lucide icons.
- **Optimistic UI**: Instant responsiveness for a smooth user experience.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🧠 Technical Challenges & Solutions

As a first-time Supabase user, I encountered several interesting challenges regarding security and real-time data:

### 1. The RLS vs. Real-time Broadcast Gap
**Problem**: After enabling Row Level Security (RLS), real-time `INSERT` events stopped working on the frontend, even though `DELETE` events worked fine.
**Solution**: We discovered that for RLS to work with Real-time broadcasts, the table must have its **Replica Identity** set to **FULL**. 
```sql
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
```
This ensures the database sends the entire row data to the Real-time engine, allowing it to verify that the `auth.uid()` matches the `user_id` before broadcasting.

### 2. Post-Deployment Redirect Loop
**Problem**: After hosting on Vercel, logging in redirected the browser back to `localhost:3000`.
**Solution**: This was resolved by updating the **Site URL** and **Redirect URIs** in the Supabase Dashboard (Authentication > URL Configuration) to match the Vercel production domain.

### 3. Subscription Race Conditions
**Problem**: Real-time subscriptions sometimes failed to initialize before the initial data fetch.
**Solution**: Implemented a robust `useEffect` hook in the `BookmarkList` component that handles clean-up and uses unique channel names to avoid subscription conflicts.

## ⚙️ Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase SQL Schema
Run this in your Supabase SQL Editor:
```sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);

alter table bookmarks enable row level security;
alter table bookmarks replica identity full;

create policy "Users can operate on own bookmarks" 
on bookmarks for all using (auth.uid() = user_id);

alter publication supabase_realtime add table bookmarks;
```

---
