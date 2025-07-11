// script.js

// Base URL for your FastAPI backend
const API_BASE_URL = 'http://127.0.0.1:8000'; // FOR LOCAL TESTING.

// --- Helper Functions for API Calls ---

/**
 * Fetches data from a given URL and returns the JSON response.
 * Handles basic error logging.
 * @param {string} url - The API endpoint URL.
 * @returns {Promise<Object|null>} - The JSON data or null if an error occurred.
 */
async function fetchApiData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Try to parse error data if response is not OK
            const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
            console.error(`API Error: ${response.status} - ${JSON.stringify(errorData)} for URL: ${url}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network or fetch error for ${url}:`, error);
        return null;
    }
}

/**
 * Sends a POST request with JSON data to a given URL.
 * @param {string} url - The API endpoint URL.
 * @param {Object} data - The JavaScript object to send as JSON.
 * @returns {Promise<Object|null>} - The JSON response from the API or null.
 */
async function postApiData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const responseData = await response.json().catch(() => ({ message: "Failed to parse response" }));
        if (!response.ok) {
            console.error(`API Error: ${response.status}: ${JSON.stringify(responseData)} for URL: ${url}`);
            return null;
        }
        return responseData;
    } catch (error) {
        console.error(`Network or post error for ${url}:`, error);
        return null;
    }
}

// --- Functions to Populate HTML Sections ---

/**
 * Populates the About section with profile data.
 */
async function populateAboutSection() {
    const profileData = await fetchApiData(`${API_BASE_URL}/api/profile`);

    if (profileData) {
        document.getElementById('profileName').textContent = profileData.name;
        document.getElementById('profileBio').textContent = profileData.bio;
        document.getElementById('profileImage').src = profileData.imageUrl;

        const profileEmailElement = document.getElementById('profileEmail');
        if (profileEmailElement && profileData.email) {
            profileEmailElement.href = `mailto:${profileData.email}`;
            profileEmailElement.textContent = profileData.email;
        }

        // REMOVED: Dynamic social links generation as they are now static in HTML
        // The social links will now get their URLs directly from the HTML
    } else {
        console.error("Could not load profile data from API.");
        document.getElementById('profileBio').textContent = "Failed to load profile. Please check API connection and FastAPI server logs.";
    }
}

/**
 * Populates the Projects section with project data from FastAPI.
 */
async function populateProjectsSection() {
    const projectsContainer = document.getElementById('projectsContainer');
    projectsContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">Loading projects...</p>'; // Loading state

    const projects = await fetchApiData(`${API_BASE_URL}/items/?skip=0&limit=6`);

    if (projects && projects.length > 0) {
        projectsContainer.innerHTML = ''; // Clear loading message
        projects.forEach((project, index) => {
            // Check if technologies exist and create badges
            const techBadges = (project.technologies || [])
                .map(tech => `<span class="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">${tech}</span>`)
                .join('');

            // Removed VIDEO EMBEDDING LOGIC as requested

            const projectCard = `
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border border-gray-200">
                    <h3 class="text-2xl font-bold text-indigo-700 mb-3">${project.item_name || `Project ${index + 1}`}</h3>
                    <p class="text-gray-600 mb-4">${project.description || 'A fantastic project demonstrating various skills and technologies. Details coming soon!'}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${techBadges}
                    </div>
                    <a href="#" class="inline-block bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition-colors">View Details</a>
                </div>
            `;
            projectsContainer.innerHTML += projectCard;
        });
    } else {
        projectsContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No projects found or API error. Please check the backend.</p>';
    }
}

/**
 * Populates the Skills section with skill data.
 */
async function populateSkillsSection() {
    const skillsContainer = document.getElementById('skillsContainer');
    skillsContainer.innerHTML = '<span class="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold text-lg animate-pulse">Loading skills...</span>'; // Loading state

    const skillsData = await fetchApiData(`${API_BASE_URL}/api/skills`);

    if (skillsData && skillsData.length > 0) {
        skillsContainer.innerHTML = ''; // Clear loading message
        skillsData.forEach(skill => {
            const skillBadge = `
                <span class="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold text-lg shadow-sm hover:bg-indigo-200 transition-colors">
                    ${skill}
                </span>
            `;
            skillsContainer.innerHTML += skillBadge;
        });
    } else {
        skillsContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No skills found or API error.</p>';
    }
}

/**
 * Handles the contact form submission.
 */
async function handleContactFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    const contactMessageDiv = document.getElementById('contactMessage');
    contactMessageDiv.textContent = 'Sending message...';
    contactMessageDiv.className = 'mt-4 text-center text-lg font-semibold text-gray-600';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    const response = await postApiData(`${API_BASE_URL}/create-item/`, {
        name: name,
        price: 0.0,
        description: `Email: ${email}, Message: ${message}`
    });

    if (response) {
        contactMessageDiv.textContent = 'Message sent successfully! Thank you.';
        contactMessageDiv.className = 'mt-4 text-center text-lg font-semibold text-green-600';
        document.getElementById('contactForm').reset();
    } else {
        contactMessageDiv.textContent = 'Failed to send message. Please try again later.';
        contactMessageDiv.className = 'mt-4 text-center text-lg font-semibold text-red-600';
    }
}

// --- Main execution when DOM is loaded ---
document.addEventListener('DOMContentLoaded', () => {
    populateAboutSection();
    populateProjectsSection();
    populateSkillsSection();

    document.getElementById('contactForm').addEventListener('submit', handleContactFormSubmit);
});
