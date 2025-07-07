
var AICommentCompanion = AICommentCompanion || {};

AICommentCompanion.ui = {
    /**
     * Creates the main UI component for AI Tones.
     * @param {HTMLElement} textArea - The target textarea element.
     * @returns {HTMLElement} - The created UI container.
     */
    createAiTonesUI: function(textArea) {
        const container = document.createElement('div');
        container.className = 'ai-comment-container';

        const pageBgColor = getComputedStyle(document.documentElement).backgroundColor;
        const isDarkMode = AICommentCompanion.utils.isDarkColor(pageBgColor);
        container.classList.add(isDarkMode ? 'dark-theme' : 'light-theme');

        container.innerHTML = `
            <div class="ai-comment-tones-section">
                <div class="ai-comment-tone-tags"></div>
            </div>
            <div class="ai-comment-picker-section"></div>
        `;

        const tonesContainer = container.querySelector('.ai-comment-tone-tags');
        AICommentCompanion.config.TONES.forEach(tone => {
            const tag = document.createElement('div');
            tag.className = 'ai-comment-tone-tag';
            tag.textContent = tone;
            tag.dataset.tone = tone;
            tag.onclick = (e) => AICommentCompanion.handlers.handleToneClick(e, textArea);
            tonesContainer.appendChild(tag);
        });

        return container;
    },

    /**
     * Displays a UI for the user to pick from multiple generated comments.
     * @param {Array} comments - Array of comment objects from the API.
     * @param {HTMLElement} textArea - The target textarea.
     * @param {HTMLElement} container - The main UI container.
     */
    showCommentPicker: function(comments, textArea, container) {
        const pickerSection = container.querySelector('.ai-comment-picker-section');
        if (!pickerSection) return;

        pickerSection.innerHTML = ''; // Clear previous buttons
        pickerSection.style.display = 'flex';

        comments.forEach((comment, index) => {
            const btn = document.createElement('button');
            btn.className = 'ai-comment-picker-btn';
            
            const previewText = comment.text.length > 50 ? comment.text.substring(0, 50) + '...' : comment.text;

            btn.innerHTML = `
                <span class="ai-comment-picker-btn-text"><strong>#${index + 1}</strong>: ${previewText}</span>
                <span class="ai-comment-picker-btn-info">${comment.text.length} chars</span>
            `;
            
            btn.onclick = () => {
                AICommentCompanion.utils.setNativeValue(textArea, comment.text);
                
                textArea.focus();
                
                // selectionStart/End only exist on input/textarea elements
                if (typeof textArea.selectionStart === 'number') {
                    setTimeout(() => {
                        textArea.selectionStart = textArea.selectionEnd = comment.text.length;
                    }, 0);
                }
                
                pickerSection.style.display = 'none';
                pickerSection.innerHTML = '';
            };
            pickerSection.appendChild(btn);
        });
    }
};
