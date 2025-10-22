# Week Completion Checklist Template
## Use this when adding new weeks to COURSE_PLAN.md

---

## Standard Week Completion Checklist Format

Add this section after the "Learning Guides" section for each week:

```markdown
**Week X Completion Checklist:**

Before moving to Week X+1, complete the self-assessment:

- [ ] **Class X.1 Quiz:** Complete all questions in [Class Name] guide
  - [Sample key question from the guide]
  - [Sample key question from the guide]
  - [Sample key question from the guide]

- [ ] **Class X.2 Quiz:** Complete all questions in [Class Name] guide
  - [Sample key question from the guide]
  - [Sample key question from the guide]

- [ ] **Class X.3 Quiz:** (if applicable)
  - [Sample key questions]

- [ ] **Deliverables Verified:**
  - ✅ [Specific deliverable 1]
  - ✅ [Specific deliverable 2]
  - ✅ [Specific deliverable 3]

- [ ] **Reading Completed:**
  - ✅ Bitcoin Book: Chapter X (Topic)
  - ✅ Ethereum Book: Chapter Y (Topic)

**If you can answer all self-assessment questions confidently, you're ready for Week X+1!**
```

---

## Buffer Week Self-Assessment Format

For buffer weeks (8, 14, 21, 28), use this format:

```markdown
**Phase X Self-Assessment Review:**

Use this buffer week to review all self-assessment quizzes from Weeks X-Y:

- [ ] **Week X:** [Brief topic description]
- [ ] **Week Y:** [Brief topic description]
- [ ] **Week Z:** [Brief topic description]

**Comprehension Check:**
- [Key understanding question for phase]
- [Integration question across multiple weeks]
- [Practical application question]

**If any concepts are unclear, this is the week to clarify them before [next phase/topic]!**
```

---

## Examples

### Regular Week Example (Week 1)

```markdown
**Week 1 Completion Checklist:**

Before moving to Week 2, complete the self-assessment:

- [ ] **Class 1.1 Quiz:** Complete all questions in Environment Setup guide
  - Can you explain what Git is and why you need it?
  - What's the difference between Node.js and npm?
  - Why does version compatibility matter?

- [ ] **Class 1.2 Quiz:** Complete all questions in Blockchain Theory guide
  - Can you explain how blockchains work in your own words?
  - What's the difference between Bitcoin and Ethereum?
  - Why does gas exist on Ethereum?

- [ ] **Class 1.3 Quiz:** Complete all questions in First Smart Contract guide
  - What does the constructor do?
  - Why do we use `require()` in setGreeting?
  - What's the difference between `view` and regular functions?

- [ ] **Deliverables Verified:**
  - ✅ All tools installed and verified
  - ✅ HelloFamily.sol deployed to Sepolia
  - ✅ All 5 tests passing
  - ✅ Contract address recorded

- [ ] **Reading Completed:**
  - ✅ Bitcoin Book: Chapters 1-2
  - ✅ Ethereum Book: Chapters 1-2

**If you can answer all self-assessment questions confidently, you're ready for Week 2!**
```

### Buffer Week Example (Week 8)

```markdown
**Phase 1 Self-Assessment Review:**

Use this buffer week to review all self-assessment quizzes from Weeks 1-7:

- [ ] **Week 1:** Environment, blockchain theory, first smart contract
- [ ] **Week 2:** Ethereum node operations, testnet interactions
- [ ] **Week 3:** Wallets, transactions, blockchain queries
- [ ] **Week 4:** Database design, PostgreSQL, Redis
- [ ] **Week 5:** Smart contract foundations (Part 1)
- [ ] **Week 6:** Gas optimization, security basics, frontend
- [ ] **Week 7:** Web3 integration, event listening

**Comprehension Check:**
- Can you explain Phase 1 concepts to someone else?
- Have you completed all Phase 1 reading assignments?
- Are all Phase 1 deliverables working?

**If any concepts are unclear, this is the week to clarify them before Phase 2!**
```

---

## Guidelines for Creating Checklists

### 1. Select Key Questions

From each learning guide's self-assessment section:
- Choose 2-4 most important questions
- Focus on core concepts that apply to future weeks
- Include questions that test understanding, not just memorization

### 2. List Concrete Deliverables

Be specific about what should be completed:
- ✅ Code deployed and working
- ✅ Tests passing with specific metrics
- ✅ Files created in specific locations
- ✅ Tools installed and configured

### 3. Reference Reading Material

List the specific chapters assigned for that week:
- Bitcoin Book chapters (for fundamentals)
- Ethereum Book chapters (for implementation)

### 4. Make It Actionable

Use checkboxes `- [ ]` so the user can:
- Track progress
- Mark completion
- See what's remaining

### 5. Include Motivational Framing

End with positive reinforcement:
- "If you can answer all questions confidently, you're ready for Week X!"
- "This is the week to clarify concepts before [next major topic]!"

---

## When to Add Checklists

### Regular Weeks

Add checklist **after the "Learning Guides" section** for each week:

```
**Reading:**
- Bitcoin Book: ...

**Deliverable:** ...

**Early Win:** (if applicable)

**Learning Guides:**
- 📖 Class X.1
- 📖 Class X.2

**Week X Completion Checklist:**  ← ADD HERE
[checklist content]

---

#### Week X+1: Next Week
```

### Buffer Weeks

Add self-assessment review **after the "Deliverable" section**:

```
**Deliverable:** ...

**Phase X Self-Assessment Review:**  ← ADD HERE
[review content]

---

### PHASE X+1: Next Phase
```

---

## Automation Tip

When creating learning guides at the end of each week:

1. Review the self-assessment questions in the guides
2. Select 2-4 key questions per class
3. Use this template to create the checklist
4. Add to COURSE_PLAN.md for that week
5. Update buffer week checklists if needed

---

## Current Status

**Weeks with Checklists:**
- ✅ Week 1 (Classes 1.1, 1.2, 1.3)
- ✅ Week 8 (Buffer - Phase 1 Review)
- ✅ Week 14 (Buffer - Phase 2 Part 1 Review)
- ✅ Week 21 (Buffer - Phase 3 Part 1 Review)
- ✅ Week 27 (Class 27.1)
- ✅ Week 28 (Buffer - Phase 4 Pre-Production Review)

**Remaining:**
- 🔜 Weeks 2-7, 9-13, 15-20, 22-26, 29-30 (to be added as learning guides are created)

---

**Last Updated:** 2025-10-22
**Purpose:** Standardize week completion checklists across the course
**Location:** `docs/week-completion-checklist-template.md`
