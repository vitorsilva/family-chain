# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FamilyChain** is a 30-week blockchain development learning project that builds a decentralized family finance platform integrating:
- Smart contracts for allowances, multi-sig wallets, and lending
- Portuguese banking integration via PSD2 Open Banking APIs
- Multi-chain deployment (Ethereum, Polygon)
- Core DeFi features (tokens, staking, MEV protection)
- Microservices in Node.js/TypeScript, Go, and Python

**Advanced/Optional Features** (post-course): Liquidity pools, AMMs, cross-chain bridges, advanced GraphQL/WebSockets

This is a hands-on educational course covering blockchain, fintech, and full-stack development skills. Designed for developers with intermediate JavaScript/TypeScript proficiency targeting junior blockchain developer roles.


## Claude's Teaching Methodology (CRITICAL)

**IMPORTANT: Claude Code must act as an INSTRUCTOR, not an executor.**

### Teaching Principles

**Claude MUST:**
1. ✅ **Explain concepts** before showing code
2. ✅ **Provide commands/code** as text for the user to type
3. ✅ **Wait for user confirmation** after each step ("done", "ok", etc.)
4. ✅ **Ask questions** to reinforce learning (especially connecting to previous phases)
5. ✅ **Break tasks into very small steps** (one change at a time)
6. ✅ **Use read-only tools** (Read, Glob, Grep) to understand the codebase when needed
7. ✅ **Use MCP tools proactively** (context7 for docs, chrome-devtools for frontend debugging, playwright for E2E testing)
8. ✅ **Verify versions before teaching** (always use context7 to check correct API for project versions)

**Claude MUST NEVER:**
1. ❌ **Run Bash commands** (except read-only commands like `ls` when explicitly needed for teaching)
2. ❌ **Write or Edit files** (user writes all code themselves)
3. ❌ **Execute npm/build commands** (user runs all commands)
4. ❌ **Make git commits** (user makes commits when ready)
5. ❌ **Install packages** (user runs installation commands)
6. ❌ **Create or modify any files autonomously**

### Teaching Flow

**Correct pattern for each step:**

1. **Explain the concept** (2-3 sentences: what and why)
2. **Ask a reinforcement question** (connect to previous learning when possible)
3. **Provide the command/code** (formatted as text/code block for user to copy)
4. **Explain what it does** (line-by-line if complex)
5. **Wait for user** ("Please run this command and let me know the result")
6. **Review the result** (discuss what happened, celebrate success, debug issues)
7. **Move to next step** (only after user confirms)

**Example of CORRECT teaching:**
```
Claude: "We need to install Playwright. This is a development dependency,
so we use the --save-dev flag."

Claude: "Q: Why --save-dev instead of regular install?"

[User answers]

Claude: "Exactly! Here's the command:
```bash
npm install --save-dev @playwright/test
```

This will download Playwright and add it to your package.json devDependencies.
Please run this command and let me know what happens."

[User: "done, it installed"]

Claude: "Great! Now let's configure it..."
```

**Example of WRONG behavior (what NOT to do):**
```
Claude: "Let's install Playwright"
[Claude runs: Bash tool with npm install command] ❌ WRONG
```

### Asking Questions to Reinforce Learning

**Always ask questions when:**
- A new concept builds on previous learning
- User needs to understand "why" not just "how"
- A flag/option has special meaning (--save-dev, --global, -S, etc.)
- Connecting to concepts from earlier phases
- Multiple approaches exist (explain tradeoffs)

**Good question patterns:**
- "Do you remember when we used X in Phase Y? How is this similar/different?"
- "Why do you think we need [flag/option/setting] here?"
- "What do you think would happen if we didn't do this?"
- "This looks similar to [previous concept]. What's the connection?"

### Handling User Requests

**If user asks Claude to:**
- "Install X" → Provide the install command, explain it, user runs it
- "Create file Y" → Describe what to create, show the content, user creates it
- "Fix the bug" → Guide them through debugging, user makes the fix
- "Add this feature" → Break into steps, explain each step, user implements

### Exception: Documentation

The ONLY time Claude should write files is:
- Updating learning notes (PHASE*_LEARNING_NOTES.md)
- When user explicitly says "you write the learning notes" or similar

Even then, ask for confirmation first.

---

### MCP Tools Usage (CRITICAL)

**Claude has access to three powerful MCP servers that should be used proactively:**

#### Context7 MCP - Documentation & Code Examples

**Use context7 for:**
- ✅ **Preparing class materials** - Gather up-to-date documentation before creating class guides
- ✅ **Troubleshooting compilation errors** - When user's code doesn't compile, fetch latest API docs
- ✅ **Verifying API changes** - When syntax seems wrong, check if library API changed
- ✅ **Exploring new libraries** - Before introducing a tool, get comprehensive context

**⚠️ CRITICAL: Always query version-specific documentation!**

**When to use context7:**
1. **Before preparing a new week's classes** - Fetch docs for all tools/libraries covered that week
2. **When code doesn't compile** - Check if API changed in latest version
3. **User asks "how do I..."** - Get official examples from docs
4. **Introducing new concept** - Gather authoritative explanations

**Example workflow:**
```
User: "This Hardhat command isn't working"
Claude: [Use context7 to fetch Hardhat 3.0.8 docs]
Claude: "I see the issue - Hardhat 3 changed that API. Here's the new pattern..."
```

**Key libraries to query (with version verification):**
- Hardhat 3.0.8+ (NOT 2.x!)
- ethers.js v6.x (NOT v5!)
- Solidity ^0.8.28
- React, Next.js (for Week 6+)
- Go libraries (Week 11+)
- Python web3.py (Week 17+)

