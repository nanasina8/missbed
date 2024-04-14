import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

// propsの型定義
interface EmojiImageProps {
    emojiName: string;
    instance: string;
}

interface Emoji {
    name: string;
    instance: string;
    url: string;
}

// 絵文字データをローカルストレージから取得する関数
const getEmojiFromLocalStorage = (emojiName: string, instance: string): string | null => {
    const emojis = JSON.parse(localStorage.getItem('emojis') || '[]');
    const emoji = emojis.find((e: Emoji) => e.name === emojiName && e.instance === instance);
    return emoji ? emoji.url : null;
};

// 絵文字データをローカルストレージに保存する関数
const saveEmojiToLocalStorage = (emoji: Emoji) => {
    const emojis = JSON.parse(localStorage.getItem('emojis') || '[]');
    localStorage.setItem('emojis', JSON.stringify([...emojis, emoji]));
};

const EmojiImage: React.FC<EmojiImageProps> = ({ emojiName, instance }) => {
    const [emojiUrl, setEmojiUrl] = useState<string>('');

    useEffect(() => {
        // ローカルストレージから絵文字データを取得
        const cachedUrl = getEmojiFromLocalStorage(emojiName, instance);
        if (cachedUrl) {
            setEmojiUrl(cachedUrl);
            return;
        }

        const fetchEmojiData = async () => {
            try {
                const response = await axios.get(`https://${instance}/api/emoji`, { params: { name: emojiName } });
                const emojiData = response.data;
                setEmojiUrl(emojiData.url);
                saveEmojiToLocalStorage({ name: emojiName, instance, url: emojiData.url });
            } catch (error) {
                // v12対応
                try {
                    const metaResponse = await axios.post(`https://${instance}/api/meta`, { params: { detail: 'false' } });
                    const emojis = metaResponse.data.emojis;
                    const matchingEmoji = emojis.find((emoji: Emoji) => emoji.name === emojiName);
                    if (matchingEmoji) {
                        setEmojiUrl(matchingEmoji.url);
                        saveEmojiToLocalStorage({ name: emojiName, instance, url: matchingEmoji.url });
                    }
                } catch (metaError) {
                    console.error('メタデータの取得に失敗しました。', metaError);
                }
            }
        };
    
        fetchEmojiData();
    }, [emojiName, instance]);

    return emojiUrl ? (
        <span style={{ position: 'relative', display: 'inline-block', height: '1.5em', width: 'auto', verticalAlign: 'middle' }}>
            <img src={emojiUrl} alt={`Emoji ${emojiName}`} style={{ height: '100%', width: 'auto' }} />
        </span>
    ) : null;
};

export default EmojiImage;
