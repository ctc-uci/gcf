export function getYouTubeEmbedUrl(video) {
    const videoId = video.snippet.resourceId.videoId;
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
}