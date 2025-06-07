// Wait for the page to load
function initCopyButtons() {
  // Find all file containers
  const fileContainers = document.querySelectorAll('.js-gist-file-update-container');
  
  fileContainers.forEach(container => {
    const fileActions = container.querySelector('.file-actions');
    const rawButton = container.querySelector('a[href*="/raw/"]');
    
    if (fileActions && rawButton && !container.querySelector('.gist-copy-btn')) {
      addCopyButton(fileActions, container);
    }
  });
}

function addCopyButton(fileActions, container) {
  // Create copy button with GitHub's styling
  const copyButton = document.createElement('button');
  copyButton.className = 'Button--secondary Button--small Button gist-copy-btn';
  copyButton.style.marginLeft = '8px';
  copyButton.innerHTML = `
    <span class="Button-content">
      <span class="Button-label">Copy</span>
    </span>
  `;
  
  // Add click event listener
  copyButton.addEventListener('click', () => {
    copyGistContent(container, copyButton);
  });
  
  // Insert the button after the raw button
  fileActions.appendChild(copyButton);
}

function copyGistContent(container, button) {
  try {
    // Get all code lines from the container
    const codeLines = container.querySelectorAll('.blob-code-inner');
    
    if (codeLines.length === 0) {
      showFeedback(button, 'No code found', 'error');
      return;
    }
    
    // Extract text content from each line
    let codeText = '';
    codeLines.forEach(line => {
      codeText += line.textContent + '\n';
    });
    
    // Remove the last newline
    codeText = codeText.slice(0, -1);
    
    // Copy to clipboard using the modern API
    navigator.clipboard.writeText(codeText).then(() => {
      showFeedback(button, 'Copied!', 'success');
    }).catch(err => {
      // Fallback for older browsers
      fallbackCopy(codeText, button);
    });
    
  } catch (error) {
    console.error('Error copying gist content:', error);
    showFeedback(button, 'Error', 'error');
  }
}

function fallbackCopy(text, button) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (result) {
      showFeedback(button, 'Copied!', 'success');
    } else {
      showFeedback(button, 'Failed', 'error');
    }
  } catch (err) {
    showFeedback(button, 'Failed', 'error');
  }
}

function showFeedback(button, message, type) {
  const originalText = button.querySelector('.Button-label').textContent;
  const label = button.querySelector('.Button-label');
  
  label.textContent = message;
  
  if (type === 'success') {
    button.style.backgroundColor = '#1f883d';
    button.style.borderColor = '#1f883d';
    button.style.color = 'white';
  } else {
    button.style.backgroundColor = '#da3633';
    button.style.borderColor = '#da3633';
    button.style.color = 'white';
  }
  
  setTimeout(() => {
    label.textContent = originalText;
    button.style.backgroundColor = '';
    button.style.borderColor = '';
    button.style.color = '';
  }, 2000);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCopyButtons);
} else {
  initCopyButtons();
}

// Also watch for dynamic content changes (for AJAX navigation)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      // Check if new file containers were added
      const hasNewFiles = Array.from(mutation.addedNodes).some(node => 
        node.nodeType === 1 && 
        (node.classList?.contains('js-gist-file-update-container') || 
         node.querySelector?.('.js-gist-file-update-container'))
      );
      
      if (hasNewFiles) {
        setTimeout(initCopyButtons, 100);
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});