
var AICommentCompanion = AICommentCompanion || {};

AICommentCompanion.utils = {
    /**
     * Sets the value of a React-controlled input, textarea, or contenteditable element.
     * @param {HTMLElement} element - The target element.
     * @param {string} value - The value to set.
     */
    setNativeValue: function(element, value) {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
            // Using execCommand to simulate user typing, which is often
            // more robust for complex editors like DraftJS.
            // This selects all content and replaces it with the new value.
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, value);
        } else {
            // Original logic for <textarea>
            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
            const prototype = Object.getPrototypeOf(element);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

            if (valueSetter && valueSetter !== prototypeValueSetter) {
                prototypeValueSetter.call(element, value);
            } else if (valueSetter) {
                valueSetter.call(element, value);
            } else {
                element.value = value;
            }

            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('keyup', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('keydown', { bubbles: true, cancelable: true }));
        }
    },

    /**
     * Checks if an RGB color string is dark or light.
     * @param {string} rgbColor - The CSS rgb() color string.
     * @returns {boolean} - True if the color is dark, false otherwise.
     */
    isDarkColor: function(rgbColor) {
        if (!rgbColor || !rgbColor.includes('rgb')) return true;
        try {
            const [r, g, b] = rgbColor.match(/\d+/g).map(Number);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
        } catch (e) {
            console.warn('Could not parse color:', rgbColor);
            return true;
        }
    },

    /**
     * Injects the necessary CSS for the UI into the page's head.
     * This function ensures styles are only added once.
     */
    injectStyles: function() {
        if (document.getElementById('ai-comment-companion-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'ai-comment-companion-styles';
        style.textContent = `
            /* General Container */
            .ai-comment-container {
                margin: 0 0 4px 0; /* Reduced bottom margin */
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                animation: ai-slideIn 0.3s ease-out;
            }

            /* Tones Section */
            .ai-comment-tones-section {
                /* Removed margin-bottom */
            }
            .ai-comment-tone-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: flex-end;
            }
            
            .ai-comment-tone-tag {
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border-style: solid;
                border-width: 1px;
                height: 38px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .light-theme .ai-comment-tone-tag {
                background: rgba(32, 178, 170, 0.08);
                border-color: rgba(32, 178, 170, 0.2);
                color: #0D9488;
            }
            .light-theme .ai-comment-tone-tag:hover {
                background: rgba(32, 178, 170, 0.12);
                border-color: rgba(32, 178, 170, 0.3);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(32, 178, 170, 0.15);
            }

            .dark-theme .ai-comment-tone-tag {
                background: rgba(32, 178, 170, 0.1);
                border-color: rgba(32, 178, 170, 0.2);
                color: #20B2AA;
            }
            .dark-theme .ai-comment-tone-tag:hover {
                background: rgba(32, 178, 170, 0.15);
                border-color: rgba(32, 178, 170, 0.3);
                transform: translateY(-1px);
            }

            .ai-comment-tone-tag.active {
                background: linear-gradient(135deg, #20B2AA, #1E90FF);
                border-color: transparent;
                color: white;
                box-shadow: 0 4px 12px rgba(32, 178, 170, 0.25);
            }
            
            .dark-theme .ai-comment-tone-tag.active {
                box-shadow: none;
            }

            .ai-comment-tone-tag.generating {
                background: linear-gradient(135deg, #20B2AA, #1E90FF);
                border-color: transparent;
                color: white;
                position: relative;
                overflow: hidden;
                pointer-events: none;
            }

            .ai-comment-tone-tag.generating::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: ai-shimmer 1.5s infinite;
            }
            
            .ai-comment-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: ai-spin 0.8s linear infinite;
            }

            .ai-comment-picker-section {
                display: none;
                margin-top: 8px; /* Replaced negative/bottom margins */
                padding: 8px;
                border-radius: 12px;
                animation: ai-slideIn 0.3s ease-out;
                flex-direction: column;
                gap: 8px;
            }
            .light-theme .ai-comment-picker-section {
                background: rgba(0, 0, 0, 0.02);
                border: 1px solid rgba(0, 0, 0, 0.08);
            }
            .dark-theme .ai-comment-picker-section {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }
            .ai-comment-picker-btn {
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                border: 1px solid transparent;
            }
            .light-theme .ai-comment-picker-btn {
                background: rgba(0, 0, 0, 0.03);
                border-color: rgba(0, 0, 0, 0.1);
                color: #374151;
            }
            .light-theme .ai-comment-picker-btn:hover {
                background: rgba(0, 0, 0, 0.05);
                border-color: rgba(0, 0, 0, 0.15);
            }
            .dark-theme .ai-comment-picker-btn {
                background: rgba(255, 255, 255, 0.05);
                border-color: rgba(255, 255, 255, 0.1);
                color: #E5E5E5;
            }
            .dark-theme .ai-comment-picker-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.2);
            }
            .ai-comment-picker-btn-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 85%;
            }
            .ai-comment-picker-btn-info {
                font-size: 12px;
                color: #9CA3AF;
                white-space: nowrap;
            }


            /* Animations */
            @keyframes ai-shimmer { 0% { left: -100%; } 100% { left: 100%; } }
            @keyframes ai-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes ai-slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

            /* Responsive */
            @media (max-width: 600px) {
                .ai-comment-tone-tags { gap: 6px; }
                .ai-comment-tone-tag { font-size: 13px; padding: 6px 12px; }
            }
        `;
        document.head.appendChild(style);
    }
};
