export function MediaUpload({ fileInputRef, handleFileChange }) {
    return (
        <Center height="300px">
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
            />
            <Button
                variant="outline"
                px={12}
                py={6}
                borderColor="black"
                borderRadius="lg"
                fontWeight="normal"
                onClick={() => fileInputRef.current.click()}
            >
                Select Files
            </Button>
        </Center>
    )
}