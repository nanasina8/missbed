'use client'

import NoteDisplayer from '../note/displayer'
import { useState } from 'react'
import { fetchUserNotes } from '@/lib/misskey'
import { Note as NoteType } from 'misskey-js/built/dts/autogen/models'

import { OgObject } from 'open-graph-scraper/dist/lib/types'



export default function TimelineDisplayer({ notes, id, instance, boardly = false, ogs }: {
    notes: NoteType[],
    id: string,
    instance: string,
    ogs: OgObject[][],
    boardly?: boolean
}) {
    const [loaded, setLoaded] = useState({ loadedNotes: notes, loadedOgs: ogs })
    const { loadedNotes, loadedOgs } = loaded

    const [isLoading, setIsLoading] = useState(false)
    const [isFinished, setIsFinished] = useState(notes.length < 10 ? true : false)

    const loadNotes = async () => {
        setIsLoading(true)

        const loadingNotes = await fetchUserNotes(instance, id, loadedNotes[loadedNotes.length - 1].id)
        const loadingOgs = (await (await fetch('/api/og', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                texts: loadingNotes.map(note => note.text)
            })
        })).json()).ogs
        setLoaded(({ loadedNotes, loadedOgs }) => ({ loadedNotes: loadedNotes.concat(loadingNotes), loadedOgs: loadedOgs.concat(loadingOgs) }))

        if (loadingNotes.length < 10)
            setIsFinished(true)
        setIsLoading(false)
    }

    return (
        <div className={boardly ? 'grid items-center grid-cols-3 gap-5' : ''}>
            {
                loadedNotes.map((note, index) => (
                    <div key={note.id}>
                        <NoteDisplayer {...note} instance={instance} ogs={loadedOgs[index]}></NoteDisplayer>
                        {!boardly && <div className='w-3 h-3 bg-stone-50 dark:bg-slate-900 mx-auto'></div>}
                    </div>
                ))
            }
            <button disabled={isLoading || isFinished} onClick={loadNotes} className='w-32 h-32 mx-auto group relative block p-1 rounded bg-gradient-to-br from-teal-50 dark:from-teal-900 to-lime-50 dark:to-blue-900 group-hover:from-teal-50 dark:group-hover:from-teal-900 group-hover:to-lime-50 dark:group-hover:to-blue-900 focus:ring-4 focus:outline-none focus:ring-lime-50'>
                <div className='w-full h-full px-5 py-2.5 flex items-center justify-center transition-all ease-in duration-75 bg-stone-50 dark:bg-slate-900 rounded group-hover:bg-opacity-0'>
                    <svg className={`w-6 h-6 ${isLoading ? 'text-stone-300 dark:text-slate-500' : 'text-stone-600 dark:text-slate-300'} ${isFinished ? 'hidden' : ''}`} aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 14 8'>
                        <path stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1' />
                    </svg>
                </div>
            </button>
        </div>
    )
}
