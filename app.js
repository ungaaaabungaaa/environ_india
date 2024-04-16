
// fix the preivew
// make the croppie layout mobile responsive
// check all the cases and add in hardcoding for bloodgroup with hint choose



let frontLabelGenerated = false; // Flag to track front label generation
let backLabelGenerated = false; // Flag to track back label generation
let croppedImageBlob; // Variable to store the cropped image blob

// Function to clear all form fields and display "Cleared" message
function clearFields() {
    const fieldsToClear = ['name', 'title', 'bloodGroup', 'emp_code', 'desgination', 'contact'];
    fieldsToClear.forEach(field => {
        document.getElementById(field).value = ''; // Clear field
    });
    document.querySelector('.Pick_Image').src = ''; // Reset image source to default
    frontLabelGenerated = false;
    backLabelGenerated = false;
    snackbar("Cleared"); // Display "Cleared" snackbar message
}

// Function to handle error messages
function handleError(error, message) {
    console.error(error);
    snackbar(message);
}

// Get references to the input fields
const empCodeInput = document.getElementById('emp_code');
const emergencyContactInput = document.getElementById('contact');

// Allow only numbers for Emergency Contact input and limit to 10 characters
emergencyContactInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10); // Allow only numbers and limit to 10 characters
});

// Allow only alphabetic characters in the input field and limit to 120 characters 
const nameInputField = document.getElementById("name");
// Regex pattern to match only alphabetic characters and space
const namePattern = /^[A-Za-z\s]+$/;
nameInputField.addEventListener("input", function (event) {
    const inputValue = event.data || nameInputField.value;
    if (!namePattern.test(inputValue)) {
        nameInputField.value = nameInputField.value.replace(/[^A-Za-z\s]/g, '');
    }
});

// Add event listener to the span element
document.getElementById('upload_button').addEventListener('click', function () {
    // Trigger click on the hidden file input element
    document.getElementById('upload_input').click();
});

// Function to handle image upload
document.getElementById('upload_input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            cropper.bind({
                url: e.target.result
            });
        };
        reader.readAsDataURL(file);
    }
});

// Function to handle save button click
document.getElementById('save').addEventListener('click', function () {
    cropper.result('blob').then(function(croppedBlob) {
        croppedImageBlob = croppedBlob; // Store the cropped image blob
        console.log("Cropped Image Blob:", croppedImageBlob); // Log the cropped image blob
        const imageElement = document.querySelector('.placeholder-image'); // Select the image element
        imageElement.src = URL.createObjectURL(croppedImageBlob); // Display the cropped image
        imageElement.style.width = '150px'; // Set a fixed width (change as needed)
        imageElement.style.height = '150px'; // Set a fixed height (change as needed)
        imageElement.style.objectFit = 'cover'; // Maintain aspect ratio and cover the container
        toggleLayout(); 
    }).catch(error => {
        handleError(error, "Error cropping image.");
    });
});

// Function to handle reset button click
document.getElementById('reset').addEventListener('click', function () {
    cropper.bind({
        url: '/Resources/placeholder.webp'
    });
});

// Function to handle Front button click
document.getElementById('Front').addEventListener('click', async function () {
    // Validate fields before generating the preview
    const isValid = validateFields();
    if (isValid) {
        // Check if the cropped image blob is valid
        if (croppedImageBlob instanceof Blob && croppedImageBlob.size > 0) {
            // Assuming you have references to the form fields
            const name = document.getElementById('name').value.trim();
            const bloodGroup = document.getElementById('BloodGroup').value.trim();
            const title = document.getElementById('title').value.trim();
            const designation = document.getElementById('desgination').value.trim();
            const empCode = document.getElementById('emp_code').value.trim();
            const contact = document.getElementById('contact').value.trim();
            // Call the function to add text and overlay to the front image
            addTextAndOverlayToFrontImage(name, title, empCode, croppedImageBlob, designation, contact, bloodGroup);
        } else {
            // If it's not a valid blob, show an error message
            snackbar('Error: Cropped image is not valid.');
        }
    }
});

// Function to validate input fields
function validateFields() {
    const nameInput = document.getElementById('name').value.trim();
    const bloodGroupInput = document.getElementById('BloodGroup').value.trim();
    const designationInput = document.getElementById('desgination').value.trim();
    const empCodeInput = document.getElementById('emp_code').value.trim();
   
    // Define error messages
    const errorMessages = {
        name: 'Please Enter Name & Spaces',
        designation: 'Please enter designation',
        empCode: 'Please Enter EMP CODE',
        image: 'Please Select An Image',
        bloodGroup: 'Please Enter Blood Group',
        allFieldsEmpty: 'All fields are Empty. Please Fill In The Details.'
    };

    // Check for errors
    const errors = [];
    if (nameInput === '') errors.push(errorMessages.name);
    if (bloodGroupInput === '') errors.push(errorMessages.bloodGroup);
    if (designationInput === '') errors.push(errorMessages.designation);
    // Check if all fields are empty
    const allFieldsEmpty = [nameInput, empCodeInput].every(field => field === '');
    if (allFieldsEmpty) {
        snackbar(errorMessages.allFieldsEmpty);
        return false;
    }
    // Display errors using snackbar
    if (errors.length > 0) {
        snackbar(errors.join(' '));
        return false;
    }
    return true;
}

// Function to toggle layout
function toggleLayout() {
    const layout = document.getElementById("cropper_layout");
    layout.style.display = layout.style.display === "none" ? "flex" : "none";
}

