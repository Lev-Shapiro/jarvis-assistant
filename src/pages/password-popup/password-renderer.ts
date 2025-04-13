// Get the form and input elements
const passwordPopupContainer = document.getElementById("password-popup-container") as HTMLDivElement;
const passwordForm = document.getElementById("password-form") as HTMLFormElement;
const passwordInput = document.getElementById("password-input") as HTMLInputElement;
const passwordSubmitButton = document.getElementById("submit-button") as HTMLButtonElement;
const passwordCancelButton = document.getElementById("cancel-button") as HTMLButtonElement;
const passwordStatusElement = document.getElementById("status-message") as HTMLDivElement;
const passwordStatusText = document.getElementById("status-text") as HTMLSpanElement;

if (passwordInput && passwordForm && passwordStatusElement && passwordSubmitButton && passwordCancelButton) {
  // Focus the input when the window is shown
  passwordInput.focus();

  // Function to handle password submission
  const submitPassword = () => {
    const password = passwordInput.value.trim();

    // Submit the password if not empty
    if (password) {
      console.log("Submitting password verification");

      // Clear the input field
      passwordInput.value = "";

      // Show the status message with a smooth transition
      passwordForm.style.opacity = "0";
      passwordForm.style.transform = "translateY(-10px)";
      
      setTimeout(() => {
        passwordForm.style.display = "none";
        passwordStatusElement.classList.remove("hidden");
        
        // Give a small delay before showing the status to ensure animation works
        setTimeout(() => {
          passwordStatusElement.style.opacity = "1";
          passwordStatusElement.style.transform = "translateY(0)";
        }, 10);
      }, 200);

      // Send the password to the main process for verification
      window.passwordAPI.verifyPassword(password);
    } else {
      // Visual feedback for empty password
      passwordInput.classList.add("empty-password");
      setTimeout(() => {
        passwordInput.classList.remove("empty-password");
      }, 500);
    }
  };

  // Function to handle cancellation
  const handleCancel = () => {
    // Send cancel message to main process
    window.passwordAPI.cancelVerification();
  };

  // Handle form submission
  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitPassword();
  });
  
  // Handle submit button click
  passwordSubmitButton.addEventListener("click", (event) => {
    event.preventDefault();
    submitPassword();
  });

  // Handle cancel button click
  passwordCancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    handleCancel();
  });

  // Handle keyboard shortcuts
  passwordInput.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitPassword();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  });

  // Listen for messages from the main process
  if (window.mainWindowAPI) {
    // Handle the open-password event
    window.mainWindowAPI.onMessage("open-password", () => {
      passwordPopupContainer.style.display = "flex";
      
      // Reset the form
      passwordForm.style.display = "flex";
      passwordForm.style.opacity = "1";
      passwordForm.style.transform = "translateY(0)";
      passwordStatusElement.classList.add("hidden");
      passwordStatusElement.style.opacity = "0";
      
      // Focus the input field
      passwordInput.focus();
    });
    
    // Handle the verification status event
    window.mainWindowAPI.onMessage("verification-status", (status: string) => {
      // Update status text if provided
      if (status && status.trim() !== "") {
        passwordStatusText.textContent = status;
      }
    });
    
    // Handle the hide-password-popup event
    window.mainWindowAPI.onMessage("hide-password-popup", () => {
      passwordPopupContainer.style.display = "none";
    });

    // Handle password verification result
    window.mainWindowAPI.onMessage("verification-result", (result: boolean) => {
      if (result) {
        passwordStatusText.textContent = "Password accepted. Quitting...";
      } else {
        passwordStatusText.textContent = "Incorrect password!";
        
        // After a delay, return to the password form
        setTimeout(() => {
          passwordStatusElement.style.opacity = "0";
          passwordStatusElement.style.transform = "translateY(10px)";
          
          setTimeout(() => {
            passwordStatusElement.classList.add("hidden");
            passwordForm.style.display = "flex";
            
            setTimeout(() => {
              passwordForm.style.opacity = "1";
              passwordForm.style.transform = "translateY(0)";
              passwordInput.focus();
            }, 10);
          }, 200);
        }, 1500);
      }
    });
  }
} else {
  console.error("Required elements not found in the DOM");
} 