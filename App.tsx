import React, { useState, useCallback, useRef } from 'react';

const YouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-7 h-7 text-red-500"
  >
    <path
      fillRule="evenodd"
      d="M19.802 5.378a3.18 3.18 0 012.247 2.25c.14 1.34.151 4.22.151 4.372s-.01 3.032-.15 4.372a3.18 3.18 0 01-2.248 2.25c-1.724.18-8.602.18-8.602.18s-6.878 0-8.602-.18a3.18 3.18 0 01-2.247-2.25c-.14-1.34-.151-4.22-.151-4.372s.01-3.032.15-4.372a3.18 3.18 0 012.247-2.25c1.724-.18 8.602-.18 8.602.18s6.878 0 8.602.18zM9.544 14.531V9.469L14.73 12l-5.186 2.531z"
      clipRule="evenodd"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const extractVideoId = (inputUrl: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = inputUrl.match(regex);
    return match ? match[1] : null;
  };
  
  const resetState = useCallback(() => {
    setUrl('');
    setVideoId(null);
    setThumbnailUrl(null);
    setError(null);
    setIsLoading(false);
    setIsDownloading(false);
  }, []);

  const handleFetchThumbnail = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('YouTubeのURLを入力してください。');
      return;
    }

    setIsLoading(true);
    setThumbnailUrl(null);
    setError(null);
    
    const id = extractVideoId(url);

    if (id) {
        setVideoId(id);
        const maxResUrl = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
        setThumbnailUrl(maxResUrl);
        setTimeout(() => setIsLoading(false), 500);
    } else {
        setError('有効なYouTube動画のURLではありません。');
        setIsLoading(false);
    }
  }, [url]);

  const handleImageError = useCallback(() => {
    if (videoId) {
        const sdUrl = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
        if (imgRef.current && imgRef.current.src !== sdUrl) {
            imgRef.current.src = sdUrl;
        } else {
            setError('この動画のサムネイルは取得できませんでした。');
            setThumbnailUrl(null);
        }
    }
  }, [videoId]);


  const handleDownload = useCallback(async () => {
    if (!thumbnailUrl) return;

    setIsDownloading(true);
    setError(null);
    
    try {
        const response = await fetch(thumbnailUrl);
        if (!response.ok) {
            throw new Error('画像のダウンロードに失敗しました。');
        }
        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `${videoId || 'youtube_thumbnail'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
    } finally {
        setIsDownloading(false);
    }
  }, [thumbnailUrl, videoId]);

  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center p-4 pt-8 sm:pt-12 font-sans">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <YouTubeIcon />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">
              サムネダウンローダー
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            YouTube動画のURLを貼るだけで<br />簡単ダウンロード
          </p>
        </header>

        <main className="w-full">
          <form onSubmit={handleFetchThumbnail} className="flex flex-col gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ここにYouTube動画のURLを貼り付け"
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-base placeholder-gray-500"
            />
            <div className="flex flex-col gap-3">
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                  >
                    {isLoading ? '取得中...' : 'サムネイルを取得'}
                  </button>
                  <button
                    type="button"
                    onClick={resetState}
                    className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                  >
                    <ClearIcon />
                    クリア
                  </button>
            </div>
          </form>

          <div className="mt-8 text-center min-h-[280px] flex items-center justify-center">
            {isLoading && (
              <div className="flex flex-col items-center">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-400">サムネイルを探しています...</p>
              </div>
            )}
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg w-full">
                    <p className="font-bold">エラー</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {thumbnailUrl && !error && (
              <div className="w-full flex flex-col items-center gap-4 animate-fade-in-scale">
                <div className="w-full aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg shadow-black/30">
                    <img
                        ref={imgRef}
                        src={thumbnailUrl}
                        alt="YouTube Thumbnail"
                        className="w-full h-full object-cover"
                        onLoad={() => setIsLoading(false)}
                        onError={handleImageError}
                    />
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full max-w-xs flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-base hover:shadow-lg hover:shadow-green-500/20 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                >
                  <DownloadIcon />
                  {isDownloading ? 'ダウンロード中...' : 'ダウンロード'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
