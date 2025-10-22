# Week 1, Class 1.1: Minimal Development Environment Setup
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 1-2 hours
**Prerequisites:**
- Windows computer with administrator access
- Internet connection
- Basic familiarity with command line

**Philosophy:**
This class follows the "just-in-time installation" approach. We install ONLY what's needed for Week 1. You won't install PostgreSQL, Docker, or other tools until you actually need them.

**Why This Matters:**
Setting up your development environment correctly now prevents hours of debugging later. These tools form the foundation for blockchain development.

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Install and verify** Git for version control
2. **Install and configure** Node.js v22.14.0+ and npm 11.6.2+
3. **Set up** VS Code with essential blockchain development extensions
4. **Navigate** PowerShell command line confidently
5. **Verify** all installations are working correctly
6. **Understand** why each tool is needed in blockchain development

---

## 📖 Key Concepts

### 1. Why These Tools?

| Tool | Purpose | When You'll Use It |
|------|---------|-------------------|
| **Git** | Version control | Track code changes, collaborate, deploy |
| **Node.js** | JavaScript runtime | Run Hardhat, ethers.js, API servers |
| **npm** | Package manager | Install Hardhat, libraries, dependencies |
| **VS Code** | Code editor | Write Solidity, JavaScript, TypeScript |
| **Extensions** | IDE enhancement | Syntax highlighting, error detection, formatting |
| **PowerShell** | Command line | Run commands, scripts, interact with blockchain |

### 2. Version Requirements

**⚠️ IMPORTANT: Versions Matter!**

This course uses specific versions. Don't just install "latest" without checking:

- **Node.js:** v22.14.0 or higher (LTS version)
- **npm:** 11.6.2 or higher (included with Node.js)
- **Git:** 2.38.1 or higher
- **VS Code:** Latest stable version

**Why specific versions?**
- Hardhat 3 requires Node.js v18+
- ethers.js v6 has breaking changes from v5
- Older Node.js versions may have security vulnerabilities

### 3. PowerShell Basics

You'll use PowerShell throughout this course. Here are essential commands:

```powershell
# Check current directory
pwd

# List files in directory
ls

# Change directory
cd path\to\folder

# Create directory
mkdir folder-name

# Clear screen
clear

# Check command version
node --version
git --version
```

---

## 🛠️ Installation Guide

### Step 1: Install Git (15 minutes)

**What is Git?**
Git is version control software that tracks changes to your code. You'll use it to:
- Save snapshots of your project
- Revert mistakes
- Collaborate with others (GitHub)
- Deploy contracts

**Installation:**

1. **Download Git for Windows:**
   - Go to: https://git-scm.com/download/win
   - Download the 64-bit standalone installer

2. **Run the installer:**
   - Accept default settings (just click "Next" through everything)
   - **Important:** Keep "Git from the command line and also from 3rd-party software"
   - Keep "Use bundled OpenSSH"
   - Keep "Use the OpenSSL library"

3. **Verify installation:**

Open PowerShell and run:
```powershell
git --version
```

**Expected output:**
```
git version 2.38.1.windows.1
```
(Your version may be slightly different - that's fine as long as it's 2.38+)

4. **Configure Git:**

```powershell
# Set your name (used in commits)
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

**Expected output:**
```
user.name=Your Name
user.email=your.email@example.com
... (more settings)
```

**✅ Success Criteria:**
- `git --version` shows version 2.38+
- `git config --list` shows your name and email

---

### Step 2: Install Node.js and npm (20 minutes)

**What is Node.js?**
Node.js is a JavaScript runtime that lets you run JavaScript outside the browser. You'll use it to:
- Run Hardhat (smart contract development framework)
- Execute deployment scripts
- Build API servers later in the course

**npm (Node Package Manager)** comes bundled with Node.js and installs JavaScript libraries.

**Installation:**

1. **Download Node.js:**
   - Go to: https://nodejs.org/en/download
   - Download "22.14.0 LTS" for Windows (64-bit)
   - **⚠️ Important:** Get v22.14.0 or higher, NOT v18 or v20

2. **Run the installer:**
   - Accept license agreement
   - Keep default installation path: `C:\Program Files\nodejs\`
   - **Important:** Check "Automatically install necessary tools" (includes build tools)
   - Click "Install"

3. **Restart PowerShell:**
   - Close any open PowerShell windows
   - Open a fresh PowerShell window
   - This ensures the PATH is updated

4. **Verify installation:**

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version
```

