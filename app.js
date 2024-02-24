let frontLabelGenerated = false; // Flag to track front label generation
let backLabelGenerated = false; // Flag to track back label generation

// allows to toast messages 
function snackbar(message) {
    var x = document.getElementById("snackbar");
    x.textContent = message;
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

function saveCanvasAsImage(canvas, fileName) {
    return Promise.resolve().then(() => {
        const dataURL = canvas.toDataURL('image/jpeg');
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
    });
}

// Pick image
function selectImage() {
    document.getElementById('fileInput').click();
}

// Display image
function displaySelectedImage(event) {
    const selectedFile = event.target.files[0];
    const imageElement = document.querySelector('.Pick_Image');
    if (selectedFile && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imageElement.src = e.target.result;
            imageElement.style.width = '45px'; // Set a fixed width (change as needed)
            imageElement.style.height = '45px'; // Set a fixed height (change as needed)
            imageElement.style.objectFit = 'cover'; // Maintain aspect ratio and cover the container
        };
        reader.readAsDataURL(selectedFile);
    } else {
        snackbar('Please select an image file.');
    }
}

function addTextAndOverlayToFrontImage(name, empCode, overlaySrc, designation, contact) {
    console.log("Generating front Image");
    const overlayY = 240;
    const overlayWidth = 280;
    const overlayHeight = 320;
    const frontImg = new Image();
    frontImg.crossOrigin = "Anonymous";
    return new Promise((resolve, reject) => {
        frontImg.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = frontImg.width;
            canvas.height = frontImg.height;
            ctx.drawImage(frontImg, 0, 0);
            const overlayImg = new Image();
            overlayImg.crossOrigin = "Anonymous";
            overlayImg.onload = () => {
                const aspectRatio = overlayImg.width / overlayImg.height;
                let overlayWidthActual = overlayWidth;
                let overlayHeightActual = overlayWidthActual / aspectRatio;
                if (overlayHeightActual > overlayHeight) {
                    overlayHeightActual = overlayHeight;
                    overlayWidthActual = overlayHeightActual * aspectRatio;
                }
                const overlayX = (canvas.width - overlayWidthActual) / 2;
                const overlayYActual = overlayY + (overlayHeight - overlayHeightActual) / 2;
                ctx.drawImage(overlayImg, overlayX, overlayYActual, overlayWidthActual, overlayHeightActual);
                // Text styles
                ctx.font = '42px "Roboto", sans-serif';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center'; // Center align the text
                // Draw name
                ctx.fillText(name, canvas.width / 2, 660);
                // Designation
                ctx.font = '32px "Roboto", sans-serif';
                ctx.fillText(designation, canvas.width / 2, 720);
                // Employee ID
                ctx.font = '26px "Roboto", sans-serif';
                ctx.fillText(`ID No : ${empCode}`,canvas.width / 2, 790);
                // Phone number
                ctx.font = '26px "Roboto", sans-serif';
                ctx.fillText(`Mobile : ${contact}`,canvas.width / 2, 820);
                
                const FrontFileName = `${empCode}_Front_ID.jpg`;
                saveCanvasAsImage(canvas, FrontFileName)
                    .then(() => {
                        frontLabelGenerated = true;
                        console.log("Front label generated successfully");
                        resolve();
                    })
                    .catch(error => {
                        console.error("Error saving front canvas:", error);
                        reject(error);
                    });
            };
            overlayImg.src = overlaySrc;
        };
        frontImg.src = 'Templates/Front.jpg';
    });
}