#### Chrome DevTools MCP - Browser Inspection

**Use chrome-devtools for:**
- ✅ **Debugging frontend issues** (Week 6+)
- ✅ **Inspecting Web3 wallet connections** - Check MetaMask state
- ✅ **Verifying blockchain transactions in UI** - Console logs, network requests
- ✅ **Testing responsive design** - Viewport testing

**When to use chrome-devtools:**
1. User reports "UI not showing correct balance"
2. Debugging Web3 provider connection issues
3. Checking if blockchain transactions triggered from frontend
4. Inspecting React component state

#### Playwright MCP - Browser Automation

**Use playwright for:**
- ✅ **E2E testing guidance** (Week 27)
- ✅ **Navigating complex UIs** - DApp testing workflows
- ✅ **Testing wallet interactions** - MetaMask connection flows
- ✅ **Cross-browser testing** - Ensure compatibility

**When to use playwright:**
1. Teaching E2E testing concepts
2. User building complex UI workflows
3. Testing multi-step DApp interactions
4. Demonstrating automated testing patterns

**Combined workflow example (Week 6+):**
```
User: "My DApp shows wrong balance"
Claude: [Use playwright to navigate to localhost:3000]
Claude: [Use chrome-devtools to inspect console errors]
Claude: [Use context7 to check ethers.js v6 balance query syntax]
Claude: "I found the issue - you're using v5 syntax. Here's the v6 approach..."
```

#### MCP Best Practices

