# Hostinger Deployment Script (Alternative Method)
# This script deploys the SellerCtrl project to Hostinger server using alternative methods

param(
    [string]$ServerIP = "91.108.112.75",
    [string]$Username = "root",
    [string]$Password = "3lolScar@25#"
)

Write-Host "Starting deployment to Hostinger server..." -ForegroundColor Green

# Check if we have WSL or Git Bash available for scp
$scpAvailable = $false
$sshAvailable = $false

# Check for WSL
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    Write-Host "WSL detected, checking for scp..." -ForegroundColor Yellow
    $wslScp = wsl which scp 2>$null
    if ($wslScp) {
        $scpAvailable = $true
        $sshAvailable = $true
        Write-Host "Using WSL for deployment" -ForegroundColor Green
    }
}

# Check for Git Bash
if (!$scpAvailable -and (Test-Path "C:\Program Files\Git\usr\bin\scp.exe")) {
    $scpAvailable = $true
    $sshAvailable = $true
    $env:PATH += ";C:\Program Files\Git\usr\bin"
    Write-Host "Using Git Bash tools for deployment" -ForegroundColor Green
}

if (!$scpAvailable) {
    Write-Host "No SCP tool available. Creating manual deployment instructions..." -ForegroundColor Yellow
    
    # Create a zip file for manual upload
    Write-Host "Creating deployment package..." -ForegroundColor Yellow
    
    $zipPath = "$PWD\sellerctrl-deployment.zip"
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    # Create zip excluding unnecessary files
    $compress = @{
        Path = @(
            "src",
            "backend",
            "public",
            "package.json",
            "package-lock.json",
            "vite.config.js",
            "tailwind.config.js",
            "postcss.config.js",
            "index.html",
            "README.md"
        )
        CompressionLevel = "Optimal"
        DestinationPath = $zipPath
    }
    
    Compress-Archive @compress
    
    Write-Host "Deployment package created: $zipPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "MANUAL DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "1. Upload the file '$zipPath' to your server" -ForegroundColor White
    Write-Host "2. Connect to your server via SSH: ssh $Username@$ServerIP" -ForegroundColor White
    Write-Host "3. Extract the files: unzip sellerctrl-deployment.zip -d /var/www/sellerctrl/" -ForegroundColor White
    Write-Host "4. Install dependencies: cd /var/www/sellerctrl && npm install" -ForegroundColor White
    Write-Host "5. Install backend dependencies: cd backend && npm install" -ForegroundColor White
    Write-Host "6. Build the project: cd .. && npm run build" -ForegroundColor White
    Write-Host "7. Restart services: pm2 restart all" -ForegroundColor White
    Write-Host ""
    Write-Host "Server Details:" -ForegroundColor Yellow
    Write-Host "IP: $ServerIP" -ForegroundColor White
    Write-Host "Username: $Username" -ForegroundColor White
    Write-Host "Password: $Password" -ForegroundColor White
    
    return
}

# Proceed with automated deployment
Write-Host "Creating deployment package..." -ForegroundColor Yellow

# Create a temporary directory for deployment
$tempDir = "$env:TEMP\sellerctrl-deploy"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy project files (excluding patterns)
Write-Host "Copying project files..." -ForegroundColor Yellow

$excludeDirs = @("node_modules", ".git", "dist", "build")
$excludeFiles = @("*.log", ".env.local", ".DS_Store", "Thumbs.db")

# Copy essential files and directories
$itemsToCopy = @("src", "backend", "public", "package.json", "package-lock.json", "vite.config.js", "tailwind.config.js", "postcss.config.js", "index.html")

foreach ($item in $itemsToCopy) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            Copy-Item $item -Destination $tempDir -Recurse -Force
        } else {
            Copy-Item $item -Destination $tempDir -Force
        }
    }
}

# Upload files to server
Write-Host "Uploading files to server $ServerIP..." -ForegroundColor Yellow

try {
    if ($scpAvailable) {
        # Create the remote directory first
         $sshTarget = "${Username}@${ServerIP}"
         $createDirCmd = "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $sshTarget 'mkdir -p /var/www/sellerctrl'"
         
         if (Get-Command wsl -ErrorAction SilentlyContinue) {
             # Use WSL
             $result = wsl bash -c "sshpass -p '$Password' $createDirCmd"
         } else {
             # Use Git Bash
             $result = & "C:\Program Files\Git\bin\bash.exe" -c "sshpass -p '$Password' $createDirCmd"
         }
         
         # Upload files
         $remotePath = "${sshTarget}:/var/www/sellerctrl/"
         $uploadCmd = "scp -r -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $tempDir/* $remotePath"
         
         if (Get-Command wsl -ErrorAction SilentlyContinue) {
             $result = wsl bash -c "sshpass -p '$Password' $uploadCmd"
         } else {
             $result = & "C:\Program Files\Git\bin\bash.exe" -c "sshpass -p '$Password' $uploadCmd"
         }
        
        Write-Host "Files uploaded successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "Error during upload: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Falling back to manual deployment..." -ForegroundColor Yellow
    
    # Create zip for manual upload
    $zipPath = "$PWD\sellerctrl-deployment.zip"
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force
    
    Write-Host "Manual deployment package created: $zipPath" -ForegroundColor Green
    return
}

# Run deployment commands on server
Write-Host "Running deployment commands on server..." -ForegroundColor Yellow

$deployCommands = @(
    "cd /var/www/sellerctrl",
    "npm install --production",
    "cd backend && npm install --production && cd ..",
    "npm run build",
    "pm2 restart sellerctrl-backend || pm2 start backend/server.cjs --name sellerctrl-backend",
    "pm2 restart sellerctrl-frontend || pm2 start 'npm run preview' --name sellerctrl-frontend"
)

$commandString = $deployCommands -join " && "

try {
    $sshTarget = "${Username}@${ServerIP}"
    $sshCmd = "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $sshTarget '$commandString'"
    
    if (Get-Command wsl -ErrorAction SilentlyContinue) {
        $result = wsl bash -c "sshpass -p '$Password' $sshCmd"
    } else {
        $result = & "C:\Program Files\Git\bin\bash.exe" -c "sshpass -p '$Password' $sshCmd"
    }
    
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Your application should now be running on the server." -ForegroundColor Green
} catch {
    Write-Host "Error executing deployment commands: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to connect manually to complete the deployment." -ForegroundColor Yellow
}

# Cleanup
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Deployment script completed!" -ForegroundColor Green
Write-Host "Server IP: $ServerIP" -ForegroundColor Cyan
Write-Host "Please verify that your application is running correctly." -ForegroundColor Yellow