function validateFields() {
    const nameInput = document.getElementById('name').value.trim();
    const desginationInput = document.getElementById('desgination').value.trim();
    const empCodeInput = document.getElementById('emp_code').value.trim();
    const selectedImage = document.getElementById('fileInput').files[0]; // Get selected image file

    // Define error messages
    const errorMessages = {
        name: 'Please Enter Name & Spaces',
        desgination:'Please enter desgination',
        empCode: 'Please Enter EMP CODE',
        image: 'Please Select An Image',
        allFieldsEmpty: 'All fields are Empty. Please Fill In The Details.'
    };

    // Check for errors
    const errors = [];
    if (nameInput === '') errors.push(errorMessages.name);
    if (desginationInput === '') errors.push(errorMessages.desgination);
    if (!selectedImage) errors.push(errorMessages.image); // Validate if an image is selected
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

// Function to clear all form fields and display "Cleared" message
function clearFields() {
    document.getElementById('name').value = ''; // Clear name field
    document.getElementById('emp_code').value = ''; // Clear EMP code field
     document.getElementById('desgination').value = ''; // Clear desgination code field
    document.getElementById('contact').value = ''; // Clear contact field
    document.querySelector('.Pick_Image').src = '/icons/square-fill.svg'; // Reset image source to default
    // Display "Cleared" snackbar message
    frontLabelGenerated = false;
    backLabelGenerated = false;
    window.location.reload();
}

// Get ImageDimensions
function getImageDimensions(selectedImage) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = document.createElement('img');
            imgElement.onload = function () {
                const dimensions = { width: imgElement.width, height: imgElement.height };
                resolve(dimensions);
            };
            imgElement.src = e.target.result;
        };
        reader.readAsDataURL(selectedImage);
    });
}

// Get references to the input fields
const empCodeInput = document.getElementById('emp_code');
const emergencyContactInput = document.getElementById('contact');

// Allow only numbers for Emergency Contact input and limit to 10 characters
emergencyContactInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10); // Allow only numbers and limit to 10 characters
});

// Allow only alphabetic characters in the input field and limit to 120 charcters 
var inputField = document.getElementById("name");
// Regex pattern to match only alphabetic characters and space
var pattern = /^[A-Za-z\s]+$/;
inputField.addEventListener("input", function (event) {
    var inputValue = event.data || inputField.value;
    if (!pattern.test(inputValue)) {
        inputField.value = inputField.value.replace(/[^A-Za-z\s]/g, '');
    }
});

document.getElementById('Back').addEventListener('click', async function () {
    // Validate fields before generating the preview
    const isValid = validateFields();
    if (isValid) {
        try {
            const templatePath = 'Templates/Back.jpg'; // Set the path to your template image
            const downloadLink = document.createElement('a');
            downloadLink.href = templatePath;
            downloadLink.download = 'back.jpg'; // Set the filename for download
            downloadLink.style.display = 'none'; // Hide the link
            document.body.appendChild(downloadLink); // Append the link to the document body
            downloadLink.click(); // Simulate a click on the link to trigger download
            document.body.removeChild(downloadLink); // Remove the link from the document body after download
        } catch (error) {
            console.error("Error obtaining image dimensions:", error);
            snackbar("Error obtaining image dimensions");
            // Handle errors while obtaining image dimensions
        }
    }
});

document.getElementById('Front').addEventListener('click', async function () {
    // Validate fields before generating the preview
    const isValid = validateFields();
    if (isValid) {
        // Assuming you have references to the form fields and the selected image
        const name = document.getElementById('name').value.trim();
        const desgination = document.getElementById('desgination').value.trim();
        const empCode = document.getElementById('emp_code').value.trim();
        const contact = document.getElementById('contact').value.trim();
        const selectedImage = document.getElementById('fileInput').files[0];
        const imagePath = URL.createObjectURL(selectedImage); // Get the image path
        try {
            addTextAndOverlayToFrontImage(name, empCode, imagePath, desgination, contact);
        } catch (error) {
            console.error("Error obtaining image dimensions:", error);
            snackbar("Error obtaining image dimensions");
            // Handle errors while obtaining image dimensions
        }
    }
});

// Event listener for the reset button click
document.getElementById('resetButton').addEventListener('click', function () {
    clearFields(); // Call the function to clear fields and display message
});



