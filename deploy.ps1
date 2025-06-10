# A68 Trading Platform - Frontend Deployment Script
# Build and deploy React frontend to Docker registry

param(
    [string]$Tag = "latest",
    [string]$Registry = "100.118.114.91:5000",
    [string]$ImageName = "a68-frontend",
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$Deploy,
    [string]$StackName = "a68-frontend"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

function Check-DockerRunning {
    try {
        docker version | Out-Null
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Docker is not running or not installed!" $Red
        return $false
    }
}

function Build-Frontend {
    Write-ColorOutput "[BUILD] Building A68 Frontend..." $Blue
    
    # Check if package.json exists
    if (!(Test-Path "package.json")) {
        Write-ColorOutput "[ERROR] package.json not found! Are you in the correct directory?" $Red
        exit 1
    }

    # Build Docker image
    $fullImageName = "$Registry/$ImageName`:$Tag"
    Write-ColorOutput "Building image: $fullImageName" $Yellow
    
    docker build -t $fullImageName .
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[SUCCESS] Build completed successfully!" $Green
        return $true
    } else {
        Write-ColorOutput "[ERROR] Build failed!" $Red
        return $false
    }
}

function Push-Image {
    $fullImageName = "$Registry/$ImageName`:$Tag"
    Write-ColorOutput "[PUSH] Pushing image to registry..." $Blue
    Write-ColorOutput "Pushing: $fullImageName" $Yellow
    
    docker push $fullImageName
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[SUCCESS] Push completed successfully!" $Green
        return $true
    } else {
        Write-ColorOutput "[ERROR] Push failed!" $Red
        return $false
    }
}

function Deploy-Stack {
    Write-ColorOutput "[DEPLOY] Deploying to Docker Swarm..." $Blue
    
    # Check if stack file exists
    $stackFile = "docker-compose.stack.yml"
    if (!(Test-Path $stackFile)) {
        Write-ColorOutput "[ERROR] Stack file not found: $stackFile" $Red
        return $false
    }
    
    docker stack deploy -c $stackFile $StackName
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[SUCCESS] Deployment completed successfully!" $Green
        Write-ColorOutput "Stack name: $StackName" $Yellow
        
        # Show service status
        Write-ColorOutput "[INFO] Service status:" $Blue
        docker service ls --filter "label=com.docker.stack.namespace=$StackName"
        
        return $true
    } else {
        Write-ColorOutput "[ERROR] Deployment failed!" $Red
        return $false
    }
}

function Show-Usage {
    $usageText = @"
A68 Frontend Deployment Script

Usage:
    .\deploy.ps1 [OPTIONS]

Options:
    -Tag <string>           Docker image tag (default: latest)
    -Registry <string>      Docker registry URL (default: 100.118.114.91:5000)
    -ImageName <string>     Docker image name (default: a68-frontend)
    -SkipBuild             Skip building the Docker image
    -SkipPush              Skip pushing to registry
    -Deploy                Deploy to Docker Swarm after build/push
    -StackName <string>     Docker stack name (default: a68-frontend)

Examples:
    .\deploy.ps1                                    # Build and push with latest tag
    .\deploy.ps1 -Tag v1.0.0                      # Build and push with specific tag
    .\deploy.ps1 -Deploy                           # Build, push and deploy
    .\deploy.ps1 -SkipBuild -Deploy               # Only deploy (use existing image)
    .\deploy.ps1 -Tag dev -StackName a68-dev      # Build with dev tag and deploy to dev stack
"@
    Write-ColorOutput $usageText $Blue
}

# Main execution
Write-ColorOutput "[START] A68 Trading Platform - Frontend Deployment" $Blue
Write-ColorOutput "=============================================" $Blue

# Check if help is requested
if ($args -contains "-h" -or $args -contains "--help" -or $args -contains "help") {
    Show-Usage
    exit 0
}

# Check Docker
if (!(Check-DockerRunning)) {
    exit 1
}

$success = $true

# Build phase
if (!$SkipBuild) {
    if (!(Build-Frontend)) {
        $success = $false
    }
} else {
    Write-ColorOutput "[SKIP] Skipping build phase" $Yellow
}

# Push phase
if ($success -and !$SkipPush) {
    if (!(Push-Image)) {
        $success = $false
    }
} elseif ($SkipPush) {
    Write-ColorOutput "[SKIP] Skipping push phase" $Yellow
}

# Deploy phase
if ($success -and $Deploy) {
    if (!(Deploy-Stack)) {
        $success = $false
    }
} elseif (!$Deploy) {
    Write-ColorOutput "[INFO] Use -Deploy flag to deploy to Docker Swarm" $Yellow
}

# Final status
Write-ColorOutput "=============================================" $Blue
if ($success) {
    Write-ColorOutput "[SUCCESS] All operations completed successfully!" $Green
    
    if ($Deploy) {
        $deploymentInfo = @"
Frontend should be available at:
   - Local: http://localhost:30009
   - Server: http://113.161.121.177:30009

Check service status:
   docker service ls --filter label=com.docker.stack.namespace=$StackName
   docker service logs $StackName`_a68-frontend

Useful commands:
   docker stack ps $StackName                    # Check stack status
   docker service scale $StackName`_a68-frontend=2   # Scale service
   docker stack rm $StackName                    # Remove stack
"@
        Write-ColorOutput $deploymentInfo $Green
    }
} else {
    Write-ColorOutput "[ERROR] Some operations failed! Please check the errors above." $Red
    exit 1
}