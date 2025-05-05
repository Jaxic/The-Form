document.addEventListener('DOMContentLoaded', () => {
    const WEBHOOK_URL = 'https://polished-polite-blowfish.ngrok-free.app/webhook/feadab27-dddf-4b36-8d41-b2b06bc30d24';
    let isSubmitting = false;

    const contentForm = document.getElementById('content-form');
    const keywordInput = document.getElementById('keyword');
    const titleInput = document.getElementById('title');
    const productUrlInput = document.getElementById('productUrl');
    const articleTypeSelect = document.getElementById('articleType');
    const userInput = document.getElementById('user');
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading-indicator');

    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            displayMessage("A submission is already in progress. Please wait for it to complete.", 'error');
            return;
        }

        isSubmitting = true;

        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = '';
        statusMessage.style.display = 'none';
        statusMessage.className = '';

        const formData = {
            keyword: keywordInput.value.trim(),
            title: titleInput.value.trim(),
            productUrl: productUrlInput.value.trim(),
            articleType: articleTypeSelect.value,
            user: userInput.value.trim(),
        };

        loadingIndicator.style.display = 'flex';
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        let responseBody = '';

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            try {
                responseBody = await response.text();
            } catch (bodyError) {
                console.warn("Could not read response body:", bodyError);
                responseBody = "[Could not read response body]";
            }

            if (response.ok) {
                displayMessage(
                    `✅ Form submitted successfully! (Status: ${response.status})<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                    'success'
                );
                contentForm.reset();
                keywordInput.focus();
            } else {
                displayMessage(
                    `❌ Submission failed (HTTP Error): ${response.status} ${response.statusText}.<br><br><strong>Webhook Response:</strong><pre>${escapeHtml(responseBody)}</pre>`,
                    'error'
                );
            }
        } catch (error) {
            console.error('Network or fetch error:', error);
            displayMessage(
                `❌ A network error occurred: ${error.message}.<br>Please wait before trying again.`,
                'error'
            );
        } finally {
            isSubmitting = false;
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });

    function displayMessage(message, type) {
        const statusMessage = document.getElementById('status-message');
        statusMessage.innerHTML = message;
        statusMessage.style.display = 'block';
        statusMessage.className = type;
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function (m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[m];
        });
    }
});
