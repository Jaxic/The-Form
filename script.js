// Add this flag at the top of your DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const WEBHOOK_URL = 'https://polished-polite-blowfish.ngrok-free.app/webhook/feadab27-dddf-4b36-8d41-b2b06bc30d24';
    
    // Add this debounce flag
    let isSubmitting = false;
    
    // --- DOM Elements ---
    const contentForm = document.getElementById('content-form');
    const keywordInput = document.getElementById('keyword');
    const titleInput = document.getElementById('title');
    const productUrlInput = document.getElementById('productUrl');
    const articleTypeSelect = document.getElementById('articleType');
    const userInput = document.getElementById('user');
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Form submission logic with debounce protection
    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Prevent duplicate submissions
        if (isSubmitting) {
            console.log("Form submission already in progress, ignoring this click");
            displayMessage("A submission is already in progress. Please wait for it to complete (approximately 5 minutes).", 'error');
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
        
        // Validation code (same as your original)
        // ...

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
                // Set a longer timeout to accommodate your workflow
                // Note: This is not standard fetch() but shows intent
            });

            try {
                responseBody = await response.text();
            } catch (bodyError) {
                console.warn("Could not read response body:", bodyError);
                responseBody = "[Could not read response body]";
            }

            if (response.ok) {
                // Success handling
                displayMessage(
                    `Form submitted successfully! (Status: ${response.status})<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                    'success'
                );
                contentForm.reset();
                keywordInput.focus();
            } else {
                // Error handling
                displayMessage(
                    `Submission failed (HTTP Error): ${response.status} ${response.statusText}.<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                    'error'
                );
            }
        } catch (error) {
            // Network error handling
            console.error('Network or fetch error:', error);
            displayMessage(`A network error occurred: ${error.message}. <br> Your submission may still be processing. Please wait before submitting again.`, 'error');
        } finally
