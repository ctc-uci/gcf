import { Button } from '@chakra-ui/react';

export function FullscreenFlyoutButton(props) {
    const { isFullScreen, toggleFullScreen, marginLeft, marginTop, width, height } = props;
    return (
        <Button onClick={toggleFullScreen} aria-label={isFullScreen ? 'Exit' : 'Expand'} variant="outline" size="sm" marginLeft={marginLeft} marginTop={marginTop} width={width} height={height} >
            {isFullScreen ? 'Exit' : 'Expand'}
        </Button>
    );
}



