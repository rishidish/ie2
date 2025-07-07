
// Creates a global namespace to avoid polluting the global scope
var AICommentCompanion = AICommentCompanion || {};

AICommentCompanion.config = {
    REPLY_TEXT_AREA_SELECTOR: '[data-testid="tweetTextarea_0"], [role="textbox"][contenteditable="true"]',
    PROCESSED_ELEMENT_MARKER: 'ai-comment-companion-processed',
    TONES: ['Friendly', 'Professional', 'Casual', 'Enthusiastic', 'Thoughtful', 'Humorous', 'Gen-Z', 'Thanks'],
};
