
const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
        successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    } finally {
        document.body.removeChild(textArea);
    }
    return successful;
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (!navigator.clipboard) {
        return fallbackCopyTextToClipboard(text);
    }
    try {
        await navigator.clipboard.writeText(text);
        console.log('Async: Copying to clipboard was successful!');
        return true;
    } catch (err) {
        console.error('Async: Could not copy text: ', err);
    }
    return false;
}