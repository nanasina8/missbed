import { MfmNode, toString, parse } from 'mfm-js'
import { ReactNode } from 'react'
import { CopyBlock, github } from 'react-code-blocks'
import React, { useState, useEffect } from 'react';
import EmojiImage from './EmojiImage'; 

export default class MfmConverter {
    instance: string = 'misskey.io'
    emojis: { name: string, url: string }[] = []

    constructor(instance: string, emojis: { name: string, url: string }[]) {
        this.instance = instance
        this.emojis = emojis
    }

    toReact(node: MfmNode, children: ReactNode) {
        switch (node.type) {
            case 'bold':
                return <span className='font-bold'>{children}</span>
            case 'quote':
                return <blockquote className='relative text-stone-600 border-l border-solid border-stone-600 pl-2 m-2 ml-4'>{children}</blockquote>
            case 'link':
                return <a href={node.props.url} target='_blank' rel='noreferrer' className='font-mono text-link'>{children}</a>
            case 'center':
                return <div className='text-center'>{children}</div>
            case 'small':
                return <small>{children}</small>
            case 'italic':
                return <span className='italic'>{children}</span>
            case 'strike':
                return <span className='line-through'>{children}</span>

            // no children
            case 'mention':
                return <a className='text-link' href={`https://${node.props.host ?? this.instance}/@${node.props.username}`} target='_blank' rel='noreferrer'>{node.props.acct}</a>
        
            case 'url': {
                const { url } = node.props;
                // 画像ファイルの拡張子リスト
                const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
                // URLが画像ファイルを指しているかどうかをチェック
                const isImage = imageExtensions.some(ext => url.endsWith(ext));
                
                    // URLが画像ファイルの場合
                if (isImage) {
                    return (
                            <img src={url} alt="preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                        );
                } else {
                    // 画像ファイルでない場合は、URLをテキストリンクとして表示
                    const [protocol, , host, ...paths] = url.split('/');
                    return (
                        <a href={url} target='_blank' rel='noreferrer' className='text-link font-mono'>
                            <span className='opacity-60 text-sm'>{`${protocol}//`}</span>
                            <span className='font-bold'>{host}</span>
                            <span className='opacity-80 text-sm'>/{paths.join('/')}</span>
                        </a>
                        );
                    }
                }                
            case 'hashtag':
                return <a className='text-link' href={`https://${this.instance}/tags/${node.props.hashtag}`} target='_blank' rel='noreferrer'>#{node.props.hashtag}</a>
            case 'text':
                return <>{node.props.text}</>
            case 'blockCode':
                return <CopyBlock
                    // @ts-ignore
                    text={node.props.code}
                    language={node.props.lang ?? 'text'}
                    showLineNumbers={true}
                    theme={{ ...github, mode: 'dark' }}
                    codeBlock
                />
            case 'inlineCode':
                return <code>{node.props.code}</code>
            case 'emojiCode':
                const emojiName = node.props.name;
                return <EmojiImage emojiName={emojiName} instance={this.instance} />;
            case 'fn':
                const childText = node.children.map(child => {
                if (child.type === 'text') {
                    return child.props.text;
                } else {
                    return toString(child); // 子ノードがテキスト以外の場合、toStringを使用して文字列に変換
                }
                }).join(''); // 複数の子ノードがある場合は連結

            return <span>{childText}</span>;


            default:
                return <>{toString(node)}</>
        }
    }

    recur(node: MfmNode[] | MfmNode): ReactNode {
        if (Array.isArray(node)) {
            return node.map(node => this.recur(node));
        } else {
            const { children } = node;
            if (children) {
                // childrenがnullまたはundefinedでないことを確認
                return this.toReact(node, this.recur(children));
            } else {
                // childrenがnullまたはundefinedの場合、空のフラグメントを渡す
                return this.toReact(node, <></>);
            }
        }
    }

    convert(text: string) {
        const parsed = parse(text);
        if (!parsed) {
        console.error('Parsed result is null or undefined.');
          return null; // または適切なデフォルト値
        }
        // parsedが有効な場合のみ処理を続ける
        return this.recur(parsed);
    }
}
