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
    if (!contentForm || !submitButton || !loadingIndicator || !keywordInput || !titleInput || !productUrlInput || !articleTypeSelect || !userInput || !solawaveCheckbox || !formatInfoContainer) {
        console.error('Critical DOM elements are missing! Ensure all form elements and containers exist.');
        // Display a user-friendly error on the page if a critical element is missing
        const body = document.querySelector('body');
        if (body) {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'Error: A critical page element is missing. The form cannot operate. Please contact support.';
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '20px';
            errorDiv.style.backgroundColor = '#ffe0e0';
            errorDiv.style.border = '1px solid red';
            body.prepend(errorDiv);
        }
        return; // Exit to prevent errors
    }

    // Helper function to escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, """)
            .replace(/'/g, "'");
    }

    // Function to display format information
    function displayFormatInfo(articleType) {
        const info = formatInfo[articleType];

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

        let html = `
            <div class="format-header">
                <h3>Article Format</h3>
                <div class="format-badge">Reference</div>
            </div>
            <div class="format-content">
                <p class="format-type-title">${info.title}</p>
                <ul class="format-sections">
        `;

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
        formatInfoContainer.innerHTML = html;
    }

    articleTypeSelect.addEventListener('change', (event) => {
        displayFormatInfo(event.target.value);
    });

    displayFormatInfo(""); // Initialize with default view

    // Function to display status messages
    function displayMessage(message, type) {
        const statusMessage = document.getElementById('status-message');
        if (!statusMessage) {
            console.error('Status message element not found!');
            return;
        }

        statusMessage.style.display = 'block';
        statusMessage.className = ''; // Clear existing classes

        if (type === 'success') {
            statusMessage.classList.add('success-message');
        } else if (type === 'error') {
            statusMessage.classList.add('error-message');
        } else if (type === 'info') {
            statusMessage.classList.add('info-message');
        }
        statusMessage.innerHTML = message; // Use innerHTML to render HTML content in messages
    }
    
    // Add info-message style to CSS if it doesn't exist
    if (!document.querySelector('style[data-info-message-style]')) {
        const style = document.createElement('style');
        style.dataset.infoMessageStyle = 'true';
        style.textContent = `
            .info-message {
                background-color: #ebf8ff;
                color: #2b6cb0;
                border: 1px solid #bee3f8;
            }
            
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
        document.head.appendChild(style);
    }

    // Form submission handler
    contentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log("Form submission triggered");

        if (isSubmitting) {
            console.log("Form submission already in progress, ignoring this click");
            displayMessage("A submission is already in progress. Please wait for it to complete.", 'error');
            return;
        }
        isSubmitting = true;

        const statusMessageEl = document.getElementById('status-message');
        if (statusMessageEl) {
            statusMessageEl.textContent = '';
            statusMessageEl.style.display = 'none';
            statusMessageEl.className = '';
        }

        const formData = {
            keyword: keywordInput.value.trim(),
            title: titleInput.value.trim(),
            productUrl: productUrlInput.value.trim(),
            articleType: articleTypeSelect.value,
            user: userInput.value.trim(),
            solawave: solawaveCheckbox.checked
        };

        const submissionId = Date.now().toString().slice(-6);
        const submissionTime = new Date().toLocaleTimeString();

        loadingIndicator.style.display = 'flex';
        submitButton.disabled = true;
        const originalButtonText = submitButton.textContent || 'Submit';
        submitButton.textContent = 'Processing... Please Wait';

        displayMessage(`
            <p><strong>Request Submitted (ID: ${submissionId})...</strong></p>
            <p>Your article generation request is being processed by the server.</p>
            <p>This may take 5-10 minutes. Please wait for the response before submitting again.</p>
            <div class="submission-details">
                <ul>
                    <li><strong>Time:</strong> ${submissionTime}</li>
                    <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                    <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                    <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                </ul>
            </div>
        `, 'info');

        try {
            const fetchWithLongTimeout = new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.timeout = 10 * 60 * 1000; // 10 minutes

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        resolve({
                            ok: xhr.status >= 200 && xhr.status < 300,
                            status: xhr.status,
                            text: xhr.responseText
                        });
                    }
                };
                xhr.ontimeout = function() {
                    reject(new Error('Request timed out after 10 minutes'));
                };
                xhr.onerror = function() {
                    reject(new Error('Network error occurred'));
                };

                xhr.open('POST', WEBHOOK_URL, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(formData));
            });

            fetchWithLongTimeout.then(response => {
                console.log('Response received:', response);
                if (response.ok) {
                    displayMessage(`
                        <p><strong>Success! (ID: ${submissionId})</strong></p>
                        <p>Your article has been generated successfully.</p>
                        <div class="submission-details">
                            <ul>
                                <li><strong>Time Submitted:</strong> ${submissionTime}</li>
                                <li><strong>Time Completed:</strong> ${new Date().toLocaleTimeString()}</li>
                                <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                                <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                                <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                            </ul>
                        </div>
                        <hr>
                        <p><strong>Server Response:</strong></p>
                        <pre>${escapeHtml(response.text)}</pre>
                    `, 'success');
                    contentForm.reset();
                    keywordInput.focus();
                    displayFormatInfo(""); // Reset format info on success
                } else {
                    displayMessage(`
                        <p><strong>Error! (ID: ${submissionId})</strong></p>
                        <p>The server returned an error response.</p>
                        <p>Status Code: ${response.status}</p>
                        <div class="submission-details">
                            <ul>
                                <li><strong>Time Submitted:</strong> ${submissionTime}</li>
                                <li><strong>Time Failed:</strong> ${new Date().toLocaleTimeString()}</li>
                                <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                                <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                                <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                            </ul>
                        </div>
                        <hr>
                        <p><strong>Server Response:</strong></p>
                        <pre>${escapeHtml(response.text)}</pre>
                    `, 'error');
                }
            }).catch(error => {
                console.error('Request failed:', error);
                displayMessage(`
                    <p><strong>Request Failed (ID: ${submissionId})</strong></p>
                    <p>Error: ${error.message}</p>
                    <p>The article generation may still be in progress on the server if this was a timeout or network issue on the client side.</p>
                    <div class="submission-details">
                        <ul>
                            <li><strong>Time Submitted:</strong> ${submissionTime}</li>
                            <li><strong>Time Failed:</strong> ${new Date().toLocaleTimeString()}</li>
                            <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                            <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                            <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                        </ul>
                    </div>
                `, 'error');
            }).finally(() => {
                // This block executes whether the promise resolved or rejected
                loadingIndicator.style.display = 'none';
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                isSubmitting = false;
            });

        } catch (error) {
            // Handle setup errors for XHR (should be rare)
            console.error('Error setting up the request:', error);
            displayMessage(`
                <p><strong>Client-Side Error (ID: ${submissionId}):</strong> ${error.message}</p>
                <p>Could not send the request to the server. Please check your connection or contact support.</p>
                <div class="submission-details">
                    <ul>
                        <li><strong>Time:</strong> ${submissionTime}</li>
                        <li><strong>Keyword:</strong> ${escapeHtml(formData.keyword)}</li>
                        <li><strong>Title:</strong> ${escapeHtml(formData.title)}</li>
                        <li><strong>Article Type:</strong> ${escapeHtml(formData.articleType)}</li>
                    </ul>
                </div>
            `, 'error');
            
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            isSubmitting = false;
        }
    });
});
