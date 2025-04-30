// --- Helper function to escape HTML characters (TEMPORARILY SIMPLIFIED FOR DEBUGGING) ---
// Remember to restore the proper escapeHtml function if the syntax error is resolved
// and you need to safely display HTML returned by the webhook.
function escapeHtml(unsafe) {
    console.log("DEBUG: escapeHtml (simple) called with:", unsafe);
    return String(unsafe); // Just convert to string and return
}

 // --- Helper Function to Display Status Messages ---
 function displayMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    if (!statusMessage) {
        console.error("Status message element not found!");
        return;
    }
    statusMessage.innerHTML = message;
    statusMessage.className = `${type}-message`; // Applies 'success-message' or 'error-message' class from style.css
    statusMessage.style.display = 'block';
}


// --- Wait for the DOM to be fully loaded ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const WEBHOOK_URL = 'https://polished-polite-blowfish.ngrok-free.app/webhook/feadab27-dddf-4b36-8d41-b2b06bc30d24';
    // Authentication configuration removed

    // --- DOM Elements ---
    // Authentication elements removed
    const contentForm = document.getElementById('content-form');
    const keywordInput = document.getElementById('keyword');
    const titleInput = document.getElementById('title');
    const productUrlInput = document.getElementById('productUrl');
    const articleTypeSelect = document.getElementById('articleType');
    const userInput = document.getElementById('user');
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    // statusMessage element is retrieved within displayMessage function

    // Ensure essential form elements exist before adding listeners
    if (!contentForm || !keywordInput || !titleInput || !productUrlInput || !articleTypeSelect || !userInput || !submitButton || !loadingIndicator) {
        console.error("CRITICAL: One or more essential form DOM elements are missing! Check HTML IDs.");
        const body = document.querySelector('body');
        if (body) {
             body.innerHTML = '<p style="color: red; font-weight: bold; font-size: 1.2em; padding: 30px;">Error: Could not initialize the form correctly. Please verify element IDs in index.html and check the Developer Console (F12).</p>';
        }
        return; // Stop script execution
    }

    // --- Authentication Logic Removed ---

    // --- Form Submission Logic ---
    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = '';
            statusMessage.style.display = 'none';
            statusMessage.className = '';
        }
        loadingIndicator.style.display = 'none';

        // --- Validation ---
        const keyword = keywordInput.value.trim();
        const title = titleInput.value.trim();
        const productUrl = productUrlInput.value.trim();
        const articleType = articleTypeSelect.value;
        const user = userInput.value.trim();

        let isValid = true;
        let errors = [];
        let firstInvalidField = null;

        if (!keyword) {
            errors.push('Keyword is required.');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = keywordInput;
        }
        if (!title) {
            errors.push('Title is required.');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = titleInput;
        }
        if (!productUrl) {
            errors.push('Product 1 URL is required.');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = productUrlInput;
        } else {
            try {
                new URL(productUrl);
            } catch (_) {
                errors.push('Product 1 URL must be a valid URL (e.g., https://example.com).');
                isValid = false;
                 if (!firstInvalidField) firstInvalidField = productUrlInput;
            }
        }
        if (!articleType) {
            errors.push('Article Type must be selected.');
            isValid = false;
             if (!firstInvalidField) firstInvalidField = articleTypeSelect;
        }
        if (!user) {
            errors.push('User is required.');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = userInput;
        }

        if (!isValid) {
            displayMessage(errors.join('<br>'), 'error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        // --- Prepare Data ---
        const formData = {
            keyword: keyword,
            title: title,
            productUrl: productUrl,
            articleType: articleType,
            user: user
        };

        // --- Show Loading & Disable Button ---
        loadingIndicator.style.display = 'flex';
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // --- Send to Webhook ---
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

            if (response.ok) { // Status 200-299
                if (responseBody.trim().toUpperCase().startsWith('FAILURE')) {
                    // HTTP status OK, but body indicates FAILURE
                    console.warn(`Webhook returned HTTP ${response.status} but body indicates FAILURE.`);
                    // --- MODIFIED --- Display only the webhook response in error style
                    displayMessage(
                        `<pre>${escapeHtml(responseBody)}</pre>`,
                        'error'
                    );
                     // Optional: Keep form data for correction
                    // contentForm.reset();
                    // keywordInput.focus();
                } else {
                    // HTTP status OK and body does NOT indicate failure - TRUE SUCCESS
                    displayMessage(
                        `Form submitted successfully! (Status: ${response.status})<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                        'success'
                    );
                    contentForm.reset();
                    keywordInput.focus();
                }
            } else {
                // HTTP error status (4xx, 5xx)
                console.error('Webhook HTTP error:', response.status, response.statusText, responseBody);
                 // Keep showing the HTTP status and error details here
                 displayMessage(
                    `Submission failed (HTTP Error): ${response.status} ${response.statusText}.<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                    'error'
                );
            }
        } catch (error) {
            // Network error
            console.error('Network or fetch error:', error);
            displayMessage(`An network error occurred: ${error.message}. <br> Check the console, your network connection, and ensure the webhook URL is correct and running.`, 'error');
        } finally {
            // Hide loading indicator and re-enable button
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });

    // Set focus to the first form field initially
    keywordInput.focus();

}); // End of DOMContentLoaded listener