
var AICommentCompanion = AICommentCompanion || {};

AICommentCompanion.handlers = {
    /**
     * Handles the click event for a tone tag.
     * @param {MouseEvent} event - The click event.
     * @param {HTMLElement} textArea - The target textarea.
     */
    handleToneClick: async function(event, textArea) {
        const toneTag = event.currentTarget;
        const tone = toneTag.dataset.tone;
        const originalTextContent = toneTag.textContent;

        const container = toneTag.closest('.ai-comment-container');
        const pickerSection = container.querySelector('.ai-comment-picker-section');
        if (pickerSection) {
            pickerSection.style.display = 'none';
            pickerSection.innerHTML = '';
        }

        console.log(`Tone '${tone}' selected.`);

        const originalPost = AICommentCompanion.twitter.getOriginalPostText(textArea);
        if (!originalPost) {
            console.warn("AI Companion could not find the original tweet's text. Silently failing.");
            return;
        }
        
        toneTag.classList.add('generating');
        toneTag.innerHTML = `<div class="ai-comment-spinner"></div>`;

        try {
            const response = await chrome.runtime.sendMessage({
                type: 'generate:comments',
                payload: {
                    originalPost: originalPost,
                    tone: tone.toLowerCase(),
                    platform: 'twitter',
                    maxLength: 280
                }
            });

            console.log('Response from background:', response);

            toneTag.classList.remove('generating');
            toneTag.textContent = originalTextContent;
            
            if (response.success && response.comments && response.comments.length > 0) {
                AICommentCompanion.ui.showCommentPicker(response.comments, textArea, container);
            } else {
                const errorMessage = response.error || "The AI didn't return any comments. Try again.";
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error during comment generation flow:', error);
            
            toneTag.classList.remove('generating');
            toneTag.textContent = originalTextContent;

            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            alert(`Error: ${errorMessage}`);
        }
    }
};
