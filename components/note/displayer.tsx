'use client'

import { DriveFile,Note} from 'misskey-js/built/dts/autogen/models'
import * as Misskey from 'misskey-js';

import { Yomogi, Sawarabi_Mincho } from 'next/font/google'
import { useEffect, useState } from 'react'
import ProgressiveImage from 'react-progressive-image-loading'
import Image from 'next/image'
import { ImageObject, OgObject } from 'open-graph-scraper/dist/lib/types'
import MfmConverter from '@/lib/mfm'
import EmojiImage from '../../lib/EmojiImage';

//const yomogi = Yomogi({ weight: '400', subsets: ['latin'] })
//const mincho = Sawarabi_Mincho({ weight: '400', subsets: ['latin'] })

export interface NoteProps extends Note {
    instance: string
    ogs?: OgObject[]
    isRenote?: boolean
}

export default function NoteDisplayer({ id, url, user, createdAt, text, files, cw, poll, renote, instance, ogs = [], isRenote, reactions}: NoteProps) {
    //const reactions = {"👍": 5,"❤️": 10,"😂": 2,"😮": 3,"😢": 1,"👎": 1};
    const emojis: { name: string; url: string; }[] = [];//後で治す
    const [show, setShow] = useState(!cw)
    const converter = new MfmConverter(instance, emojis)
    return (
        <article className={'bg-stone-50 dark:bg-slate-900 w-full p-7 rounded'} style={{ boxShadow: isRenote ? 'rgba(50, 50, 93, 0.3) 0px 10px 20px -4px, rgba(0, 0, 0, 0.4) 0px 6px 10px -5px, rgba(10, 37, 64, 0.5) 0px -2px 6px 0px inset' : '' }}>
            <header className='flex gap-3'>
                <Image width={56} height={56} src={user.avatarUrl || 'avatar.jpg'} alt='Avatar' className='rounded-full'></Image>
                <div className="flex flex-col justify-center leading-tight">
                    <a className='text-stone-900 dark:text-stone-50 font-bold hover:underline block' href={`https://${instance}/@${user.username}`} target='_blank' rel='noreferrer'>{converter.convert(user.name || user.id)}</a>
                    <p className='text-stone-900 dark:text-stone-50'>{`@${user.username}`}</p>
                </div>
            </header>
            <br></br>

            {
                cw && (<div>
                    {converter.convert(cw)} <button className='text-slate-400 ml-1 border-solid border-2 px-1' onClick={() => setShow(show => !show)}>{show ? 'Hide' : 'Show'}</button>
                    <br></br><br></br>
                </div>)
            }
            {
                show && (<>
                    <Text text={text} converter={converter}></Text>
                    <Renote renote={renote || undefined}  instance={instance}></Renote>
                    <Cards ogs={ogs}></Cards>
                    <Enquette poll={poll}></Enquette>
                    <Images imgs={(files || []).filter(({ type }) => type.startsWith('image'))}></Images>
                    <hr className='my-5 border-stone-300/50'></hr>
                    <Reactions reactions={reactions} instance={instance}/>
                </>)
            }

            <footer className=" text-stone-500 dark:text-slate-300 text-sm">
                <a className='underline' href={url ?? `https://${instance}/notes/${id}`} target='_blank' rel='noreferrer'>Noted</a>
                {' '} on <a className='underline' href={`https://${instance}/`} target='_blank' rel='noreferrer'>{instance}</a>
                {' '} at {createdAt.replace('T', ' ').split('.')[0]}
            </footer>
        </article>
    )
}

const Renote = ({ renote, instance }: { renote?: Note, instance: string }) => renote && (<>
    <NoteDisplayer {...renote} ogs={[]} instance={renote.user.host ?? instance} isRenote></NoteDisplayer>
    <br></br>
</>)

const Cards = ({ ogs }: { ogs: OgObject[] }) => {
    return ogs.length > 0 && (<>
        {
            ogs.map(({ ogImage, ogTitle, requestUrl, ogDescription }, index) => (
                <a key={index} href={requestUrl ?? '#'} target='_blank' rel='noreferrer'>
                    <div className='flex h-20 my-2 bg-gradient-to-r from-rose-100/20 to-teal-100/20'>
                        <div className='relative w-20 h-20 shrink-0 rounded-l overflow-clip'>
                            {/* ogImageの存在チェック */}
                            <Image quality={100} src={ogImage?.[0]?.url ?? 'nh.png'} className='object-cover' width={80} height={80} alt={ogTitle ?? 'No Title'} />
                        </div>
                        <div className="dark:text-stone-100 w-full p-4 border-slate-300 border border-l-0 rounded-r overflow-y-clip whitespace-nowrap text-ellipsis overflow-x-hidden">
                            {/* ogTitleの存在チェック */}
                            {ogTitle ?? 'No Title'}
                            <br />
                            {/* ogDescriptionの存在チェック */}
                            <span className='text-slate-500 dark:text-stone-300 text-sm'>
                                {ogDescription ?? 'No Description'}
                            </span>
                        </div>
                    </div>
                </a>
            ))
        }
        <br />
    </>)
}


