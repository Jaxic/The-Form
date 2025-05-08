document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // n8n webhook URL
    const WEBHOOK_URL = 'https://jaxic.app.n8n.cloud/webhook/feadab27-dddf-4b36-8d41-b2b06bc30d24';
    
    // Only track if a submission is in progress
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
                "Tips for [Topic]"
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
                "FAQ #4"
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
        if (!str) return '';
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
        } else if (type === 'error') {
            statusMessage.classList.add('error-message');
        } else if (type === 'info') {
            statusMessage.classList.add('info-message');
        }
        
        statusMessage.innerHTML = message;
    }
    
    // Add info-message style to CSS
    const style = document.createElement('style');
    style.textContent = `
        .info-message {
            background-color: #ebf8ff;
            color: #2b6cb0;
            border: 1px solid #bee3f8;
        }
    `;
    document.head.appendChild(style);
    
    // Form submission handler
    contentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log("Form submission triggered");
        
        // Prevent multiple submissions
        if (isSubmitting) {
            console.log("Form submission already in progress, ignoring this click");
            displayMessage("A submission is already in progress. Please wait.", 'error');
            return;
        }
        
        // Set the debounce flag
        isSubmitting = true;
        
        // UI preparation
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
            solawave: solawaveCheckbox.checked
        };
        
        // Generate a unique ID for this submission to reference in messages
        const submissionId = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        
        // Store form data with time for reference
        const submissionTime = new Date().toLocaleTimeString();
        const submissionDetails = {
            id: submissionId,
            time: submissionTime,
            data: formData
        };
        
        // Show loading indicator
        loadingIndicator.style.display = 'flex';
        submitButton.disabled = true;
        const originalButtonText = submitButton.textContent || 'Submit';
        submitButton.textContent = 'Processing...';
        
        // Use XMLHttpRequest for better control
        const xhr = new XMLHttpRequest();
        
        // Set up response handling
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) { // Request is done
                // Reset UI state immediately
                loadingIndicator.style.display = 'none';
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                isSubmitting = false;
                
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Check if response contains "Success!"
                    const responseText = xhr.responseText;
                    console.log('Response received:', responseText);
                    
                    if (responseText.includes("Success")) {
                        // Workflow accepted - true success
                        displayMessage(`
                            <p><strong>Success!</strong> Your article request has been received.</p>
                            <p>Article generation will take 3-6 minutes to complete.</p>
                            <p><strong>Submission Details (ID: ${submissionId}):</strong></p>
                            <div class="submission-details">
                                <ul>
                                    <li><strong>Time:</strong> ${submissionTime}</li>
                                    <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                                    <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                                    <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                                </ul>
                            </div>
                        `, 'success');
                        
                        // Reset the form
                        contentForm.reset();
                        keywordInput.focus();
                        displayFormatInfo("");
                    } else {
                        // Webhook responded but without expected "Success!" message
                        displayMessage(`
                            <p><strong>Warning:</strong> Your request was received, but the response was unexpected.</p>
                            <p>This might indicate an issue with the workflow. The article generation may or may not proceed.</p>
                            <p><strong>Submission Details (ID: ${submissionId}):</strong></p>
                            <div class="submission-details">
                                <ul>
                                    <li><strong>Time:</strong> ${submissionTime}</li>
                                    <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                                    <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                                    <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                                </ul>
                            </div>
                            <hr>
                            <p><strong>Response from server:</strong></p>
                            <pre>${escapeHtml(responseText)}</pre>
                        `, 'info');
                    }
                } else {
                    // HTTP error
                    console.error('Error response:', xhr.status, xhr.statusText, xhr.responseText);
                    
                    displayMessage(`
                        <p><strong>Error (ID: ${submissionId}):</strong> The server returned an error.</p>
                        <p>Status Code: ${xhr.status}</p>
                        <p><strong>Submission Details:</strong></p>
                        <div class="submission-details">
                            <ul>
                                <li><strong>Time:</strong> ${submissionTime}</li>
                                <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                                <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                                <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                            </ul>
                        </div>
                        <hr>
                        <p><strong>Server Response:</strong></p>
                        <pre>${escapeHtml(xhr.responseText || 'No response text')}</pre>
                    `, 'error');
                }
            }
        };
        
        // Handle network errors
        xhr.onerror = function() {
            console.error('Network error occurred');
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            isSubmitting = false;
            
            displayMessage(`
                <p><strong>Network Error (ID: ${submissionId}):</strong> Could not connect to the server.</p>
                <p>This could be due to CORS restrictions or network connectivity issues.</p>
                <p><strong>Submission Details:</strong></p>
                <div class="submission-details">
                    <ul>
                        <li><strong>Time:</strong> ${submissionTime}</li>
                        <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                        <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                        <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                    </ul>
                </div>
            `, 'error');
        };
        
        // Handle timeouts gracefully
        xhr.timeout = 60000; // 60 seconds timeout (adjust as needed)
        xhr.ontimeout = function() {
            console.log('Request timed out');
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            isSubmitting = false;
            
            displayMessage(`
                <p><strong>Request Timeout (ID: ${submissionId}):</strong> The server is taking longer than expected to respond.</p>
                <p>However, your article generation may still be in progress. The n8n workflow runs for 3-6 minutes.</p>
                <p><strong>Submission Details:</strong></p>
                <div class="submission-details">
                    <ul>
                        <li><strong>Time:</strong> ${submissionTime}</li>
                        <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                        <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                        <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                    </ul>
                </div>
            `, 'info');
        };
        
        // Add submission details styling
        const detailsStyle = document.createElement('style');
        detailsStyle.textContent = `
            .submission-details {
                margin: 10px 0;
                padding: 10px;
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
            }
            
            .submission-details ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .submission-details li {
                margin-bottom: 5px;
            }
        `;
        document.head.appendChild(detailsStyle);
        
        // Set up and send the request
        try {
            // Show immediate feedback
            displayMessage(`
                <p><strong>Request Submitted (ID: ${submissionId})...</strong></p>
                <p>Connecting to the server...</p>
                <p>Please wait while we process your request.</p>
                <div class="submission-details">
                    <ul>
                        <li><strong>Time:</strong> ${submissionTime}</li>
                        <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                        <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                        <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                    </ul>
                </div>
            `, 'info');
            
            xhr.open('POST', WEBHOOK_URL, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(formData));
            
        } catch (error) {
            console.error('Error setting up the request:', error);
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            isSubmitting = false;
            
            displayMessage(`
                <p><strong>Error (ID: ${submissionId}):</strong> ${error.message}</p>
                <p>Could not send the request to the server.</p>
                <p><strong>Submission Details:</strong></p>
                <div class="submission-details">
                    <ul>
                        <li><strong>Time:</strong> ${submissionTime}</li>
                        <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                        <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                        <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                    </ul>
                </div>
            `, 'error');
        }
    });
});