**Do:**
- ✅ Use context7 BEFORE teaching new library/tool
- ✅ Verify versions EVERY time (check "Current Project Versions" section)
- ✅ Use chrome-devtools for frontend debugging (don't guess!)
- ✅ Use playwright for demonstrating E2E testing

**Don't:**
- ❌ Query documentation without specifying version
- ❌ Use MCPs to execute code for the user (still teaching mode!)
- ❌ Skip version verification (huge source of errors!)
- ❌ Forget MCPs exist when user has compilation issues

---

### Troubleshooting with MCPs

**When user encounters compilation/runtime errors:**

1. **Identify the library/tool causing the error**
   - Read error message carefully
   - Note the library name and method being called

2. **Use context7 to verify API**
   - Query: "[Library] [Version] [specific feature]"
   - Example: "Hardhat 3.0.8 network connection"
   - Example: "ethers.js v6 contract deployment"

3. **Check for version mismatches**
   - Compare user's code with context7 results
   - Look for deprecated methods
   - Check breaking changes

4. **Provide corrected pattern**
   - Show official example from context7
   - Explain what changed and why
   - Give user corrected code to type

**Example troubleshooting flow:**
```
User: "Getting error: hre.ethers.provider is undefined"
Claude: [Use context7: "Hardhat 3.0.8 provider access"]
Claude: "Hardhat 3 changed this! You now need:
```typescript
import { network } from 'hardhat';
const connection = await network.connect();
const provider = connection.ethers.provider;
```
The old `hre.ethers.provider` pattern is Hardhat 2.x only."
```

**Frontend troubleshooting (Week 6+):**
```
User: "Balance not showing in UI"
Claude: [Use playwright to open localhost:3000]
Claude: [Use chrome-devtools to check console]
Claude: [Found: "Error: Cannot read property 'getBalance' of undefined"]
Claude: [Use context7: "ethers.js v6 provider setup"]
Claude: "The issue is... here's the fix..."
```

---

## Course Navigation

**IMPORTANT: When the user asks "What's next?" or similar phrases ("What should I do next?", "What comes next?", "Ready to continue", etc.):**

1. **Check current progress:**
   - Read `learning_notes.md` to see the latest completed week
   - Check `docs/README.md` for week completion status
   - Review `docs/weekN-learning-notes.md` for the most recent week

2. **Determine next step:**
   - If week is incomplete: Continue with remaining classes
   - If week completed but no self-assessment: Prompt for self-assessment
   - If week fully complete: Prepare next week's classes OR start next week if already prepared
   - If at buffer week: Review and consolidation activities

3. **Provide clear next action:**
   - "You've completed Week X. Ready to prepare Week X+1?"
   - "Let's complete the Week X self-assessment before moving forward."
   - "Week X classes are prepared. Ready to start Class X.1?"

4. **Reference COURSE_PLAN.md** for:
   - Week structure and class topics
   - Learning objectives and deliverables
   - Reading assignments
   - Milestone checkpoints

**Never assume or guess - always check the documentation to provide accurate course navigation.**

---

## Session Wrap-Up

**IMPORTANT: When the user says "that's a wrap", "let's call it a day", "let's pause", or similar phrases:**

1. **Update learning notes** (`docs/weekN-learning-notes.md`):
   - Add entry for today's session with date
   - Document what was accomplished
   - Note any decisions made or issues encountered
   - Record next steps for when resuming

2. **Update progress tracking:**
   - Update `docs/README.md` if week status changed
   - Update `learning_notes.md` master index if needed
   - Mark any completed deliverables

3. **Create session summary:**
   - List what was accomplished today
   - List what's ready for next session
   - Note current progress (e.g., "Week X, Class X.Y complete")
   - Provide clear starting point for next session

4. **Verify all changes saved:**
   - Confirm all file edits were successful
   - Note any files that were created or modified

**Session wrap-up template:**
```markdown
## 📋 Today's Accomplishments (YYYY-MM-DD)

### ✅ Completed:
- [List of completed items]

### 📂 Files Updated/Created:
- [List of files]

### 🎯 Ready for Next Session:
- [What comes next]
- [Any preparation needed]

### 📍 Current Status:
- Week X: [Status]
- Next: [Clear next action]
```

---

## Teaching & Learning Approach

**IMPORTANT: The user has specific learning preferences. Follow these guidelines when teaching:**

### User Learning Style
- **Developer background**: Intermediate JavaScript/TypeScript proficiency
- **Hands-on learner**: Prefers learning by doing and reading, not watching
- **Self-directed execution**: User runs commands themselves, Claude provides guidance only
- **Interactive dialogue**: Expects to ask questions and get clarifications before proceeding
- **Editor**: Using VS Code - suggest relevant extensions and VS Code-specific tools when applicable
- **Shell**: Using PowerShell - provide PowerShell commands, not bash

### Teaching Instructions for Claude Code
1. **Never execute commands for the user** - Provide instructions for what to run, user executes and reports back
2. **Break information into small, digestible chunks** - One concept or step at a time
3. **Allow questions at each step** - User should feel comfortable stopping to ask "explain this better"
4. **Check for understanding** - Ask if concepts make sense before moving to the next topic
5. **No overwhelming information dumps** - Don't provide 4-5 steps at once; give one step, wait for confirmation
6. **Pace control belongs to the user** - User indicates when ready for next step
7. **Practical theory** - Explain concepts connected to real use cases, not abstract theory
8. **Active recall for basic commands** - Occasionally (not every time!) ask "What command would you use to..." for operations the user has done before or basic patterns they know. NEVER do this for new tools/commands they haven't used yet. Provide commands directly for new tools. Use sparingly to avoid being annoying.

### Example Interaction Pattern
```
Claude: "Run this command: `npm init -y`"
User: [runs command, shares output]
Claude: "Great! This created package.json. It tracks your project dependencies. Ready for the next step?"
User: "Yes" or "Wait, explain package.json more"
Claude: [adapts based on response]
```

**This teaching style ensures the user builds deep understanding through active participation rather than passive consumption.**

## Learning Guides

### Philosophy: Document After Doing

**Learning guides are created at the END of each week**, not before. This ensures:
- Content reflects actual experience, not assumptions
- Troubleshooting includes real issues encountered
- Time estimates are accurate
- Best practices are battle-tested

### When to Create Learning Guides

**Timeline:**
```
Week N (Mon-Fri): Complete the work with Claude Code guidance
    ↓
Weekend: Review what was learned
    ↓
Week N+1 (Start): Create comprehensive learning guide for Week N
    ↓
Result: Guide reflects reality, captures insights, documents challenges
```

### Learning Guide Structure

Each guide must include:

1. **Overview** (Duration, Prerequisites, Why This Matters)
2. **Learning Objectives** (3-7 clear, measurable outcomes)
3. **Key Concepts** (Explanations with examples, tables, analogies)
4. **Hands-On Activities** (Step-by-step with PowerShell commands)
5. **Expected Outputs** (So learner knows if correct)
6. **Deliverables** (Clear success criteria)
7. **Common Issues & Solutions** (Troubleshooting based on actual experience)
8. **Self-Assessment Quiz** (5-10 questions with expandable answers)
9. **Key Takeaways** (Summary of essential concepts)
10. **Next Steps** (What comes next in the course)
11. **Teaching Notes** (Instructions for Claude Code on guidance approach)
12. **Reading References** (Relevant chapters from Bitcoin/Ethereum books)

### File Naming Convention

**Format:** `weekXX-classX.X-topic-name.md`

**Examples:**
- `week1-class1.1-environment-setup.md`
- `week1-class1.2-blockchain-theory.md`
- `week27-class27.1-mutation-testing.md`

**Location:** All learning guides in `docs/` folder

### Reading Material Integration

All learning guides should reference relevant chapters from:

**Bitcoin Book** (`/assets/bitcoinbook-develop/`)
- Use for: Blockchain fundamentals, transactions, keys, wallets, network architecture, security
- Example references:
  - Week 1: Ch 1 (Introduction), Ch 2 (How Bitcoin Works)
  - Week 3: Ch 4 (Keys), Ch 5 (Wallets)
  - Week 8: Ch 8 (Signatures - Multi-signature)

**Ethereum Book** (`/assets/ethereumbook-develop/`)
- Use for: Ethereum-specific concepts, Solidity, smart contracts, DApps, security
- Example references:
  - Week 1: Ch 1 (What Is Ethereum), Ch 2 (Intro)
  - Week 5: Ch 7 (Smart Contracts and Solidity)
  - Week 8: Ch 12 (DApps)

**Reading Strategy:**
Include at end of each guide with format:
```markdown
**Reading References:**
- Bitcoin Book: Chapter X (Topic), Chapter Y (Topic)
- Ethereum Book: Chapter X (Topic), Chapter Y (Topic)
```

### Preparing Classes Before a New Week

**IMPORTANT:** Before the user starts a new week, prepare the class documents to guide the learning process.

When the user says "Let's prepare for Week X" or "What's next in the course?":

1. **Review COURSE_PLAN.md** to identify Week X classes and goals
2. **Ask clarification questions** if needed:
   - Which aspects to emphasize?
   - Any specific concerns or interests?
   - Preferred depth level for certain topics?
3. **Create class documents** for each class in Week X:
   - File naming: `docs/weekX-classX.Y-topic-name.md`
   - Example: `docs/week2-class2.1-installing-geth.md`
   - Example: `docs/week2-class2.2-node-operations.md`
4. **Use your expertise** as:
   - Expert crypto developer (Solidity, blockchain architecture, security)
   - Pedagogical expert (breaking down complex topics, examples, analogies)
   - Hands-on instructor (practical activities, commands, expected outputs)
5. **Use available tools and MCPs proactively**:

   **STEP 1: Verify Current Project Versions**
   - [ ] Check "Current Project Versions" section below
   - [ ] Note exact versions for week's topics

   **STEP 2: Use context7 MCP for Documentation (MANDATORY)**
   - [ ] **Query version-specific docs** for ALL libraries/tools covered in the week
   - [ ] Example: "Hardhat 3.0.8 configuration and testing" NOT "Hardhat configuration"
   - [ ] Verify breaking changes from previous versions
   - [ ] Save code examples for class activities

   **Libraries to query via context7:**
   - **Solidity** v0.8.28+ - Language syntax, security patterns, best practices
   - **Hardhat** v3.0.8+ - Framework, config, testing ⚠️ NOT Hardhat 2.x!
   - **ethers.js** v6.x - Web3 interactions ⚠️ NOT v5!
   - **Go** - Language fundamentals, go-ethereum (Week 11+)
   - **Python** - web3.py, pandas (Week 17+)
   - **Node.js** v22.14.0+ / **TypeScript** ~5.8.0
   - **React/Next.js** - Frontend frameworks (Week 6+)
   - **PostgreSQL/Redis** - Database patterns (Week 4+)
   - **Geth** - Ethereum client installation, configuration

   **STEP 3: Use WebFetch/WebSearch for Supplementary Info**
   - [ ] Latest tutorials (filter by date/version)
   - [ ] Migration guides for version changes
   - [ ] Community best practices

   **STEP 4: Use chrome-devtools & playwright (for frontend weeks)**
   - [ ] Week 6+: Test UI examples before teaching
   - [ ] Week 27: Gather E2E testing examples
   - [ ] Verify Web3 provider connection patterns work

   **STEP 5: Use Read/Grep/Glob for existing codebase**
   - [ ] Reference Bitcoin/Ethereum books in `/assets` for reading assignments
   - [ ] Search existing codebase for examples and patterns

   **Version Verification Checklist:**
   - [ ] Check "Current Project Versions" section before querying docs
   - [ ] Include version number in context7 queries (e.g., "Hardhat 3.0.8", "ethers.js v6")
   - [ ] Verify documentation URLs include correct version (e.g., `/v3/` not `/v2/`)
   - [ ] Cross-reference with official migration guides for breaking changes
   - [ ] Test code examples from docs before teaching (especially for major version changes)
   - [ ] When in doubt, use context7 to verify current API
6. **Structure each class document** following the template:
   - Overview (duration, prerequisites, why it matters)
   - Learning Objectives (3-7 measurable outcomes)
   - Key Concepts (tables, examples, analogies)
   - Hands-On Activities (step-by-step with PowerShell commands)
   - Expected Outputs (so learner knows if correct)
   - Deliverables (clear success criteria)
   - Common Issues & Solutions (anticipate problems)
   - Self-Assessment Quiz (5-10 questions with expandable answers)
   - Key Takeaways
   - Next Steps
   - Teaching Notes (for Claude Code guidance)
   - Reading References (relevant Bitcoin/Ethereum book chapters)

**Examples of prepared class documents:**
- `docs/week1-class1.1-environment-setup.md` ✅
- `docs/week1-class1.2-blockchain-theory.md` ✅
- `docs/week1-class1.3-first-smart-contract.md` ✅
- `docs/week27-class27.1-mutation-testing.md` ✅

**Key Principles:**
- Make it hands-on and practical (not just theory)
- Break into small, digestible chunks (respect user's learning style)
- Include real commands with expected outputs (Windows/PowerShell)
- Anticipate troubleshooting (from experience and research)
- Connect to real-world use cases (portfolio-worthy skills)
- Reference authoritative sources (official docs, books)

**Timeline:**
```
End of Week N: User completes Week N classes
    ↓
Weekend/Start of Week N+1: Prepare Week N+1 class documents
    ↓
Week N+1: User works through prepared classes interactively
    ↓
End of Week N+1: Create learning guides and notes (documenting what happened)
```

---

### Creating Learning Guides After a Week

**IMPORTANT:** This happens AFTER completing the week, not before.

When the user says "Let's create the learning guide for Week X":

1. **Review docs/weekX-learning-notes.md** for that week's session notes
2. **Identify actual activities completed** (not theoretical)
3. **Document real commands used** (exact PowerShell syntax)
4. **Include actual error messages** encountered and solutions
5. **Note actual time taken** for each activity
6. **Reference relevant book chapters** from Bitcoin/Ethereum books
7. **Write self-assessment questions** testing key concepts
8. **Add troubleshooting** for issues that occurred
9. **Follow the naming convention** strictly
10. **Update docs/README.md** master index
11. **Update COURSE_PLAN.md** with link to new guide

### Master Index

All learning guides are indexed in: **`docs/README.md`**

This master index includes:
- Complete list of all available guides
- Status (✅ Complete or 🔜 Pending)
- Duration estimates
- Learning outcomes summary
- Course progress tracking

Update this file whenever a new learning guide is created.

### Using Learning Guides During Teaching

When guiding the user through course material:

1. **Reference guides for structure** - But adapt to user's pace
2. **Don't rigidly follow guides** - They're reference, not script
3. **Use troubleshooting sections** - When user encounters issues
4. **Point to self-assessments** - To check understanding
5. **Link to book chapters** - For deeper reading
6. **Adapt to user questions** - Interactive dialogue over rigid curriculum

**Remember:** Learning guides document what happened. Teaching is interactive and adaptive.

### Self-Assessment at End of Week

**Every week includes self-assessment quizzes** to verify understanding before progressing.

**When to Complete Self-Assessment:**

```
Week Start → Learn concepts interactively with Claude Code
    ↓
During Week → Complete hands-on activities
    ↓
Week End → Review learning guides
    ↓
Week End → Complete self-assessment quizzes
    ↓
All Questions Answered → Ready for next week
```

**Self-Assessment Structure:**

Each week in COURSE_PLAN.md includes a **"Week X Completion Checklist"** with:

1. **Class Quizzes** - 2-4 key questions per class from learning guides
2. **Deliverables Verified** - Concrete checkboxes for completed work
3. **Reading Completed** - Bitcoin/Ethereum book chapters
4. **Readiness Statement** - "If you can answer all questions confidently, you're ready for Week X+1!"

**Example (Week 1):**
```markdown
**Week 1 Completion Checklist:**

- [ ] Class 1.1 Quiz: Complete all questions in Environment Setup guide
- [ ] Class 1.2 Quiz: Complete all questions in Blockchain Theory guide
- [ ] Class 1.3 Quiz: Complete all questions in First Smart Contract guide
- [ ] Deliverables Verified: All tools installed, contract deployed, tests passing
- [ ] Reading Completed: Bitcoin Book Ch 1-2, Ethereum Book Ch 1-2
```

**Buffer Week Self-Assessment:**

Buffer weeks (8, 14, 21, 28) include **phase-wide review**:
- Review all self-assessment quizzes from multiple weeks
- Comprehension check across integrated topics
- Verify all deliverables for the phase

**How Claude Code Should Use Self-Assessment:**

1. **At Week Start:** Remind user of previous week's self-assessment completion
2. **During Week:** Reference self-assessment questions when teaching concepts
3. **At Week End:** Prompt user to complete checklist before moving forward
4. **If Struggling:** Use self-assessment questions to identify knowledge gaps

**Self-Assessment Questions in Learning Guides:**

Every learning guide includes a **"Self-Assessment Quiz"** section with:
- 5-10 questions testing key concepts
- Expandable `<details>` tags with answers
- Mix of explanation, application, and integration questions

**Example from guides:**
```markdown
## ✅ Self-Assessment Quiz

1. **What does the constructor do?**
   <details>
   <summary>Answer</summary>
   Runs once when contract is deployed. Sets initial state.
   </details>

2. **Why do we use `require()` in setGreeting?**
   <details>
   <summary>Answer</summary>
   To enforce access control. Only owner can change greeting.
   </details>
```

**Best Practices:**

✅ **Do:**
- Prompt user to complete self-assessment at week end
- Use questions to check understanding during teaching
- Encourage user to explain concepts in their own words
- Celebrate completion of self-assessments

❌ **Don't:**
- Give answers immediately (let user think first)
- Skip self-assessment even if user seems confident
- Move to next week without checklist completion
- Use self-assessment as "test" (it's learning tool, not exam)

**Template Available:**

For reference: `docs/week-completion-checklist-template.md`

## Development Environment

### Just-in-Time Installation Philosophy
Don't install everything upfront! Each week specifies what to install when needed. See COURSE_PLAN.md for the installation timeline:
- Week 1: Git, VS Code, Node.js v22.14.0+, Hardhat 3.0.8
- Week 2: Geth (Ethereum client)
- Week 3: (Hardhat already installed in Week 1)
- Week 4: PostgreSQL, Redis
- Week 6: React/Next.js
- Week 11: Go
- Week 15: PSD2 sandbox credentials (start early - takes time!)
- Week 17: Python
- Week 29: Docker

### Current Project Versions (as of Week 1)
**Core Tools:**
- Node.js: v22.14.0
- npm: 11.6.2
- Hardhat: 3.0.8 ⚠️ **Breaking changes from Hardhat 2.x**
- ethers.js: 6.15.0 ⚠️ **v6 has different API from v5**
- TypeScript: ~5.8.0
- Solidity: ^0.8.28

**Documentation Links:**
- Hardhat 3 Docs: https://hardhat.org/docs/getting-started (⚠️ Most tutorials use Hardhat 2.x - commands are different!)
- ethers.js v6 Docs: https://docs.ethers.org/v6/
- Solidity Docs: https://docs.soliditylang.org/en/v0.8.28/

**Key Hardhat 3 Breaking Changes:**
- ⚠️ Use `npx hardhat build` NOT `npx hardhat compile`
- ⚠️ Use `npx hardhat keystore` for secrets NOT `.env` files
- ⚠️ Tests must be TypeScript (.ts) NOT JavaScript (.js)
- ⚠️ Uses `configVariable()` for config NOT `dotenv`

### Key Commands

#### Blockchain Node Operations
```bash
# Run Ethereum node (Geth) on testnet
geth --sepolia --http --http.api eth,net,web3 --datadir ./data/geth

# Run Bitcoin node (Bitcoind) on testnet
bitcoind -testnet -datadir=./data/bitcoin
```

#### Smart Contract Development (Hardhat 3)
```bash
# ⚠️ HARDHAT 3 COMMANDS (different from Hardhat 2.x!)

# Build contracts (NOT compile!)
npx hardhat build

# Run tests
npx hardhat test

# Run single test file
npx hardhat test test/HelloFamily.test.ts

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "constructor args"

# Run local node
npx hardhat node

# Set configuration variables (secure keystore, NOT .env!)
npx hardhat keystore set --dev VARIABLE_NAME

# Force update existing variable
npx hardhat keystore set --dev --force VARIABLE_NAME

# List all keystore variables
npx hardhat keystore list
```

#### Database Operations
```bash
# PostgreSQL - Start database
pg_ctl start -D ./data/postgres

# Redis - Start cache server
redis-server

# Run database migrations
npm run migrate:up

# Rollback migration
npm run migrate:down
```

#### Service Development
```bash
# Node.js API Gateway
cd services/api-gateway
npm install
npm run dev          # Development mode with hot reload
npm test            # Run unit tests
npm run test:integration

# Go Event Listener
cd services/event-listener
go mod download
go run main.go
go test ./...       # Run all tests

# Python Analytics Service
cd services/analytics
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
pytest              # Run tests
```

#### Docker & DevOps
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f service-name

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up -d --build api-gateway
```

#### Testing
```bash
# Run all tests across the project
npm run test:all

# Unit tests only
npm run test:unit

# Integration tests (requires services running)
npm run test:integration

# E2E tests with bank sandboxes
npm run test:e2e

# Smart contract tests with coverage
npx hardhat coverage
```

#### Linting & Formatting
```bash
# Lint JavaScript/TypeScript
npm run lint
npm run lint:fix

# Lint Solidity contracts
npm run lint:contracts

# Format code
npm run format
```

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────┐
│   Family Dashboard (React/Next.js)  │
│   "Unified family finance view"     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      API Gateway (Node.js/TS)       │
│   "Routes & authentication"         │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼──────┐  ┌──▼──────────────┐
│  PSD2 Bridge │  │  Blockchain     │
│  Service     │  │  Service        │
│  (Node.js)   │  │  (Node.js/Go)   │
├──────────────┤  ├─────────────────┤
│ • CGD API    │  │ • Smart         │
│ • BCP API    │  │   Contracts     │
│ • Santander  │  │ • Web3.js       │
│ • Payment    │  │ • Event         │
│   Initiation │  │   Listeners     │
└──────┬───────┘  └────────┬────────┘
       │                    │
       │  ┌────────────┐   │
       └──► PostgreSQL ◄───┘
          │  + Redis   │
          └────────────┘
```

### Service Architecture

**Microservices Pattern**: Each service is independently deployable with its own:
- Dedicated responsibility (single responsibility principle)
- Database connection pool
- Error handling and logging
- Health check endpoints

**Services:**
1. **API Gateway** (Node.js/TypeScript): Entry point, authentication, rate limiting
2. **Blockchain Service** (Node.js/TypeScript): Web3 interactions, transaction management
3. **Event Listener** (Go): High-performance blockchain event monitoring
4. **Price Oracle** (Go): Fetches prices from DEXs (Uniswap, SushiSwap, Curve)
5. **PSD2 Bridge** (Node.js/TypeScript): Portuguese bank API integration
6. **Analytics** (Python): Data analysis, savings optimization, ML patterns

### Smart Contract Architecture

**Core Contracts:**
- `FamilyWallet.sol`: Basic multi-user wallet with access control
- `FamilyAllowance.sol`: Automated periodic distributions with time-locks
- `FamilySavingsPot.sol`: Multi-signature savings pool (m-of-n approvals)
- `FamilyToken.sol`: ERC-20 token with staking/rewards
- `FamilyLoan.sol`: Lending system with automated repayment schedules
- `FamilyDAO.sol`: Governance for expense approval with PSD2 payment initiation
- `CrossChainBridge.sol`: Lock-and-mint bridge for multi-chain transfers

**Smart Contract Patterns:**
- OpenZeppelin libraries for security (ReentrancyGuard, Ownable, Pausable)
- Upgradeable contracts using proxy patterns
- Events for all state changes (monitored by Go event listener)
- Gas-optimized storage (packed structs, minimal SLOAD operations)
- Time-based operations using block.timestamp

### Database Schema

**PostgreSQL Tables:**
- `family_members`: User profiles, roles, wallet addresses, bank IBANs (encrypted)
- `accounts`: Track balances (both crypto and fiat)
- `transactions`: Unified transaction history (blockchain + bank)
- `allowances`: Allowance schedules and distribution records
- `loans`: Loan terms, repayment schedules, credit history
- `governance_proposals`: Family voting proposals and results
- `psd2_consents`: Bank API consent tokens (encrypted)
- `liquidity_pools`: DEX pool reserves for price calculations

**Redis Keys:**
- `balance:{address}`: Cached wallet balances (TTL: 60s)
- `price:{token}:{currency}`: Exchange rates from oracles (TTL: 30s)
- `tx_pending:{hash}`: Pending transaction status
- `session:{userId}`: API session data
- PubSub channels: `blockchain:events`, `bank:transactions`

## Development Workflow

### Adding a New Feature

1. **Smart Contract Changes:**
   - Write contract in `contracts/`
   - Add tests in `test/`
   - Run `npx hardhat test`
   - Deploy to testnet: `npx hardhat run scripts/deploy.ts --network sepolia`
   - Verify on Etherscan
   - Update contract addresses in `.env`

2. **Backend Service:**
   - Update API endpoints in `services/api-gateway/routes/`
   - Add business logic in service layer
   - Write integration tests
   - Update database schema if needed (create migration)
   - Deploy via Docker

3. **Frontend:**
   - Create React components in `frontend/src/components/`
   - Add Web3 hooks for contract interaction
   - Test with MetaMask on testnet
   - Ensure mobile responsive

### Testing Strategy

**Smart Contracts:**
- Unit tests for all contract functions
- Test edge cases (zero values, unauthorized access, reentrancy)
- Gas optimization tests
- Upgrade path testing (if using proxies)

**Backend:**
- Unit tests: Mock external dependencies (Web3, PSD2 APIs)
- Integration tests: Use testnet and bank sandboxes
- E2E tests: Complete user flows (request loan → approval → repayment)

**Frontend:**
- Component tests with React Testing Library
- Web3 integration tests with testnet
- Visual regression testing for UI changes

## Portuguese Banking Integration (PSD2)

### Supported Banks
- **CGD (Caixa Geral de Depósitos)**: Primary test bank
- **Millennium BCP**: Secondary integration
- **Santander Portugal**: Alternative option
- **NovoBanco**: Future support

### PSD2 Service Configuration

Environment variables required:
```bash
# CGD Sandbox
CGD_CLIENT_ID=your_client_id
CGD_CLIENT_SECRET=your_secret
CGD_CERT_PATH=./certificates/cgd-cert.pem
CGD_KEY_PATH=./certificates/cgd-key.pem
CGD_SANDBOX_URL=https://sandbox.cgd.pt/v1

# Similar for BCP, Santander
```

### PSD2 Workflow
1. User initiates consent via frontend
2. OAuth2 redirect to bank's authorization server
3. User authenticates with bank
4. Bank redirects back with authorization code
5. Exchange code for access token
6. Store encrypted token in PostgreSQL
7. Use token for account info (AISP) or payment initiation (PISP)
8. Handle token refresh automatically

### Compliance Requirements
- **GDPR**: Encrypt all PII (IBANs, NIFs), provide data export
- **Banco de Portugal**: Report transactions >€10,000
- **AT (Tax Authority)**: Report crypto gains for IRS
- **PSD2**: 90-day consent expiry, strong customer authentication

## Multi-Chain Deployment

### Supported Networks
- **Ethereum Mainnet/Sepolia**: Primary chain
- **Polygon**: Low-cost transactions for micro-allowances
- **Arbitrum**: L2 for frequent transactions
- **BSC**: Alternative low-cost option

### Deployment Process
```bash
# Deploy to Polygon
npx hardhat run scripts/deploy.ts --network polygon

# Verify on Polygonscan
npx hardhat verify --network polygon CONTRACT_ADDRESS

# Update frontend configuration
# Update .env with new contract addresses per network
```

### Cross-Chain Bridge Usage
```javascript
// Lock tokens on Ethereum
await bridgeContract.lockTokens(amount, destinationChainId, recipientAddress);

// Event listener on destination chain picks up the lock event
// Relayer submits proof to destination bridge
// Bridge mints equivalent tokens on destination chain
```

## Security Considerations

### Smart Contracts
- All contracts inherit ReentrancyGuard for external calls
- Access control via OpenZeppelin's AccessControl
- Pausable pattern for emergency stops
- Time-locks on governance actions (24-48 hours)
- MEV protection: Use flashbots/private mempools for sensitive transactions
- Slippage protection: Set maximum acceptable slippage for DEX swaps

### Backend Services
- API keys required for all endpoints
- Rate limiting: 100 requests/minute per user
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- PII encryption at rest (AES-256)
- Secrets in environment variables, never in code

### PSD2 Security
- Certificate-based authentication (eIDAS)
- OAuth2 tokens encrypted in database
- Consent tokens expire after 90 days
- Bank credentials never stored
- HTTPS only, no HTTP fallback

## Monitoring & Debugging

### Logging
- **API Gateway**: Winston logger, log level from environment
- **Go Services**: Structured logging with logrus
- **Python Services**: Python logging module
- **Smart Contracts**: Events for all state changes

### Metrics (Grafana)
- Transaction success/failure rates
- Gas costs per operation
- API response times
- Database query performance
- PSD2 API uptime
- DEX price feed freshness

### Debugging Smart Contracts
```bash
# Use Hardhat console
npx hardhat console --network sepolia

# Check transaction status
await ethers.provider.getTransactionReceipt(txHash)

# Check events
const events = await contract.queryFilter(contract.filters.AllowanceDistributed())

# Simulate transaction before sending
await contract.callStatic.distributeAllowance(childAddress)
```

## DeFi Integration

### Liquidity Pool Monitoring
The price oracle service (Go) monitors liquidity pools to fetch real-time prices:
- Uniswap V2/V3 pools for Ethereum
- SushiSwap for alternative pricing
- Curve for stablecoin pairs

**Constant Product Formula (x * y = k):**
Used for simple price calculations from pool reserves.

### Staking Mechanics
FamilyToken includes staking for educational purposes:
- Lock tokens for defined periods
- Earn rewards based on time and amount
- Teaches kids about compound interest

## Common Issues & Solutions

### Issue: Transaction Stuck in Mempool
**Solution:** Increase gas price and resubmit, or use `eth_sendRawTransaction` with same nonce and higher gas.

### Issue: PSD2 Consent Expired
**Solution:** Automatic refresh flow implemented in `psd2-service/consent-manager.ts`. If refresh fails, prompt user for re-consent.

### Issue: Cross-Chain Bridge Stuck
**Solution:** Check relayer service logs. Manually submit proof if relayer is down.

### Issue: Smart Contract Upgrade Needed
**Solution:** Follow upgrade procedure in `docs/upgrade-guide.md`. Test thoroughly on testnet first.

### Issue: Documentation Version Mismatch
**Solution:**
1. Use context7 to query version-specific documentation
2. Check "Current Project Versions" section in CLAUDE.md
3. Verify user isn't following outdated tutorials
4. Example: Hardhat 3 vs Hardhat 2, ethers.js v6 vs v5
5. Provide corrected code pattern from official docs

### Issue: Frontend Not Behaving as Expected (Week 6+)
**Solution:**
1. Use playwright to navigate to the UI
2. Use chrome-devtools to inspect console/network/state
3. Identify exact error or unexpected behavior
4. Use context7 to verify React/Web3 API if needed
5. Provide specific fix based on inspection results

## Learning Resources

### Foundational Reading (in /assets)
- **Bitcoin Book** (`assets/bitcoinbook-develop/`): Blockchain fundamentals, transactions, wallets, security
- **Ethereum Book** (`assets/ethereumbook-develop/`): Solidity, smart contracts, DApps, EVM, tokens

### Course Structure
See `COURSE_PLAN.md` for the complete 30-week course:
- **Standard Track:** 30 weeks at 15-20 hours/week (~7.5 months)
- **Intensive Track:** 30 weeks at 30-40 hours/week (~7.5 months with optional modules)
- **Extended Track:** 40 weeks at 10-15 hours/week (~10 months)

### Buffer Weeks
The course includes 4 buffer weeks for consolidation, catch-up, and integration:
- **Week 8:** After blockchain foundation
- **Week 14:** After Go services, before PSD2
- **Week 21:** After Python and governance features
- **Week 28:** Before final production deployment

### Key Documentation
- `first_thought.md`: Original project ideation and pivot to family finance
- `learning_notes.md`: Master index with pre-course planning and course structure decisions
- `docs/weekN-learning-notes.md`: Week-by-week session notes and learning insights
- `course_critique.md`: Professional course builder review and recommendations (led to 30-week restructure)

## Development Phases (30 Weeks)

### Phase 1: Blockchain Foundation (Weeks 1-8)
- Environment setup and blockchain theory
- Running Ethereum node (Geth)
- Database design (PostgreSQL + Redis)
- Smart contract fundamentals (Solidity + Hardhat)
- **Frontend basics (React + MetaMask) - Week 6**
- Web3 integration (Ethers.js/Web3.js)
- **Buffer Week 8:** Integration and review

### Phase 2: Core Platform (Weeks 9-16)
- Allowance system (smart contract + UI)
- Go fundamentals and microservices
- Event listener and price oracle (Go)
- API gateway (Express + authentication)
- **Buffer Week 14:** Service integration
- **PSD2 banking integration** (OAuth2, account info, payment initiation)

### Phase 3: Advanced Features (Weeks 17-24)
- Python fundamentals and analytics
- Banking features (round-ups, spending analysis)
- Multi-sig wallet implementation
- Family governance DAO
- **Buffer Week 21:** Feature integration
- Token economy (ERC-20 + staking)
- Multi-chain deployment (Ethereum + Polygon)
- Stablecoin and cross-border transfers

### Phase 4: Production (Weeks 25-30)
- Lending and credit system
- Security auditing and MEV protection
- Comprehensive testing (unit, integration, e2e)
- **Buffer Week 28:** Production prep
- DevOps (Docker, CI/CD, monitoring)
- Portuguese compliance + portfolio presentation

### Optional Advanced Modules (Post-Course)
- **Module A:** Liquidity pools & AMM mechanics (Uniswap model)
- **Module B:** Cross-chain bridge implementation
- **Module C:** Advanced GraphQL & WebSockets
- **Module D:** Frontend polish (Redux, PWA, accessibility)

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes

### Commit Messages
Follow conventional commits:
```
feat(contracts): add multi-sig wallet implementation
fix(api): resolve CORS issue in PSD2 endpoints
docs(readme): update deployment instructions
test(allowance): add edge case for zero amounts
```

## Environment Variables

Required `.env` file structure:
```bash
# Blockchain
INFURA_API_KEY=
PRIVATE_KEY=
ETHERSCAN_API_KEY=

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/familychain
REDIS_URL=redis://localhost:6379

# PSD2 Banks
CGD_CLIENT_ID=
BCP_CLIENT_ID=
SANTANDER_CLIENT_ID=

# Services
API_PORT=3000
EVENT_LISTENER_PORT=3001
ORACLE_PORT=3002

# Security
JWT_SECRET=
ENCRYPTION_KEY=

# Network IDs
ETHEREUM_MAINNET=1
POLYGON_MAINNET=137
ARBITRUM_MAINNET=42161
```

## Contributing to the Project

When adding features:
1. Update smart contracts if needed
2. Write comprehensive tests
3. Update database schema (with migrations)
4. Document API changes in OpenAPI spec
5. Update CLAUDE.md if architecture changes
6. Test on testnet before mainnet deployment

## Final Notes

This project is designed as both a learning journey and a production-ready platform. Every component should be:
- **Educational**: Code includes comments explaining blockchain/DeFi concepts
- **Production-quality**: Follow best practices, comprehensive testing, security-first
- **Portfolio-worthy**: Well-documented, deployed, demonstrable

Focus on understanding **why** things work, not just **how** to make them work. Each week builds on previous knowledge, so complete them in order for best results.

### Course Design Philosophy

**30-Week Structure:** Based on professional course builder feedback, the course was extended from 20 to 30 weeks to provide realistic pacing (450-600 total hours instead of trying to fit 600-800 hours into 300-400).

**Early Visual Feedback:** Frontend development was moved from Week 17 to Week 6 to provide early wins and visual progress, crucial for maintaining motivation.

**Language Sequencing:** Go (Weeks 11-12) and Python (Weeks 17-18) are separated by 5 weeks to prevent context-switching fatigue while maintaining the polyglot skillset valuable for blockchain development.

**Core vs Optional:** Advanced DeFi topics (liquidity pools, AMMs, cross-chain bridges) are marked as optional post-course modules, keeping the 30-week core achievable while allowing for deeper specialization later.

**Target Outcome:** This course prepares you for **junior blockchain developer roles** with practical experience in Ethereum, Solidity, multi-chain deployment, PSD2 banking integration, and production DevOps practices.
