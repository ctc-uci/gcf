import { useState } from 'react';

export function useFullscreenFlyout() {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        setIsFullScreen(prev => !prev);
    };

    return [ isFullScreen, toggleFullScreen ];

}
