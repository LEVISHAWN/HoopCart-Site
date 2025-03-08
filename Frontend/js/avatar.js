// Function to add avatar to navigation
const addAvatarToNav = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/status', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.isLoggedIn && data.user) {
            // Find the navigation list in any page (works with both nav-links and navbar-nav)
            const navList = document.querySelector('.nav-links, .navbar-nav');
            if (!navList) return;

            // Remove existing avatar if any
            const existingAvatar = document.querySelector('.avatar-item');
            if (existingAvatar) {
                existingAvatar.remove();
            }

            // Create avatar element
            const avatarItem = document.createElement('li');
            avatarItem.className = 'avatar-item';
            avatarItem.style.cssText = 'margin-left: 15px;';
            avatarItem.innerHTML = `
                <a href="/account" style="text-decoration: none; display: flex; align-items: center;">
                    <div style="
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        background-color: #8B0000;
                        border: 2px solid white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        text-decoration: none;
                        margin: 0 10px;
                    ">
                        ${data.user.fullName.charAt(0).toUpperCase()}
                    </div>
                </a>
            `;

            // Add avatar to the navigation
            navList.appendChild(avatarItem);
        }
    } catch (error) {
        console.error('Error adding avatar:', error);
    }
};

// Run when the DOM is loaded
document.addEventListener('DOMContentLoaded', addAvatarToNav); 