**Expected output:**
```
v22.14.0
11.6.2
```

**If versions are lower than expected:**
```powershell
# Update npm to latest
npm install -g npm@latest

# Verify new version
npm --version
```

**Test Node.js works:**
```powershell
# Run a simple JavaScript command
node -e "console.log('Node.js is working!')"
```

**Expected output:**
```
Node.js is working!
```

**✅ Success Criteria:**
- `node --version` shows v22.14.0 or higher
- `npm --version` shows 11.6.2 or higher
- `node -e "console.log('test')"` prints "test"

---

### Step 3: Install Visual Studio Code (15 minutes)

**What is VS Code?**
VS Code is a free, powerful code editor. You'll use it to:
- Write Solidity smart contracts
- Write JavaScript/TypeScript tests
- Edit configuration files
- Debug code

**Installation:**

1. **Download VS Code:**
   - Go to: https://code.visualstudio.com/
   - Click "Download for Windows"

2. **Run the installer:**
   - Accept license agreement
   - **Important:** Check these options:
     - ✅ "Add to PATH"
     - ✅ "Create a desktop icon" (optional)
     - ✅ "Register Code as an editor for supported file types"
     - ✅ "Add 'Open with Code' action to Windows Explorer file context menu"
     - ✅ "Add 'Open with Code' action to Windows Explorer directory context menu"

3. **Launch VS Code:**
   - Open VS Code from Start Menu or desktop icon

4. **Verify command line access:**

```powershell
# Should open VS Code
code --version
```

**Expected output:**
```
1.85.0
... (more info)
```

**✅ Success Criteria:**
- VS Code opens when you click the icon
- `code --version` shows version number
- `code .` in a folder opens that folder in VS Code

---

### Step 4: Install VS Code Extensions (20 minutes)

**What are extensions?**
Extensions add features to VS Code. For blockchain development, you need:
- Syntax highlighting for Solidity
- Error detection in smart contracts
- Code formatting
- Linting (style checking)

**Installation Methods:**

**Method 1: Manual Installation (For Learning)**

1. Open VS Code
2. Click Extensions icon (left sidebar, looks like 4 squares)
3. Search for each extension and click "Install"

**Required Extensions:**

| Extension | Author | Purpose |
|-----------|--------|---------|
| **Solidity** | Juan Blanco | Solidity syntax highlighting |
| **Hardhat Solidity** | NomicFoundation | Hardhat project integration |
| **Prettier** | Prettier | Code formatting |
| **ESLint** | Microsoft | JavaScript linting |

**How to install each:**

1. **Solidity by Juan Blanco:**
   - Search: "Solidity Juan Blanco"
   - Click "Install"
   - Wait for installation to complete

2. **Hardhat Solidity by NomicFoundation:**
   - Search: "Hardhat Solidity"
   - Publisher should be "NomicFoundation"
   - Click "Install"

3. **Prettier - Code formatter:**
   - Search: "Prettier"
   - Publisher should be "Prettier"
   - Click "Install"

4. **ESLint:**
   - Search: "ESLint"
   - Publisher should be "Microsoft"
   - Click "Install"

**Method 2: Project Recommendations (Professional Approach)**

Create a file in your project to recommend extensions:

1. **Create the FamilyChain project folder:**

```powershell
# Navigate to your preferred location (e.g., Documents)
cd ~\Documents

# Create project folder
mkdir FamilyChain
cd FamilyChain

# Open in VS Code
code .
```

2. **Create extensions configuration:**

In VS Code:
- Click "New Folder" icon
- Name it: `.vscode` (yes, with the dot!)
- Inside `.vscode`, create file: `extensions.json`

Add this content:

```json
{
  "recommendations": [
    "juanblanco.solidity",
    "nomicfoundation.hardhat-solidity",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

3. **VS Code will now prompt:**
   - "Do you want to install the recommended extensions for this repository?"
   - Click "Install All"

**Verify Extensions:**

1. Click Extensions icon (Ctrl+Shift+X)
2. Type "@installed" in search box
3. Verify all 4 extensions are listed

**Configure Prettier as default formatter:**

1. Open VS Code settings (Ctrl+,)
2. Search: "default formatter"
3. Set "Editor: Default Formatter" to "Prettier - Code formatter"
4. Search: "format on save"
5. Check "Editor: Format On Save"

**✅ Success Criteria:**
- All 4 extensions show as "Installed" in Extensions panel
- `.vscode/extensions.json` exists in project
- Prettier is set as default formatter
- Format on save is enabled

---

### Step 5: Create GitHub Account (10 minutes)

**Why GitHub?**
GitHub hosts your code online. You'll use it to:
- Backup your project
- Share your portfolio
- Deploy to production
- Collaborate (if needed)

**Steps:**

1. Go to: https://github.com/signup
2. Enter email, password, username
3. Verify email address
4. Complete setup

**Configure Git with GitHub:**

```powershell
# Use the same email as your GitHub account
git config --global user.email "your.github.email@example.com"
```

**✅ Success Criteria:**
- GitHub account created
- Email verified
- Git configured with GitHub email

---

### Step 6: Final Verification (10 minutes)

Run all verification commands:

```powershell
# Create a test script
cd ~\Documents\FamilyChain
New-Item -Path "verify-setup.ps1" -ItemType File
```

Add this to `verify-setup.ps1`:

```powershell
Write-Host "`n=== FamilyChain Development Environment Verification ===" -ForegroundColor Cyan

# Git
Write-Host "`nChecking Git..." -ForegroundColor Yellow
git --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git installed" -ForegroundColor Green
} else {
    Write-Host "❌ Git not found" -ForegroundColor Red
}

# Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host $nodeVersion
if ($nodeVersion -match "v(\d+)\.") {
    $major = [int]$matches[1]
    if ($major -ge 22) {
        Write-Host "✅ Node.js version OK (v22+)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Node.js version too old (need v22+)" -ForegroundColor Yellow
    }
}

# npm
Write-Host "`nChecking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host $npmVersion
if ($npmVersion -match "(\d+)\.") {
    $major = [int]$matches[1]
    if ($major -ge 11) {
        Write-Host "✅ npm version OK (v11+)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  npm version too old (need v11+)" -ForegroundColor Yellow
    }
}