function saveCanvasAsImage(canvas, fileName) {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = fileName;
  let downloadCompleted = false;
  link.addEventListener('load', () => {
    if (!downloadCompleted && document.body.contains(link)) {
      downloadCompleted = true;
      document.body.removeChild(link);
    }
  });
  link.click();
  setTimeout(() => {
    if (!downloadCompleted && document.body.contains(link)) {
      downloadCompleted = true;
      document.body.removeChild(link);
    }
  }, 5000);
}

async function addTextAndOverlayToFrontImage(name, title, empCode, croppedImageBlob, designation, contact, bloodGroup) {
  console.log("Generating front Image");
  const frontImg = new Image();
  frontImg.crossOrigin = "Anonymous";
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    frontImg.onload = () => {
      // Set the canvas size to match the template image
      canvas.width = frontImg.width;
      canvas.height = frontImg.height;

      // Draw the template image on the canvas
      ctx.drawImage(frontImg, 0, 0);

      // Resize and draw the cropped image at the center
      const croppedImg = new Image();
      croppedImg.onload = () => {
        const { width, height } = resizeImage(croppedImg, 450, 450); // Adjust the size as needed
        const x = (canvas.width - width) / 2;
        const y = 250;
        ctx.drawImage(croppedImg, x, y, width, height);
        drawText(ctx, name, title, designation, empCode, contact, bloodGroup);
        saveCanvasAsImage(canvas, `${empCode}_Front_ID`)
          .then(() => {
            frontLabelGenerated = true;
            console.log("Front label generated successfully");
            resolve();
          })
          .catch(error => {
            handleError(error, "Error saving front canvas.");
            reject(error);
          });
      };

      // Convert blob to data URL and set the image source
      const reader = new FileReader();
      reader.onload = function () {
        croppedImg.src = reader.result;
      };
      reader.readAsDataURL(croppedImageBlob);
    };
    frontImg.src = 'Templates/Front.png';
  });
}
// Define resizeImage function
function resizeImage(img, width, height) {
  const aspectRatio = img.width / img.height;
  if (img.width > img.height) {
    width = Math.min(width, img.width);
    height = width / aspectRatio;
  } else {
    height = Math.min(height, img.height);
    width = height * aspectRatio;
  }
  return { width, height };
}

function drawText(ctx, name, title, designation, empCode, contact, bloodGroup) {
  const centerX = ctx.canvas.width / 2;
  let currentY = 510;

  // Name
  ctx.font = "bold 46px 'Raleway', sans-serif";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(name, centerX, currentY);
  currentY += 65;

  // Title
  ctx.font = "36px 'Raleway', sans-serif";
  ctx.fillText(title, centerX, currentY);
  currentY += 50;

  // Designation
  ctx.fillText(designation, centerX, currentY);
  currentY += 50;

  // Contact Number
  const ContactText = `Phone: ${contact}`;
  ctx.fillText(ContactText, centerX, currentY);
  currentY += 50;

  // Blood Group
  const BloodText = `BloodGroup: ${bloodGroup}`;
  ctx.fillText(BloodText, centerX, currentY);
  currentY += 175;

  // Employee Code
  ctx.font = "36px 'Raleway', sans-serif";
  ctx.fillText(empCode, centerX, currentY);
}


document.getElementById('Back').addEventListener('click', async function () {
    // Validate fields before generating the preview
    const isValid = validateFields();
    if (isValid) {
        try {
            const templatePath = 'Templates/Back.png'; // Set the path to your template image
            const downloadLink = document.createElement('a');
            downloadLink.href = templatePath;
            downloadLink.download = 'back'; // Set the filename for download
            downloadLink.style.display = 'none'; // Hide the link
            document.body.appendChild(downloadLink); // Append the link to the document body
            downloadLink.click(); // Simulate a click on the link to trigger download
            document.body.removeChild(downloadLink); // Remove the link from the document body after download
        } catch (error) {
            handleError(error, "Error obtaining image dimensions.");
        }
    }
});





// Function to display toast messages
function snackbar(message) {
    const x = document.getElementById("snackbar");
    x.textContent = message;
    x.className = "show";
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
}

// Function to initialize Croppie
function initializeCroppie() {
    const cropperElement = document.getElementById('cropper');
    let viewportWidth, viewportHeight, boundaryWidth, boundaryHeight;

    // Determine viewport and boundary sizes based on screen size
    if (window.innerWidth <= 992) { // Adjust based on your desired breakpoint
        viewportWidth = 150; // Adjust viewport width for mobile
        viewportHeight = 150; // Adjust viewport height for mobile
        boundaryWidth = 200; // Adjust boundary width for mobile
        boundaryHeight = 200; // Adjust boundary height for mobile
    } else {
        viewportWidth = 200; // Default viewport width
        viewportHeight = 200; // Default viewport height
        boundaryWidth = 300; // Default boundary width
        boundaryHeight = 300; // Default boundary height
    }

    // Initialize Croppie with dynamic viewport and boundary sizes
    cropper = new Croppie(cropperElement, {
        viewport: { width: viewportWidth, height: viewportHeight, type: 'circle' },
        boundary: { width: boundaryWidth, height: boundaryHeight },
        enableZoom: true,
        mouseWheelZoom: false
    });

    // Call the loadInitialImage function to load initial image into Croppie
    loadInitialImage();
}

// Function to load initial image into Croppie
function loadInitialImage() {
    const initialImageUrl = '/Resources/placeholder.webp'; // Replace 'path_to_your_initial_image' with the URL or path to your initial image
    cropper.bind({
        url: initialImageUrl
    });
}

// Call the initializeCroppie function when the page loads
window.onload = initializeCroppie;
