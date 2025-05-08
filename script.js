document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // n8n webhook URL and CORS proxy configuration
    const N8N_WEBHOOK_URL = 'https://jaxic.app.n8n.cloud/webhook/feadab27-dddf-4b36-8d41-b2b06bc30d24';
    // Use an established CORS proxy service
    const CORS_PROXY_URL = 'https://corsproxy.io/?';
    
    // Only track if a submission is in progress - no time restrictions
    let isSubmitting = false;
    
    // Enable logging for debugging
    console.log("Content form script loaded successfully");
    
    // Format information for each article type
    const formatInfo = {
        // Format info content remains the same...
        // [Code omitted for brevity]
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
    
    // Rest of code functions remain the same...
    // [Code omitted for brevity]
    
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
            // Use the CORS proxy to make the request
            const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(N8N_WEBHOOK_URL)}`;
            console.log('Sending data via CORS proxy:', proxyUrl);
            console.log('Form data being sent:', formData);
            
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
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
                <strong>Error:</strong> ${error.message} 
                <br><br>
                There was a problem communicating with the webhook via the CORS proxy. 
                <br><br>
                If you continue to experience issues, try a different CORS proxy service or configure your n8n instance to allow cross-origin requests.
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
