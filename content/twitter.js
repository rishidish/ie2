
var AICommentCompanion = AICommentCompanion || {};

AICommentCompanion.twitter = {
    /**
     * Finds the main text content of the tweet being replied to.
     * @param {HTMLElement} textArea - The reply textarea.
     * @returns {string} - The text of the original tweet, or an empty string if not found.
     */
    getOriginalPostText: function(textArea) {
        console.log('AI-Companion: Starting search for original post text.');

        // Strategy 1: Look within a reply dialog (modal).
        const dialog = textArea.closest('div[role="dialog"]');
        if (dialog) {
            console.log('AI-Companion: Reply dialog found.');
            const articles = Array.from(dialog.querySelectorAll('article'));
            const composerArticle = textArea.closest('article');

            for (const article of articles) {
                if (article === composerArticle) continue;
                const textEl = article.querySelector('[data-testid="tweetText"]');
                if (textEl && textEl.textContent) {
                    console.log('AI-Companion: Found text in dialog article.');
                    return textEl.textContent;
                }
            }
        }
        
        // Strategy 2: Look on a tweet detail/status page.
        if (window.location.pathname.includes('/status/')) {
            console.log('AI-Companion: Status page detected.');
            const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
            if(primaryColumn) {
                const articles = primaryColumn.querySelectorAll('article');
                for (const article of articles) {
                    if (article.contains(textArea)) continue;
                    const textEl = article.querySelector('[data-testid="tweetText"]');
                    if (textEl && textEl.textContent) {
                         console.log('AI-Companion: Found text using status page strategy.');
                         return textEl.textContent;
                    }
                }
            }
        }

        // Strategy 3: Look for inline replies on the timeline.
        console.log('AI-Companion: Trying inline reply strategy.');
        const composerContainer = textArea.closest('div[data-testid="cellInnerDiv"]');
        if (composerContainer) {
            let sibling = composerContainer.previousElementSibling;
            while(sibling) {
                const textEl = sibling.querySelector('article [data-testid="tweetText"]');
                if (textEl && textEl.textContent) {
                    console.log('AI-Companion: Found text using inline reply strategy.');
                    return textEl.textContent;
                }
                sibling = sibling.previousElementSibling;
            }
        }

        console.error('AI-Companion: All strategies failed. Could not find the original tweet text.');
        return '';
    }
};
