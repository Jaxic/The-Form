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
    const statusMessage = document.getElementById('status-message');

    contentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        isSubmitting = true;
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
                responseBody = '';
            }

            if (response.ok) {
                displayMessage(escapeHtml(responseBody), 'success');
                contentForm.reset();
                keywordInput.focus();
            } else {
                displayMessage(escapeHtml(responseBody || 'An error occurred.'), 'error');
            }
        } catch (error) {
            displayMessage('Network error. Please try again later.', 'error');
        } finally {
            isSubmitting = false;
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });

    function displayMessage(message, type) {
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
