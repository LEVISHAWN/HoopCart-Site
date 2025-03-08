// Function to update navigation based on login status
const updateNavigation = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/status', {
            credentials: 'include'
        });
        const data = await response.json();

        const navbarNav = document.getElementById('navbarNav');
        if (!navbarNav) return;

        const navList = navbarNav.querySelector('ul.navbar-nav');
        if (!navList) return;

        // Remove existing auth-related items
        const authItems = navList.querySelectorAll('.auth-item');
        authItems.forEach(item => item.remove());

        if (data.isLoggedIn && data.user) {
            // Add avatar and logout button
            const avatarItem = document.createElement('li');
            avatarItem.className = 'nav-item auth-item';
            avatarItem.innerHTML = `
                <a class="nav-link" href="/account" style="display: flex; align-items: center;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #8B0000; 
                               display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                        ${data.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    My Account
                </a>
            `;

            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item auth-item';
            logoutItem.innerHTML = '<a class="nav-link" href="/auth/logout">Logout</a>';

            navList.appendChild(avatarItem);
            navList.appendChild(logoutItem);

            // Hide signup/login buttons if they exist
            const authButtons = document.querySelectorAll('.auth-button');
            authButtons.forEach(button => button.style.display = 'none');
        } else {
            // Show signup/login buttons if they exist
            const authButtons = document.querySelectorAll('.auth-button');
            authButtons.forEach(button => button.style.display = 'inline-block');
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
};

// Update navigation when page loads
document.addEventListener('DOMContentLoaded', updateNavigation); 