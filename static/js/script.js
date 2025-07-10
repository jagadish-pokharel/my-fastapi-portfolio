// script.js

// Base URL for your FastAPI backend
const API_BASE_URL = 'http://127.0.0.1:8000';

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
            const errorData = await response.json();
            console.error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
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
        const responseData = await response.json();
        if (!response.ok) {
            console.error(`API Error: ${response.status}: ${JSON.stringify(responseData)}`);
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
    // This line fetches data from your FastAPI API
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

        const socialsContainer = document.getElementById('profileSocials');
        socialsContainer.innerHTML = ''; // Clear placeholders
        profileData.socials.forEach(social => {
            const link = document.createElement('a');
            link.href = social.url;
            link.target = "_blank"; // Open in new tab
            link.rel = "noopener noreferrer";
            link.className = "text-indigo-600 hover:text-indigo-800 transition-colors text-3xl";
            link.setAttribute('aria-label', social.platform);

            let svgPath = '';
            if (social.icon === 'linkedin') {
                // CORRECT LINKEDIN SVG PATH - DO NOT ALTER
                svgPath = '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM4 9H0v12h4V9zM2 6a2 2 0 110-4 2 2 0 010 4z" /></svg>';
            } else if (social.icon === 'github') {
                // CORRECT GITHUB SVG PATH - DO NOT ALTER
                svgPath = '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.799 8.205 11.385.6.11.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.758-1.333-1.758-1.087-.745.083-.729.083-.729 1.205.085 1.838 1.838 1.238 1.838 1.238 1.07 1.834 2.807 1.304 3.49.997.108-.775.419-1.304.762-1.604-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.465-2.382 1.235-3.22-.12-.304-.535-1.52.117-3.176 0 0 1-.322 3.295 1.23.96-.267 1.98-.401 3-.407 1.02.006 2.04.14 3 .407 2.295-1.552 3.295-1.23 3.295-1.23.652 1.656.237 2.872.117 3.176.77.838 1.235 1.91 1.235 3.22 0 4.61-2.805 5.624-5.475 5.92.43.37.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .32.21.693.825.575C20.565 21.187 24 16.702 24 12c0-6.627-5.373-12-12-12z" clip-rule="evenodd" /></svg>';
            }
            link.innerHTML = svgPath;
            socialsContainer.appendChild(link);
        });
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

    // Fetching from /items/ endpoint (using it as a generic data source for this demo)
    const projects = await fetchApiData(`${API_BASE_URL}/items/?skip=0&limit=6`);

    if (projects && projects.length > 0) {
        projectsContainer.innerHTML = ''; // Clear loading message
        projects.forEach((project, index) => {
            // Check if technologies exist and create badges
            const techBadges = (project.technologies || [])
                .map(tech => `<span class="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">${tech}</span>`)
                .join('');

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

    // --- IMPORTANT CHANGE HERE ---
    // UNCOMMENT the line below to fetch data from your FastAPI API
    const skillsData = await fetchApiData(`${API_BASE_URL}/api/skills`);

    // COMMENT OUT or DELETE the hardcoded skillsData array below
    // const skillsData = [
    //     "Python", "FastAPI", "Django", "JavaScript", "HTML", "CSS", "Tailwind CSS",
    //     "SQL", "PostgreSQL", "MongoDB", "Docker", "Git", "REST APIs", "Data Science",
    //     "Machine Learning", "Cloud Computing (GCP/AWS)"
    // ];

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

    // Send this to your /create-item/ endpoint, or a dedicated /api/contact endpoint if you create one.
    const response = await postApiData(`${API_BASE_URL}/create-item/`, {
        name: name,
        price: 0.0, // Dummy price for the Item model
        description: `Email: ${email}, Message: ${message}`
    });

    if (response) {
        contactMessageDiv.textContent = 'Message sent successfully! Thank you.';
        contactMessageDiv.className = 'mt-4 text-center text-lg font-semibold text-green-600';
        document.getElementById('contactForm').reset(); // Clear form
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

    // Attach event listener to the contact form
    document.getElementById('contactForm').addEventListener('submit', handleContactFormSubmit);
});
