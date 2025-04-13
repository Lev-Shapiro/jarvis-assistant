// Get the form and input elements
const popupContainer = document.getElementById("popup-container") as HTMLDivElement;
const jarvisForm = document.getElementById("jarvis-form") as HTMLFormElement;
const textInput = document.getElementById("jarvis-text-input") as HTMLInputElement;
const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
const statusElement = document.getElementById("status-message") as HTMLDivElement;
const statusText = document.getElementById("status-text") as HTMLSpanElement;

if (textInput && jarvisForm && statusElement && submitButton) {
  // Focus the input when the window is shown
  textInput.focus();

  // Function to handle query submission
  const submitQuery = () => {
    const query = textInput.value.trim();

    // Submit the query if not empty
    if (query) {
      console.log("Submitting query:", query);

      // Clear the input field
      textInput.value = "";

      // Show the status message with a smooth transition
      jarvisForm.style.opacity = "0";
      jarvisForm.style.transform = "translateY(-10px)";
      
      setTimeout(() => {
        jarvisForm.style.display = "none";
        statusElement.classList.remove("hidden");
        
        // Give a small delay before showing the status to ensure animation works
        setTimeout(() => {
          statusElement.style.opacity = "1";
          statusElement.style.transform = "translateY(0)";
        }, 10);
      }, 200);

      // Send the query to the main process
      window.textInputAPI.submitQuery(query);
    } else {
      // Visual feedback for empty query
      textInput.classList.add("empty-query");
      setTimeout(() => {
        textInput.classList.remove("empty-query");
      }, 500);
    }
  };

  // Handle form submission
  jarvisForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuery();
  });
  
  // Handle button click (for redundancy and accessibility)
  submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    submitQuery();
  });

  // Handle keyboard shortcut (Enter key)
  textInput.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitQuery();
    }
  });

  // Listen for status updates from the main process
  if (window.mainWindowAPI) {
    // Handle the open-input event
    window.mainWindowAPI.onMessage("open-input", (status: string) => {
      popupContainer.style.display = "flex";
      
      // Reset the form
      jarvisForm.style.display = "flex";
      jarvisForm.style.opacity = "1";
      jarvisForm.style.transform = "translateY(0)";
      statusElement.classList.add("hidden");
      statusElement.style.opacity = "0";
      
      // Update status text if provided
      if (status && status.trim() !== "") {
        statusText.textContent = status;
      } else {
        statusText.textContent = "Processing";
      }
      
      // Focus the input field
      textInput.focus();
    });
    
    // Handle the query-status event
    window.mainWindowAPI.onMessage("query-status", (status: string) => {
      // Update status text if provided
      if (status && status.trim() !== "") {
        statusText.textContent = status;
      }
      
      // Ensure status is visible and form is hidden
      jarvisForm.style.display = "none";
      statusElement.classList.remove("hidden");
      statusElement.style.opacity = "1";
      statusElement.style.transform = "translateY(0)";
    });
    
    window.mainWindowAPI.onMessage("hide-input-popup", () => {
      popupContainer.style.display = "none";
    });
  }
} else {
  console.error("Required elements not found in the DOM");
}