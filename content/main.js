
console.log('AI Comment Companion loading...');

var AICommentCompanion = AICommentCompanion || {};

(function(ACC) {
    'use strict';

    if (!ACC.config || !ACC.utils || !ACC.ui || !ACC.handlers || !ACC.twitter) {
        console.error("AI Comment Companion failed to initialize. A module is missing.");
        return;
    }

    const main = {
        init: function() {
            console.log('AI Comment Companion is observing the page...');
            ACC.utils.injectStyles();
            
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        setTimeout(() => this.findAndProcessCommentBoxes(), 100);
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            this.findAndProcessCommentBoxes();
        },

        injectUI: function(textArea) {
            if (textArea.dataset.processed === ACC.config.PROCESSED_ELEMENT_MARKER) {
                return;
            }
            textArea.dataset.processed = ACC.config.PROCESSED_ELEMENT_MARKER;

            console.log('Injecting AI Tones UI near:', textArea);

            let injectionPoint = textArea.parentElement?.parentElement?.parentElement?.parentElement;

            if (injectionPoint) {
                const ui = ACC.ui.createAiTonesUI(textArea);
                injectionPoint.appendChild(ui);
            } else {
                console.warn('Could not find a suitable injection point for the UI.');
            }
        },

        findAndProcessCommentBoxes: function() {
            const textAreas = document.querySelectorAll(ACC.config.REPLY_TEXT_AREA_SELECTOR);
            textAreas.forEach(this.injectUI);
        }
    };
    
    main.findAndProcessCommentBoxes = main.findAndProcessCommentBoxes.bind(main);
    main.init();

})(AICommentCompanion);
