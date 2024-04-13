import GithubCorner from '@/components/github'
import CopyBlock, { ocean } from '@/components/codeblock'
import Head from 'next/head'
import Image from 'next/image'
import Logo from '@/app/opengraph-image.png'



export default function Home() {
  return (
    <main className="w-full overflow-y-auto p-8 dark:bg-slate-900">
      <Head>
        <meta name='description' content={'Embedding solution for Misskey. Homepage of Missbed.'} />
      </Head>
      <GithubCorner href='https://github.com/NarixHine/missbed' bannerColor='rgb(205, 92, 92)' target='_blank' style={{ opacity: 0.7 }} />

      <h1 className='text-5xl text-center'>
        <div className='my-2 relative h-20'>
          <Image priority={true} className='absolute animate-fade left-1/2 -translate-x-1/2' src={Logo} quality={100} width={80} height={80} alt='Missbed Logo'></Image>
        </div>
        <div className='bg-clip-text font-extrabold text-transparent bg-gradient-to-r from-indigo-300 to-purple-400'>Missbed</div>
      </h1>
      <p className='text-center text-slate-500 dark:text-slate-200 italic'>Embedding solution for <a className='text-lime-600'>Misskey</a></p>
      <br></br>

      <div className='w-2/3 bg-slate-200/60 dark:bg-slate-800/100 mx-auto rounded-lg opacity-90 p-5 overflow-x-hidden ' style={{ minWidth: 280 }}>
        <h1 className="text-2xl font-bold text-gray-800 mb-5 bg-blue-100 dark:text-neutral-200 dark:bg-slate-500 p-3 rounded-lg">ノート</h1>
        <CopyBlock
          // @ts-ignore
          text={'<iframe src="https://missbed.misskey.stream/note/{instance}/{note_id}" />'}
          language={'tsx'}
          showLineNumbers={true}
          theme={{ ...ocean }}
          codeBlock
        />
        <iframe src='/note/misskey.stream/9p4y4lg5lr' width={'100%'} height={350}></iframe>
        <br/>
        <h2 className="text-2xl font-bold text-gray-800 mb-5 bg-blue-50 dark:text-neutral-200 dark:bg-slate-500 p-3 rounded-lg">タイムライン</h2>
                <CopyBlock
          // @ts-ignore
          text={'<iframe src="https://missbed.misskey.stream/timeline/{instance}/{user_id}" />'}
          language={'tsx'}
          showLineNumbers={true}
          theme={{ ...ocean }}
          codeBlock
        />
        <div className='flex justify-center'>
        <iframe className="" src='/timeline/misskey.stream/9p0tg0nuzo' width={'50%'} height={700}></iframe>
        </div><br/>
        <h2 className="text-2xl font-bold text-gray-800 mb-5 bg-blue-100 dark:text-neutral-200 dark:bg-slate-500 p-3 rounded-lg">タイムボード(使用不推奨)</h2>
        <CopyBlock
          // @ts-ignore
          text={'<iframe src="https://missbed.misskey.stream/timeboard/{instance}/{user_id}" />'}
          language={'tsx'}
          showLineNumbers={true}
          theme={{ ...ocean }}
          codeBlock
        />
        <iframe src='/timeboard/misskey.stream/9p0tg0nuzo' width={'100%'} height={1000}></iframe>

      </div>
      <br></br>
    </main>
  )
}
