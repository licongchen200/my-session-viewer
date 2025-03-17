 /**
 * Screenshot Capture Library (Non-Extension) - Fully Embedded & Auto-Init
 */
class MySessionViewer {
    constructor() {
        this.dialog = null;
        this.screenshotDataURL = null;
        this.commentInput = null; // Add a property to store the comment input element

        this.options = {
            dialogTitle: 'Report an issue with the Screenshot',
            dialogWidth: '800px',
            dialogHeight: '650px', // Increased height
            screenshotMaxWidth: '100%',
            screenshotMaxHeight: '100%',
            closeButtonText: 'Close',
            submitButtonText: 'Submit',
            backgroundColor: '#f0f0f0',
            apiUrl: 'https://192.168.0.102/api/image',
            autoInitialize: true,
            jpegQuality: 0.9,
            hotkeyControl: true,
            hotkeyKey: 'h',
            escapeKeyDismiss: true,
            commentLabel: 'Comment:' // Add label for the comment input
        };

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.html2canvasScriptLoaded = false;
        this.loadHtml2Canvas();

        if (this.options.autoInitialize) {
            this.autoInit();
        }
    }

    init(options = {}) {
        this.options = { ...this.options, ...options };

        // Update escape key listener based on options
        if (this.options.escapeKeyDismiss) {
            document.addEventListener('keydown', this.handleEscapeKey);
        } else {
            document.removeEventListener('keydown', this.handleEscapeKey);
        }
    }

    startListening() {
        document.addEventListener('keydown', this.handleKeyPress);
    }

    stopListening() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress(event) {
        let correctKey = false;

        if (this.options.hotkeyControl) {
            correctKey = event.ctrlKey && event.key === this.options.hotkeyKey;
        } else {
            correctKey = event.key === this.options.hotkeyKey;
        }

        if (correctKey) {
            event.preventDefault();
            this.captureAndShow();
        }
    }

    loadHtml2Canvas() {
        if (this.html2canvasScriptLoaded) return;

        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';

        script.onload = () => {
            console.log('html2canvas loaded successfully.');
            this.html2canvasScriptLoaded = true;
        };

        script.onerror = () => {
            console.error('Failed to load html2canvas.');
            // alert('Failed to load html2canvas.  Screenshot functionality will not work.');
        };

        document.head.appendChild(script);
    }

    captureAndShow() {
        if (!this.html2canvasScriptLoaded) {
            console.error('html2canvas is still loading. Please try again in a moment.');
            return;
        }

        html2canvas(document.body).then(canvas => {
            this.screenshotDataURL = canvas.toDataURL('image/jpeg', this.options.jpegQuality);
            this.showDialog(this.screenshotDataURL);
        }).catch(error => {
            console.error('Error capturing screenshot:', error);
            // alert('Failed to capture screenshot. See console for details. html2canvas might have CORS issues.');
        });
    }