const Text = ({ text, converter }: { text: string | null, converter: MfmConverter }) => {
    return text && (<>
        <div className="dark:text-slate-200 break-words whitespace-pre-line">{converter.convert(text)}</div>
        <br></br>
    </>)
}

const Images = ({ imgs }: { imgs: DriveFile[] }) => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    const [opacities, setOpacities] = useState<number[]>(imgs.map(({ isSensitive }) => (isSensitive ? 0.2 : 1)))

    return imgs.length > 0 && (<>
        <div className={`grid ${imgs.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 p-2 bg-gradient-to-r from-rose-100/20 to-teal-100/20`} style={{ boxShadow: 'rgba(3, 102, 214, 0.2) 0px 0px 0px 3px' }}>
            {
                imgs.map(({ id, thumbnailUrl, url, name }, index) => (
                    mounted && <ProgressiveImage key={id} preview={thumbnailUrl || 'avatar.jpg'} src={url} render={(src, style) => (
                        <div className=' aspect-video rounded relative'>
                            <Image src={url} alt={name} layout="responsive" width={100} height={100} objectFit="contain" style={{ opacity: opacities[index] }} />
                            <div style={{ opacity: 1 - opacities[index] }} className={`${1 - opacities[index] > 0 ? '' : 'hidden'} w-full p-1 text-center absolute top-1/2 -translate-y-1/2`}>
                                <a className='text-lg'>NSFW</a>
                                <br></br>
                                <button className='text-slate-400 border-solid border-slate-400 border px-1 text-xs' onClick={() => {
                                    const fadeInInterval = setInterval(() => {
                                        setOpacities(opacities => Array.from(opacities, (opacity, i) => {
                                            const newOpacity = i === index ? opacity + 0.01 : opacity
                                            if (newOpacity > 1) {
                                                clearInterval(fadeInInterval)
                                            }
                                            return newOpacity
                                        }))
                                    }, 5)
                                }}>Click to View</button>
                            </div>
                        </div>
                    )}></ProgressiveImage>
                ))
            }
        </div>
        <br></br>
    </>)
}

const Enquette = ({ poll }: {
    poll?: {
        expiresAt?: string | null|undefined
        multiple: boolean
        choices: {
            isVoted: boolean
            text: string
            votes: number
        }[]
    } |null
}) => {
    const allVotes = poll ? poll.choices.reduce((a, b) => a + b.votes, 0) : 0
    return poll && (<>
        {
            poll.choices.map(({ text, votes }) => (
                <div
                    key={text}
                    className=" w-full border-lime-200 border-2 my-1 whitespace-nowrap rounded"
                >
                    <div style={{ width: `${votes / allVotes * 100}%` }} className='p-2 bg-lime-100 text-teal-800 text-sm rounded'>
                        {text} <a className='text-xs border-l px-1 border-teal-600 text-teal-600'>{votes} {votes === 1 ? 'Vote' : 'Votes'}</a>
                    </div>
                </div>
            ))
        }
        <br></br>
    </>)
}
interface ReactionsProps {
    reactions: {
    [key: string]: number;
    };
    instance: string; // 現在のインスタンス名を追加
}

const Reactions: React.FC<ReactionsProps> = ({ reactions, instance }) => {
    return (
        <div className="flex items-center mt-2 flex-wrap">
        {Object.entries(reactions).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
          // キーが :: で囲まれているかどうかをチェック
            if (key.startsWith(':') && key.endsWith(':')) {
            const emojiName = key.slice(1, -1); // 最初と最後の : を取り除く
            const atIndex = emojiName.indexOf('@');
            if (atIndex !== -1) {
                const [emoji, domain] = emojiName.split('@');
                if (domain === '.') {
                // 現在のインスタンスの絵文字
                return (
                    <div key={key} className="flex items-center mr-4 border border-gray-300 rounded-lg" title={`${emoji}@${instance}`}>
                    <div className='bg-white overflow-hidden rounded-l-lg'>    
                    <div className='p-2'>
                    <EmojiImage emojiName={emoji} instance={instance} />
                    </div></div>
                    <span className="ml-1">{count}</span>
                    </div>
                );
                } else {
                // 他のインスタンスの絵文字
                return (
                    <div key={key} className="flex items-center mr-4 border border-gray-300 rounded-lg " title={`${emoji}@${domain}`}>
                    <div className='bg-white overflow-hidden rounded-l-lg'>    
                    <div className='p-2'>
                    <EmojiImage emojiName={emoji} instance={domain} />
                    </div></div>
                    <span className="ml-1 ">{count}</span>
                    </div>
                );
                }
            }
            }
          // キーが :: で囲まれていないとき、または@が含まれていないとき
            return (
            <div key={key} className="flex items-center mr-4 rounded-lg border border-gray-300">
                <div className='bg-white overflow-hidden rounded-l-lg'>    
                <div className='p-2'>
                <span style={{ fontSize: '1em' }}>{key}</span>
                </div></div>
                <span className="ml-1 text">{count}</span>
            </div>
            );
        })}
        </div>
    );
    };
    