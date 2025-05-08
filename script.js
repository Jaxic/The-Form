document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // Direct webhook URL - no proxy since the proxy is returning 500 errors
    const WEBHOOK_URL = 'https://jaxic.app.n8n.cloud/webhook/feadab27-dddf-4b36-8d41-b2b06bc30d24';
    
    // Only track if a submission is in progress - no time restrictions
    let isSubmitting = false;
    
    // Enable logging for debugging
    console.log("Content form script loaded successfully");
    
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
    const solawaveCheckbox = document.getElementById('solawave');
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const formatInfoContainer = document.getElementById('format-info');
    
    // Check if elements were found
    if (!contentForm || !submitButton || !loadingIndicator) {
        console.error('Critical DOM elements are missing!');
        return; // Exit to prevent errors
    }
    
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
        if (!statusMessage) {
            console.error('Status message element not found!');
            return;
        }
        
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
    
    // Clear any potential leftover error messages on page load
    window.addEventListener('load', () => {
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = '';
            statusMessage.style.display = 'none';
        }
    });
    
    // Form submission logic with simple in-progress protection
    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("Form submission triggered");
        
        // Check if we're already processing a submission
        if (isSubmitting) {
            console.log("Form submission already in progress, ignoring this click");
            displayMessage("A submission is already in progress. Please wait for it to complete.", 'error');
            return;
        }
        
        // Set the debounce flag immediately
        isSubmitting = true;
        
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
            user: userInput.value.trim(),
            solawave: solawaveCheckbox.checked // Add the checkbox value (true/false)
        };
        
        // Show loading & disable button - FIX for button text overflow
        loadingIndicator.style.display = 'flex';
        submitButton.disabled = true;
        
        // Store original button text
        const originalButtonText = submitButton.textContent || 'Submit';
        
        // Update button text (fixed to prevent overflow)
        submitButton.textContent = 'Processing...';
        
        try {
            // Try using a different CORS proxy
            const corsAnywhereProxy = 'https://cors-anywhere.herokuapp.com/';
            const proxyUrl = `${corsAnywhereProxy}${WEBHOOK_URL}`;
            
            console.log('Sending data to webhook via alternative CORS proxy');
            console.log('Form data being sent:', formData);
            
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify(formData)
            });

            let responseBody = '';
            try {
                responseBody = await response.text();
                console.log('Received response:', responseBody);
            } catch (bodyError) {
                console.warn("Could not read response body:", bodyError);
                responseBody = "[Could not read response body]";
            }

            if (response.ok) {
                // Success handling - show the response
                displayMessage(
                    `<pre>${escapeHtml(responseBody)}</pre>`,
                    'success'
                );
                contentForm.reset();
                keywordInput.focus();
                // Reset the format info display
                displayFormatInfo("");
            } else {
                // Error handling - show the response
                displayMessage(
                    `<pre>${escapeHtml(responseBody)}</pre>`,
                    'error'
                );
            }
        } catch (error) {
            // Network error handling
            console.error('Network or fetch error:', error);
            
            displayMessage(`
                <strong>CORS Error Detected:</strong> ${error.message}
                <br><br>
                It seems our CORS proxy is experiencing issues. As an alternative, consider:
                <br><br>
                1. Try a different browser or disable CORS checks temporarily (for testing only)
                <br>
                2. Install a CORS-disabling browser extension like "CORS Unblock" for Chrome
                <br>
                3. Use your form data directly in n8n by copying this information:
                <br><br>
                <pre>${escapeHtml(JSON.stringify(formData, null, 2))}</pre>
            `, 'error');
        } finally {
            // Reset UI state
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            
            // IMPORTANT FIX: Restore original button text
            submitButton.textContent = originalButtonText;
            
            // Reset the submission flag so we can submit again
            isSubmitting = false;
        }
    });
});
