// Default admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'password123',
};

// DOM Elements
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const medicineForm = document.getElementById('medicine-form');
const medicineList = document.getElementById('medicine-list');
const averagePriceElement = document.getElementById('average-price');
const formMessage = document.getElementById('form-message');
const loginError = document.getElementById('login-error');

// Handle Admin Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Hide login section and show admin section
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        loginError.textContent = ''; // Clear any error messages
    } else {
        loginError.textContent = 'Invalid username or password.';
    }
});

// Handle Logout
logoutButton.addEventListener('click', () => {
    // Hide admin section and show login section
    adminSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset(); // Clear login form inputs
});

// Fetch medicines from the backend and render them
async function fetchMedicines() {
    try {
        const response = await fetch('http://127.0.0.1:8000/medicines');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Medicines:", data.medicines); // Debug
        renderMedicines(data.medicines); // Render the medicines
        updateAveragePrice(data.medicines); // Update the average price
    } catch (error) {
        console.error('Error fetching medicines:', error);
        renderError('Failed to load medicines. Please try again later.');
    }
}

// Render medicines in the DOM
function renderMedicines(medicines) {
    medicineList.innerHTML = ''; // Clear previous content

    if (!medicines || medicines.length === 0) {
        medicineList.textContent = 'No medicines found.';
        return;
    }

    medicines.forEach((medicine) => {
        const name = medicine.name || 'Unknown Medicine';
        const price = medicine.price != null ? `£${medicine.price.toFixed(2)}` : 'Price unavailable';

        const item = document.createElement('div');
        item.classList.add('medicine-item');
        item.innerHTML = `
            <span>${name}</span>
            <span>${price}</span>
        `;
        medicineList.appendChild(item);
    });
}

// Update average price
function updateAveragePrice(medicines) {
    if (!medicines || medicines.length === 0) {
        averagePriceElement.textContent = '0.00'; // Default value for empty list
        return;
    }

    // Filter out invalid or null prices
    const validMedicines = medicines.filter(
        (medicine) => typeof medicine.price === 'number' && medicine.price > 0
    );

    // Debugging logs
    console.log("Valid Medicines for Average:", validMedicines);

    // Calculate the average price..............................................
    const total = validMedicines.reduce((sum, medicine) => sum + medicine.price, 0);
    const average = (total / validMedicines.length).toFixed(2);

    console.log("Calculated Average Price:", average); // Debug
    averagePriceElement.textContent = average; // Update the DOM
}

// Handle errors
function renderError(message) {
    medicineList.innerHTML = '';
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    medicineList.appendChild(errorMessage);
}

// Handle form submission to add a new medicine
medicineForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get form data
    const name = document.getElementById('medicine-name').value.trim();
    const price = parseFloat(document.getElementById('medicine-price').value);

    // Validate form inputs
    if (!name || isNaN(price) || price <= 0) {
        showMessage('Error: Invalid input. Please check the fields and try again.', 'error');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('price', price);

    try {
        // Send data to the backend
        const response = await fetch('http://127.0.0.1:8000/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            showMessage(`Success: ${result.message}`, 'success');
            medicineForm.reset(); // Clears the form fields
            fetchMedicines(); // Refresh the list of medicines
        } else {
            const error = await response.json();
            showMessage(`Error: ${error.detail || 'Failed to add medicine.'}`, 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('Error: Unable to connect to the server.', 'error');
    }
});

// Display success or error messages
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = type; // Apply success or error styling
}

// Fetch medicines when the page loads
fetchMedicines();
