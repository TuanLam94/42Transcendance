import { authFetchJson, handleError } from "../api.js";
import { show, hide } from "../utils.js";
import { navigate } from "../router.js";

export const profileActions = [
  {
    selector: '[data-action="toggle-edit"]',
    handler: toggleEdit,
  },
  {
    selector: '[data-action="disable-2fa"]',
    handler: disable2fa,
  },
  {
    selector: '[data-i18n="editAvatar"]',
    handler: updateAvatar,
  }
];

export function initProfile() {
  setTimeout(function () {
    loadUserProfile();
  }, 150);
}

function display2fa(user) {
  if (!user.is_two_factor_mail && !user.is_two_factor_auth) {
    show(document.getElementById("display-enable-2fa"));
    hide(document.getElementById("display-disable-2fa"));
    return;
  }
  hide(document.getElementById("display-enable-2fa"));
  show(document.getElementById("display-disable-2fa"));
  if (user.is_two_factor_mail) show(document.getElementById("span-2fa-mail"));
  else show(document.getElementById("span-2fa-app"));
}

export async function loadUserProfile() {
  const usernameElem = document.getElementById("display-username");
  const emailElem = document.getElementById("display-email");

  for (const el of document.getElementsByClassName("edit-btn")) el.disabled = true;
  try {
    const user = await authFetchJson("api/profile/", { method: "GET" });
    usernameElem.textContent = user.username;
    emailElem.textContent = user.email;
    if (user.avatar_url)
      document.getElementById("profile-avatar").src = user.avatar_url;
    display2fa(user);
    for (const el of document.getElementsByClassName("edit-btn")) el.disabled = false;
  } catch (error) {
    handleError(error, "Load user profile error");
  }
}

async function switchToEditMode(button, valueDisplay, input, confirmInput) {
  if (valueDisplay) {
    input.value = valueDisplay.textContent;
    hide(valueDisplay);
  }
  show(input.parentElement); //todo @leontinepaq a checker si pas plutot par le parent 
  if (confirmInput) show(confirmInput);
  button.textContent = button.dataset.saveText;
  button.dataset.mode = "save"
}

async function switchToDisplayMode(
  button,
  valueDisplay,
  input,
  confirmInput,
  field
) {
  if (field == "password") {
    input.value = "";
    confirmInput.value = "";
    return;
  }
  if (valueDisplay) {
    valueDisplay.textContent = input.value;
    show(valueDisplay);
  }
  hide(input.parentElement);
  if (confirmInput) hide (confirmInput);
  button.textContent = button.dataset.editText;
  button.dataset.mode = "edit";
}

const PROFILE_FIELDS = {
  username: { endpoint: "api/profile/update/username/", key: "new_username" },
  email: { endpoint: "api/profile/update/email/", key: "new_email" },
  password: {
    endpoint: "api/profile/update/password/",
    key: "new_password",
    confirmKey: "confirm_password",
  },
};

async function updateProfileField(field, input, confirmInput) {
  const value = input.value;
  const confirmValue = confirmInput ? confirmInput.value : null;
  const fieldConfig = PROFILE_FIELDS[field];

  let body = { [fieldConfig.key]: value };
  if (fieldConfig.confirmKey) body[fieldConfig.confirmKey] = confirmValue;

  try {
    const response = await authFetchJson(fieldConfig.endpoint, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log("Update profile: " + response.details);
    return true;
  } catch (error) {
    handleError(error, "Update profile error");
    return false;
  }
}

async function toggleEdit(element, event) {
  const field = element.dataset.field;
  const valueDisplay = document.getElementById(`display-${field}`);
  const input = document.getElementById(`edit-${field}`);
  const confirmInput = document.getElementById(`confirm-${field}`) || null;
  const button = element;

  if (element.dataset.mode === "edit")
    switchToEditMode(button, valueDisplay, input, confirmInput);
  else{
    button.disabled = true;
    if (await updateProfileField(field, input, confirmInput))
      switchToDisplayMode(button, valueDisplay, input, confirmInput, field);
    button.disabled = false;
  }
}

async function disable2fa(element, event) {
  try {
    const response = await authFetchJson("/api/profile/deactivate_2fa/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    console.log("Disable 2fa successful");
    navigate("profile");
  } catch (error) {
    handleError(error, "Disable 2fa error");
  }
}

async function updateAvatar() {
  const input = document.getElementById('avatar-upload');
  
  const newInput = input.cloneNode(true);
  input.parentNode.replaceChild(newInput, input);
  
  const refreshedInput = document.getElementById('avatar-upload');
  
  refreshedInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      alert("No file selected.");
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Invalid file type. Please upload a JPG or PNG image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Max size is 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await authFetchJson("/api/profile/update/avatar/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.avatar_url) {
        document.getElementById("profile-avatar").src = response.avatar_url;
        alert("Avatar updated successfully!");
      } else {
        console.log("missed");
        alert("Avatar update failed: " + response.details);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar.");
    }
  });
  
  refreshedInput.click();
}