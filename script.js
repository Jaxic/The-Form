document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const WEBHOOK_URL = 'https://polished-polite-blowfish.ngrok-free.app/webhook/feadab27-dddf-4b36-8d41-b2b06bc30d24';
    
    // Add this debounce flag and a timestamp for last submission
    let isSubmitting = false;
    let lastSubmissionTime = 0;
    const MIN_SUBMISSION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    // Format information for each article type
    const formatInfo = {
        "Step-by-Step": {
            title: "Step-by-Step Format",
            sections: [
                "What is [Topic]?",
                "What Causes [Topic]?",
                "How To [Action]: Step-by-Step",
                "FAQ #1",
                "FAQ #2",
                "FAQ #3",
                "FAQ #4",
                "FAQ #5",
                "FAQ #6",
                "Tips for [Topic]",
                "[Topic] for [Product/Keyword]"
            ],
            note: "This format provides a comprehensive guide with a clear step-by-step approach and FAQs."
        },
        "Verses": {
            title: "Verses Format",
            sections: [
                "\"What is \\\"A\\\"?\"",
                "\"What is \\\"B\\\"?\"",
                "\"Answer the title\"",
                "FAQ #1",
                "FAQ #2",
                "FAQ #3",
                "FAQ #4",
                "FAQ #5",
                "FAQ #6",
                "Section contrasting \"A\" and \"B\" (Tips/Comparison):"
            ],
            note: "This format compares two related concepts with a focus on answering the main question through contrasting elements."
        },
        "Does": {
            title: "Does Format",
            sections: [
                "\"What is [Topic]?\"",
                "\"What are the benefits of [Topic]\"",
                "\"Why is it important to understand [Topic]?\"",
                "\"Answer the title\"",
                "FAQ #1",
                "FAQ #2",
                "FAQ #3",
                "FAQ #4",
                "FAQ #5",
                "FAQ #6"
            ],
            note: "This format addresses 'Does' questions with a focus on explaining the topic's benefits and importance."
        },
        "Is/Are/Can": {
            title: "Is/Are/Can Format",
            sections: [
                "\"What is the core subject?\"",
                "\"What are the benefits of [Topic]?\"",
                "\"Answer the title\"",
                "FAQ #1",
                "FAQ #2",
                "FAQ #3",
                "FAQ #4",
                "FAQ #5",
                "FAQ #6",
                "\"Common Mistakes OR Expert Tips for [Topic]\""
            ],
            note: "This format answers 'Is/Are/Can' questions with comprehensive information and practical advice."
        },
        "What Does": {
            title: "What Does Format",
            sections: [
                "\"What is the core subject?\"",
                "Title",
                "FAQ #1",
                "FAQ #2",
                "FAQ #3",
                "FAQ #4",
                "FAQ #5",
                "FAQ #6",
                "\"Common Mistakes OR Expert Tips for [Topic]\""
            ],
            note: "This format explains a concept by addressing its core elements and common questions."
        },
        "5 Reasons": {
            title: "5 Reasons Format",
            sections: [
                "\"What is the core subject?\"",
                "Title (5 Reason breakdown)",
                "FAQ #1",
                "FAQ #2",
                "FAQ #3",
                "FAQ #4",
                "FAQ #5",
                "FAQ #6",
                "\"Common Mistakes OR Expert Tips for [Topic]\""
            ],
            note: "This format presents five key reasons or points about the topic with supporting FAQs."
        },
        "Step-What/Why/How": {
            title: "Step-What/Why/How Format",
            sections: [
                "\"What is [Topic]?\"",
                "\"Why is [Topic] Important?\"",
                "\"How to [Action]: Step-by-Step\"",
                "FAQ #1",
                "FAQ #2",
                "FAQ #3",
                "FAQ #4",
                "FAQ #5",
                "FAQ #6",
                "\"Common Mistakes to Avoid When [Action]\""
            ],
            note: "This format addresses the what, why, and how of a topic with a structured step-by-step approach."
        }
    };

    // --- DOM Elements ---
    const contentForm = document.getElementById('content-form');
    const keywordInput = document.getElementById('keyword');
    const titleInput = document.getElementById('title');
    const productUrlInput = document.getElementById('productUrl');
    const articleTypeSelect = document.getElementById('articleType');
    const userInput = document.getElementById('user');
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const formatInfoContainer = document.getElementById('format-info');
    
    // Helper function to escape HTML
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Function to display format information
    function displayFormatInfo(articleType) {
        const info = formatInfo[articleType];
        
        // If no format information is available, show default message
        if (!info) {
            formatInfoContainer.innerHTML = `
                <div class="format-header">
                    <h3>Article Format</h3>
                    <div class="format-badge">Reference</div>
                </div>
                <div class="format-content">
                    <p class="info-select-prompt">Please select an article type to view its structure</p>
                </div>
            `;
            return;
        }
        
        // Build the HTML for the format info
        let html = `
            <div class="format-header">
                <h3>Article Format</h3>
                <div class="format-badge">Reference</div>
            </div>
            <div class="format-content">
                <p class="format-type-title">${info.title}</p>
                <ul class="format-sections">
        `;
        
        // Add each section as a list item
        info.sections.forEach(section => {
            html += `<li>${section}</li>`;
        });
        
        html += `
                </ul>
                <div class="format-note">
                    <strong>Note:</strong> ${info.note}
                </div>
            </div>
        `;
        
        // Update the container
        formatInfoContainer.innerHTML = html;
    }
    
    // Event listener for article type selection
    articleTypeSelect.addEventListener('change', (event) => {
        displayFormatInfo(event.target.value);
    });
    
    // Initialize with default view
    displayFormatInfo("");
    
    // Function to display status messages
    function displayMessage(message, type) {
        const statusMessage = document.getElementById('status-message');
        statusMessage.style.display = 'block';
        statusMessage.className = '';
        
        if (type === 'success') {
            statusMessage.classList.add('success-message');
            // For success, just show the webhook response
            if (message.includes('Webhook Response')) {
                const responseText = message.split('<strong>Webhook Response:</strong>')[1] || '';
                statusMessage.innerHTML = responseText;
            } else {
                statusMessage.innerHTML = message;
            }
        } else if (type === 'error') {
            statusMessage.classList.add('error-message');
            // For errors, just show the webhook response if available
            if (message.includes('Webhook Response')) {
                const responseText = message.split('<strong>Webhook Response:</strong>')[1] || '';
                statusMessage.innerHTML = responseText;
            } else {
                statusMessage.innerHTML = message;
            }
        }
    }
    
    // Form submission logic with enhanced protection
    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const currentTime = Date.now();
        const timeSinceLastSubmission = currentTime - lastSubmissionTime;
        
        // Check if we're already processing a submission
        if (isSubmitting) {
            console.log("Form submission already in progress, ignoring this click");
            displayMessage("A submission is already in progress. Please wait for it to complete.", 'error');
            return;
        }
        
        // Check if minimum interval has elapsed since last submission
        if (lastSubmissionTime > 0 && timeSinceLastSubmission < MIN_SUBMISSION_INTERVAL) {
            const minutesRemaining = Math.ceil((MIN_SUBMISSION_INTERVAL - timeSinceLastSubmission) / 60000);
            console.log(`Minimum submission interval not reached. Please wait ${minutesRemaining} more minutes.`);
            displayMessage(`Please wait approximately ${minutesRemaining} more minute${minutesRemaining !== 1 ? 's' : ''} before submitting again to avoid duplicate processing.`, 'error');
            return;
        }
        
        // Set the debounce flag immediately and update last submission time
        isSubmitting = true;
        lastSubmissionTime = currentTime;
        
        // Store submission data in localStorage as a backup
        try {
            const formData = {
                keyword: keywordInput.value.trim(),
                title: titleInput.value.trim(),
                productUrl: productUrlInput.value.trim(),
                articleType: articleTypeSelect.value,
                user: userInput.value.trim(),
                timestamp: currentTime
            };
            localStorage.setItem('lastFormSubmission', JSON.stringify(formData));
        } catch (e) {
            console.warn("Could not save form data to localStorage:", e);
        }
        
        // UI reset and preparation
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = '';
            statusMessage.style.display = 'none';
            statusMessage.className = '';
        }
        
        // Prepare the form data
        const formData = {
            keyword: keywordInput.value.trim(),
            title: titleInput.value.trim(),
            productUrl: productUrlInput.value.trim(),
            articleType: articleTypeSelect.value,
            user: userInput.value.trim()
        };
        
        // Show loading & disable button
        loadingIndicator.style.display = 'flex';
        submitButton.disabled = true;
        submitButton.textContent = 'Processing (approx. 5 min)...';
        
        // Send to webhook
        let responseBody = '';
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            try {
                responseBody = await response.text();
            } catch (bodyError) {
                console.warn("Could not read response body:", bodyError);
                responseBody = "[Could not read response body]";
            }

            if (response.ok) {
                // Success handling - just show the response
                displayMessage(
                    `<pre>${escapeHtml(responseBody)}</pre>`,
                    'success'
                );
                contentForm.reset();
                keywordInput.focus();
                // Reset the format info display
                displayFormatInfo("");
            } else {
                // Error handling - just show the response
                displayMessage(
                    `<pre>${escapeHtml(responseBody)}</pre>`,
                    'error'
                );
            }
        } catch (error) {
            // Network error handling
            console.error('Network or fetch error:', error);
            displayMessage(`A network error occurred: ${error.message}. <br> Your submission may still be processing. Please wait before submitting again.`, 'error');
        } finally {
            // Reset UI state
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
            
            // Reset debounce flag after a longer timeout that matches MIN_SUBMISSION_INTERVAL
            // But keep the lastSubmissionTime to enforce minimum interval
            setTimeout(() => {
                isSubmitting = false;
                // Don't reset lastSubmissionTime here, it's used for interval checking
            }, 30000); // 30 seconds
        }
    });
    
    // Check for browser refresh/reload during submission
    window.addEventListener('load', () => {
        try {
            const savedSubmission = localStorage.getItem('lastFormSubmission');
            if (savedSubmission) {
                const submissionData = JSON.parse(savedSubmission);
                const currentTime = Date.now();
                const timeSinceSubmission = currentTime - submissionData.timestamp;
                
                // If less than the minimum interval, show a warning
                if (timeSinceSubmission < MIN_SUBMISSION_INTERVAL) {
                    const minutesRemaining = Math.ceil((MIN_SUBMISSION_INTERVAL - timeSinceSubmission) / 60000);
                    console.log(`Recent submission detected. ${minutesRemaining} minutes remaining before next submission.`);
                    displayMessage(`A form was recently submitted (${Math.floor(timeSinceSubmission / 60000)} minutes ago). Please wait approximately ${minutesRemaining} more minute${minutesRemaining !== 1 ? 's' : ''} before submitting again to avoid duplicate processing.`, 'error');
                    lastSubmissionTime = submissionData.timestamp;
                }
            }
        } catch (e) {
            console.warn("Could not process saved submission data:", e);
        }
    });
});
