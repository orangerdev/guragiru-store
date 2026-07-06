'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { createPostAction, updatePostAction } from '../../actions'

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false })

interface PostData {
  id: string
  title: string
  slug: string
  body: string
  excerpt: string | null
  published: number
  locale: string
}

export function PostEditor({ post }: { post?: PostData }) {
  const [body, setBody] = useState(post?.body ?? '')
  const isEdit = !!post

  return (
    <form action={isEdit ? updatePostAction : createPostAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={post.id} />}

      <div>
        <label htmlFor="title" className="block text-sm text-gray-400 mb-1">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={post?.title ?? ''}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm text-gray-400 mb-1">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ''}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Content</label>
        <TiptapEditor content={body} onChange={setBody} />
        <input type="hidden" name="body" value={body} />
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="locale" className="block text-sm text-gray-400 mb-1">Locale</label>
          <select
            id="locale"
            name="locale"
            defaultValue={post?.locale ?? 'id'}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked={post?.published === 1}
            className="rounded border-gray-700 bg-gray-900"
          />
          <label htmlFor="published" className="text-sm text-gray-400">Publish</label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {isEdit ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  )
}
