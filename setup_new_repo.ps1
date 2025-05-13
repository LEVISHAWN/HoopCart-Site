# This script helps you push your project to a new GitHub repository
# Run this script with: .\setup_new_repo.ps1

# Prompt for GitHub username
$username = Read-Host -Prompt "Enter your GitHub username"

# Prompt for repository name
$repoName = Read-Host -Prompt "Enter your new repository name (without .git extension)"

# Construct the repository URL
$newRepoUrl = "https://github.com/$username/$repoName.git"
Write-Host "Repository URL: $newRepoUrl"

# Prompt for Personal Access Token
$personalAccessToken = Read-Host -Prompt "Enter your GitHub Personal Access Token"

# Create the authenticated URL with the token
$authRepoUrl = "https://$username`:$personalAccessToken@github.com/$username/$repoName.git"

Write-Host "Setting up remote for the new repository..."

# Check if 'new-origin' remote exists
$remoteExists = git remote | Where-Object { $_ -eq "new-origin" }

if ($remoteExists) {
    # Remove the existing remote
    git remote remove new-origin
    Write-Host "Removed existing 'new-origin' remote"
}

# Add the new remote
git remote add new-origin $authRepoUrl
Write-Host "Added new remote 'new-origin'"

# Push to the new repository
Write-Host "Pushing code to the new repository..."
git push -u new-origin main

Write-Host "Setup complete! Your code has been pushed to the new repository."
Write-Host "New repository URL: $newRepoUrl" 