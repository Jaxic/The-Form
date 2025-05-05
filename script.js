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
    
    // Form submission logic
    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Prevent duplicate submissions (debounce)
        if (isSubmitting) {
            console.log("Form submission already in progress, ignoring this click");
            return;
        }
        
        // Set the flag immediately
        isSubmitting = true;
        
        // Clear previous messages
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = '';
            statusMessage.style.display = 'none';
            statusMessage.className = '';
        }
        
        // Basic validation (your existing validation code here)
        // ...
        
        // Prepare data
        const formData = {
            keyword: keywordInput.value.trim(),
            title: titleInput.value.trim(),
            productUrl: productUrlInput.value.trim(),
            articleType: articleTypeSelect.value,
            user: userInput.value.trim()
        };
        
        // Show "Processing" message and disable submit button
        displayMessage("Processing, please wait", 'success');
        loadingIndicator.style.display = 'flex';
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        // Send to webhook
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            let responseBody = '';
            try {
                responseBody = await response.text();
            } catch (bodyError) {
                console.warn("Could not read response body:", bodyError);
                responseBody = "[Could not read response body]";
            }
            
            // Handle the response
            if (response.ok) {
                if (responseBody.trim().toUpperCase().startsWith('FAILURE')) {
                    displayMessage(
                        `<pre>${escapeHtml(responseBody)}</pre>`,
                        'error'
                    );
                } else {
                    displayMessage(
                        `Form submitted successfully! (Status: ${response.status})<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                        'success'
                    );
                    contentForm.reset();
                    keywordInput.focus();
                }
            } else {
                displayMessage(
                    `Submission failed (HTTP Error): ${response.status} ${response.statusText}.<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                    'error'
                );
            }
        } catch (error) {
            console.error('Network or fetch error:', error);
            displayMessage(
                `A network error occurred: ${error.message}.<br>Your request might still be processing despite this error.`,
                'error'
            );
        } finally {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            // Re-enable the form
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
            isSubmitting = false;
        }
    });

    // Focus the first field
    keywordInput.focus();
});