    showDialog(dataURL) {
        if (this.dialog) {
            this.closeDialog();
        }

        this.dialog = document.createElement('div');
        this.dialog.style.position = 'fixed';
        this.dialog.style.top = '50%';
        this.dialog.style.left = '50%';
        this.dialog.style.transform = 'translate(-50%, -50%)';
        this.dialog.style.width = this.options.dialogWidth;
        this.dialog.style.height = this.options.dialogHeight;
        this.dialog.style.backgroundColor = this.options.backgroundColor;
        this.dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        this.dialog.style.zIndex = '10000';
        this.dialog.style.borderRadius = '5px';
        this.dialog.style.overflow = 'auto'; // Important: change to 'auto' to allow scrolling

        const header = document.createElement('div');
        header.style.backgroundColor = '#333';
        header.style.color = 'white';
        header.style.padding = '10px';
        header.style.textAlign = 'center';
        header.style.fontSize = '1.2em';
        header.textContent = this.options.dialogTitle;
        this.dialog.appendChild(header);

        const img = document.createElement('img');
        img.src = dataURL;
        img.style.maxWidth = this.options.screenshotMaxWidth;
        img.style.maxHeight = this.options.screenshotMaxHeight;
        img.style.width = 'auto';
        img.style.display = 'block';
        img.style.margin = '10px auto';
        this.dialog.appendChild(img);

        // Create Comment Container
        const commentContainer = document.createElement('div');
        commentContainer.style.display = 'flex';                // Use flexbox for inline layout
        commentContainer.style.alignItems = 'flex-start';       // Align items to the top
        commentContainer.style.margin = '1px auto';
        commentContainer.style.width = '90%';                  // Add a width constraint
        commentContainer.style.maxWidth = '110%';              // Ensure it doesn't exceed certain width.
        commentContainer.style.margin = '2px';

        // Add Comment Label
        const commentLabel = document.createElement('label');
        commentLabel.textContent = this.options.commentLabel;
        commentLabel.style.marginRight = '5px';                 // Add some spacing between label and textarea
        commentLabel.style.flexShrink = '0';                  // Prevent label from shrinking
        commentLabel.style.width = 'auto';                      // Let the label width adjust to content
        commentContainer.appendChild(commentLabel);

        // Create textarea for comment
        this.commentInput = document.createElement('textarea'); // Changed from input to textarea
        this.commentInput.placeholder = 'Enter your comment';
        this.commentInput.style.flexGrow = '1';                // Allow textarea to take remaining space
        this.commentInput.style.minWidth = '0';                 // Allow textarea to shrink below its content size
        this.commentInput.style.height = '50px';              // Setting a fixed height for textarea
        this.commentInput.style.resize = 'both';           // Allow vertical resizing of the textarea
        commentContainer.appendChild(this.commentInput);

        this.dialog.appendChild(commentContainer);        // Append to the dialog


        // Create the button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.padding = '10px';

        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = this.options.submitButtonText;
        submitButton.style.backgroundColor = '#008CBA';
        submitButton.style.color = 'white';
        submitButton.style.padding = '10px 15px';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.margin = '0 5px';
        submitButton.addEventListener('click', () => this.submitScreenshot());
        buttonContainer.appendChild(submitButton);

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = this.options.closeButtonText;
        closeButton.style.backgroundColor = '#4CAF50';
        closeButton.style.color = 'white';
        closeButton.style.padding = '10px 15px';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.margin = '0 5px';
        closeButton.addEventListener('click', () => this.closeDialog());
        buttonContainer.appendChild(closeButton);

        this.dialog.appendChild(buttonContainer);

        document.body.appendChild(this.dialog);

        this.backdrop = document.createElement('div');
        this.backdrop.style.position = 'fixed';
        this.backdrop.style.top = '0';
        this.backdrop.style.left = '0';
        this.backdrop.style.width = '100%';
        this.backdrop.style.height = '100%';
        this.backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.backdrop.style.zIndex = '9999';
        document.body.appendChild(this.backdrop);

        // Add the escape key listener only when dialog is open, if enabled.
        if (this.options.escapeKeyDismiss) {
            document.addEventListener('keydown', this.handleEscapeKey);
        }
    }

    closeDialog() {
        if (this.dialog) {
            document.body.removeChild(this.dialog);
            this.dialog = null;
        }
        if (this.backdrop) {
            document.body.removeChild(this.backdrop);
            this.backdrop = null;
        }
    }

    /**
     * Handles the Escape key press event to dismiss the dialog.
     * @param {KeyboardEvent} event - The keyboard event object.
     */
    handleEscapeKey(event) {
        if (event.key === 'Escape' || event.key === 'Esc') { // Check for "Escape" or "Esc"
            event.preventDefault(); // Prevent default browser behavior (if any)
            this.closeDialog();
        }
    }

    generateUUID() {
        return 'axxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }    

    async submitScreenshot() {
        try {
            // Generate a UUID for the image name
            const uuid = this.generateUUID();            


            // Convert data URL to Blob
            const blob = await fetch(this.screenshotDataURL).then(res => res.blob());

            // Create FormData object
            const formData = new FormData();
            formData.append('image', blob, `${uuid}.jpg`); // 'image' is the field name, using uuid as filename

            // Get the comment from the input
            const comment = this.commentInput ? this.commentInput.value : '';
            formData.append('comment', comment);  // Append the comment to the FormData
            formData.append('uuid', uuid);  // Append the comment to the FormData
            formData.append('currentPage', window.location.href);  // Append the comment to the FormData
            formData.append('sessionId', window.sessionId);

            const response = await fetch(this.options.apiUrl, {
                method: 'POST',
                body: formData // Send the FormData object
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text(); // Expecting text response, not JSON.  Adjust if your API returns JSON.
            console.log('Screenshot submitted successfully:', data);
            // alert('Screenshot submitted successfully!');
            this.closeDialog();

        } catch (error) {
            console.error('Error submitting screenshot:', error);
            // alert(`Failed to submit screenshot: ${error.message}`);
        }
    }

    autoInit() {
        this.startListening();

        // Set initial escape key listener based on options
        if (this.options.escapeKeyDismiss) {
            document.addEventListener('keydown', this.handleEscapeKey);
        }

        window.addEventListener('beforeunload', () => {
            this.stopListening();
            document.removeEventListener('keydown', this.handleEscapeKey); // Also remove on unload
        });
    }
}

  
  // Auto-initialize the library when the script is loaded
  (function () {
    window.mySessionViewer = new MySessionViewer();
    window.mySessionViewer.init({
        hotkeyControl: true,
        hotkeyKey: 's',
        apiUrl: 'https://www.test.com/api/image'
    });    
  }());

  