# VS Code
Write-Host "`nChecking VS Code..." -ForegroundColor Yellow
code --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VS Code installed" -ForegroundColor Green
} else {
    Write-Host "❌ VS Code not found" -ForegroundColor Red
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Cyan
Write-Host "If all checks passed, you're ready for Class 1.2!" -ForegroundColor Green
```

Run the verification:

```powershell
.\verify-setup.ps1
```

**Expected output:**
```
=== FamilyChain Development Environment Verification ===

Checking Git...
git version 2.38.1.windows.1
✅ Git installed

Checking Node.js...
v22.14.0
✅ Node.js version OK (v22+)

Checking npm...
11.6.2
✅ npm version OK (v11+)

Checking VS Code...
1.85.0
...
✅ VS Code installed

=== Verification Complete ===
If all checks passed, you're ready for Class 1.2!
```

---

## 🎯 Deliverables

By completing this class, you should have:

1. ✅ **Git installed and configured** (version 2.38+)
2. ✅ **Node.js v22.14.0+** and **npm v11.6.2+** installed
3. ✅ **VS Code installed** with command line access
4. ✅ **4 VS Code extensions installed:**
   - Solidity by Juan Blanco
   - Hardhat Solidity by NomicFoundation
   - Prettier
   - ESLint
5. ✅ **`.vscode/extensions.json`** created in FamilyChain folder
6. ✅ **GitHub account** created and verified
7. ✅ **Verification script** (`verify-setup.ps1`) passing all checks

---

## 🚨 Common Issues & Solutions

### Issue 1: "git is not recognized"

**Problem:** PowerShell can't find Git
**Solution:**
```powershell
# Check if Git is in PATH
$env:Path -split ';' | Select-String "Git"

# If not found, add Git to PATH manually
# 1. Search "Environment Variables" in Windows
# 2. Click "Environment Variables"
# 3. Under "System variables", select "Path", click "Edit"
# 4. Click "New", add: C:\Program Files\Git\cmd
# 5. Click OK, restart PowerShell
```

### Issue 2: "node is not recognized"

**Problem:** PowerShell can't find Node.js
**Solution:**
- Restart PowerShell (PATH updates on new sessions)
- If still not working, reinstall Node.js and check "Add to PATH"

### Issue 3: npm permissions errors

**Problem:** `npm install -g` fails with EACCES
**Solution (Windows):**
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell icon → "Run as Administrator"
npm install -g npm@latest
```

### Issue 4: VS Code extensions won't install

**Problem:** Extensions fail to download
**Solution:**
- Check internet connection
- Disable VPN/proxy temporarily
- Restart VS Code
- Try manual installation from website: https://marketplace.visualstudio.com/

### Issue 5: PowerShell execution policy error

**Problem:** Can't run .ps1 scripts
**Error:** "running scripts is disabled on this system"
**Solution:**
```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy to allow scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify
Get-ExecutionPolicy
```

---

## ✅ Self-Assessment Quiz

Before moving to Class 1.2, you should be able to answer:

1. **What is Git and why do we need it?**
   <details>
   <summary>Answer</summary>
   Git is version control software that tracks code changes, allows reverting mistakes, enables collaboration, and manages deployments.
   </details>

2. **What is the difference between Node.js and npm?**
   <details>
   <summary>Answer</summary>
   Node.js is the JavaScript runtime (runs JavaScript code). npm is the package manager (installs libraries and tools).
   </details>

3. **Why do we need v22.14.0 specifically, not just "latest Node.js"?**
   <details>
   <summary>Answer</summary>
   Hardhat 3 requires Node.js v18+, and we want the latest LTS (long-term support) version for stability and security. Using the same version as the course ensures compatibility.
   </details>

4. **What PowerShell command checks your current directory?**
   <details>
   <summary>Answer</summary>
   `pwd` (print working directory) or `Get-Location`
   </details>

5. **Name two VS Code extensions needed for Solidity development.**
   <details>
   <summary>Answer</summary>
   "Solidity" by Juan Blanco and "Hardhat Solidity" by NomicFoundation
   </details>

6. **What does `.vscode/extensions.json` do?**
   <details>
   <summary>Answer</summary>
   It recommends specific VS Code extensions to anyone who opens the project, ensuring consistent development environment across team members.
   </details>

---

## 🎓 Key Takeaways

1. **Just-in-time installation** reduces overwhelm and helps understand tool purpose
2. **Version compatibility** matters in blockchain development (Hardhat 3 needs Node v22+)
3. **VS Code extensions** catch errors before deployment (save time and gas costs)
4. **PowerShell proficiency** is essential for blockchain development
5. **Verification scripts** ensure environment is correctly configured

---

## 📚 Optional: Explore Further

If you finish early and want to explore:

1. **Try these PowerShell commands:**
   ```powershell
   # See all installed npm packages globally
   npm list -g --depth=0

   # Check Node.js built-in modules
   node -e "console.log(process.versions)"

   # Run JavaScript REPL (Read-Eval-Print Loop)
   node
   # Try: console.log("Hello"), 1+1, process.version
   # Exit with: .exit or Ctrl+C twice
   ```

2. **Customize VS Code:**
   - Try different themes: File → Preferences → Color Theme
   - Increase font size: File → Preferences → Settings → "font size"
   - Enable bracket colorization: Search "bracket colorization" in settings

3. **Learn more Git:**
   ```powershell
   # See Git configuration
   git config --list --show-origin

   # Get help for any Git command
   git help config
   git help commit
   ```

---

## 📝 Next Steps

**Before Class 1.2:**
- [ ] Verify all tools are installed (run `verify-setup.ps1`)
- [ ] Ensure all VS Code extensions are active
- [ ] Read Bitcoin Book: Chapter 1 (Introduction)
- [ ] Read Ethereum Book: Chapter 1 (What Is Ethereum)

**In Class 1.2:**
- Learn blockchain fundamentals (blocks, chains, consensus)
- Understand Bitcoin vs Ethereum differences
- Learn about gas, transactions, and wallets
- Understand smart contracts vs traditional applications

---

## 💡 Teaching Notes (for Claude Code)

When helping with this class:

1. **One tool at a time** - Don't rush through installations
2. **Verify after each step** - Run verification commands
3. **Troubleshoot immediately** - Don't proceed if something's broken
4. **Explain the "why"** - Connect tools to blockchain development
5. **Encourage exploration** - Let user try PowerShell commands
6. **Patient with errors** - Environment setup is often frustrating

---

**Class 1.1 Complete! 🎉**

You now have a fully configured blockchain development environment. In Class 1.2, you'll learn the theory behind blockchain before building your first smart contract in Class 1.3.

**Estimated Time:** 1-2 hours
**Actual Time:** _____ (fill this in when done)

---

*Last Updated: 2025-10-22*
*FamilyChain Course - Week 1, Class 1.1*
