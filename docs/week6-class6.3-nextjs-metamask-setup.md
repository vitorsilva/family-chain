# Week 6 - Class 6.3: Next.js + MetaMask Setup

**Duration:** 4-5 hours
**Prerequisites:** Week 5 complete (FamilyWallet deployed), Classes 6.1-6.2 complete

---

## Overview

So far, you've interacted with your smart contracts through command-line scripts and tests. Real users need a web interface. In this class, you'll build a modern React-based frontend using **Next.js 15**, the industry standard for Web3 DApps.

**Why Next.js for Web3?**
- ✅ **Industry standard**: Uniswap, Aave, and major DApps use Next.js
- ✅ **TypeScript native**: Full type safety across your stack
- ✅ **App Router**: Modern file-based routing
- ✅ **Fast development**: Hot Module Replacement (HMR) for instant updates
- ✅ **SEO-friendly**: Server-Side Rendering for landing pages
- ✅ **API routes**: Can serve backend endpoints if needed

By the end of this class, you'll have a working DApp UI that connects to MetaMask and displays your wallet information.

---

## Learning Objectives

By the end of this class, you will be able to:

1. ✅ Create a Next.js 15 project with TypeScript
2. ✅ Configure Tailwind CSS for styling
3. ✅ Install and configure MetaMask browser extension
4. ✅ Detect MetaMask in the browser
5. ✅ Connect a wallet using ethers.js v6
6. ✅ Read wallet address and ETH balance
7. ✅ Manage wallet state with Zustand
8. ✅ Handle account and network changes
9. ✅ Build a "Connect Wallet" button component

---

## Key Concepts

### 1. Next.js App Router vs Pages Router

Next.js 15 offers two routing paradigms:

**Pages Router** (older):
- Files in `pages/` directory
- Each file = a route (`pages/index.tsx` → `/`)
- Simple but less flexible

**App Router** (new, recommended):
- Files in `app/` directory
- Folder-based routes (`app/dashboard/page.tsx` → `/dashboard`)
- Layouts, loading states, error boundaries built-in
- Server Components by default (performance)

**For this course:** We'll use App Router (modern, industry-standard).

---

### 2. MetaMask as a Web3 Provider

**MetaMask** is a browser extension that:
- Stores your Ethereum private keys securely
- Injects `window.ethereum` into web pages
- Provides a standardized API (EIP-1193)
- Signs transactions without exposing private keys

**Architecture:**
```
Your DApp (React) → window.ethereum (MetaMask) → Ethereum Network
```

**Key API methods:**
```javascript
// Request accounts (triggers MetaMask popup)
await window.ethereum.request({ method: 'eth_requestAccounts' })

// Get current network
await window.ethereum.request({ method: 'eth_chainId' })

// Sign transaction (MetaMask handles this)
await window.ethereum.request({ method: 'eth_sendTransaction', params: [...] })
```

---

### 3. ethers.js v6 Browser Provider

**ethers.js** provides a clean TypeScript API over MetaMask:

**v5 (old):**
```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum)
```

**v6 (current):**
```javascript
const provider = new ethers.BrowserProvider(window.ethereum)
```

**Key difference:** `BrowserProvider` instead of `Web3Provider`.

---

### 4. State Management with Zustand

**Why Zustand?**
- Lightweight (~1KB)
- Simple API (less boilerplate than Redux)
- TypeScript-first
- React hooks-based
- You have experience with it from another project!

**Wallet state we'll manage:**
```typescript
interface WalletState {
  address: string | null;           // Connected address (or null)
  balance: string;                  // ETH balance in wei
  isConnected: boolean;             // Connection status
  isConnecting: boolean;            // Loading state
  chainId: string | null;           // Current network
  connect: () => Promise<void>;     // Action: connect wallet
  disconnect: () => void;           // Action: disconnect
}
```

---

### 5. Network Detection (Sepolia vs Mainnet)

**Chain IDs:**
- Mainnet: `0x1` (1 in decimal)
- Sepolia: `0xaa36a7` (11155111 in decimal)
- Polygon: `0x89` (137 in decimal)

**Why it matters:** Your FamilyWallet is deployed on Sepolia. Users must switch networks.

**Checking network:**
```javascript
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
if (chainId !== '0xaa36a7') {
  alert('Please switch to Sepolia testnet');
}
```

---

## Hands-On Activities

### Activity 1: Install MetaMask

**Goal:** Set up MetaMask browser extension.

**Step 1:** Go to https://metamask.io/

**Step 2:** Click "Download" → Choose your browser (Chrome, Firefox, Brave, Edge)

**Step 3:** Install the extension from your browser's extension store

**Step 4:** Open MetaMask:
- Click the fox icon in your browser toolbar
- Click "Create a new wallet" (or "Import wallet" if you have a seed phrase)
- Set a strong password
- **CRITICAL:** Save your 12-word recovery phrase securely
  - ⚠️ **NEVER share this phrase with anyone!**
  - ⚠️ **Write it down on paper** (don't save digitally)
  - ⚠️ **Losing it = losing all funds forever**

**Step 5:** Confirm you've saved the phrase (MetaMask will quiz you)

**Step 6:** Switch to Sepolia testnet:
- Click the network dropdown (top-left, says "Ethereum Mainnet")
- Enable "Show test networks" in Settings > Advanced
- Select "Sepolia test network"

**Step 7:** Verify you have testnet ETH:
- Your address should show ~0.799 SepoliaETH (from Week 2)
- If not, use faucet: https://sepoliafaucet.com/

**Expected output:** MetaMask installed, Sepolia selected, balance visible

---

### Activity 2: Create Next.js 15 Project

**Goal:** Initialize a new Next.js project with TypeScript and Tailwind.

**Step 1:** Navigate to your parent directory:

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain
```

**Step 2:** Create Next.js project:

```powershell
npx create-next-app@latest family-wallet-ui
```

**Interactive prompts - choose these options:**
```
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like your code inside a `src/` directory? ... No
√ Would you like to use App Router? ... Yes
√ Would you like to use Turbopack for `next dev`? ... Yes
√ Would you like to customize the import alias (@/* by default)? ... No
```

**Step 3:** Navigate into the project:

```powershell
cd family-wallet-ui
```

**Step 4:** Verify installation:

```powershell
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.1.8
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.1s
```

**Step 5:** Open browser: http://localhost:3000

**Expected:** Default Next.js welcome page

**Step 6:** Stop the server: `Ctrl+C`

---

### Activity 3: Install Dependencies

**Goal:** Add ethers.js v6 and Zustand for wallet management.

**Step 1:** Install ethers.js v6:

```powershell
npm install ethers@6.15.0
```

**Step 2:** Install Zustand:

```powershell
npm install zustand
```

**Step 3:** Verify package.json:

```powershell
cat package.json
```

**Expected (dependencies section):**
```json
"dependencies": {
  "ethers": "^6.15.0",
  "zustand": "^5.0.8",
  "next": "15.1.8",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

---

### Activity 4: Create Zustand Wallet Store

**Goal:** Set up global state management for wallet connection.

**Step 1:** Create store directory:

```powershell
mkdir store
```

**Step 2:** Create wallet store file:

```powershell
New-Item -Path "store\useWalletStore.ts" -ItemType File
```

**Step 3:** Add the following code to `store/useWalletStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';

// Define wallet state interface
interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
}

// Create Zustand store with persistence
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      address: null,
      balance: '0',
      isConnected: false,
      isConnecting: false,
      chainId: null,

      // Connect wallet action
      connect: async () => {
        set({ isConnecting: true });

        try {
          // Check if MetaMask is installed
          if (typeof window.ethereum === 'undefined') {
            alert('MetaMask is not installed. Please install it to use this DApp.');
            set({ isConnecting: false });
            return;
          }

          // Create provider (ethers v6 syntax)
          const provider = new ethers.BrowserProvider(window.ethereum);

          // Request accounts (triggers MetaMask popup)
          const accounts = await provider.send('eth_requestAccounts', []);
          const address = accounts[0];

          // Get network chain ID
          const network = await provider.getNetwork();
          const chainId = '0x' + network.chainId.toString(16);

          // Get balance
          const balanceWei = await provider.getBalance(address);
          const balance = ethers.formatEther(balanceWei);

          // Update state
          set({
            address,
            balance,
            isConnected: true,
            isConnecting: false,
            chainId,
          });

          console.log('Wallet connected:', address);
          console.log('Balance:', balance, 'ETH');
          console.log('Chain ID:', chainId);
        } catch (error: any) {
          console.error('Connection error:', error);
          set({ isConnecting: false });

          if (error.code === 4001) {
            alert('Connection rejected by user');
          } else {
            alert('Failed to connect wallet: ' + error.message);
          }
        }
      },

      // Disconnect wallet action
      disconnect: () => {
        set({
          address: null,
          balance: '0',
          isConnected: false,
          chainId: null,
        });
        console.log('Wallet disconnected');
      },

      // Update balance action
      updateBalance: async () => {
        const { address } = get();
        if (!address || typeof window.ethereum === 'undefined') return;

        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(address);
          const balance = ethers.formatEther(balanceWei);
          set({ balance });
        } catch (error) {
          console.error('Failed to update balance:', error);
        }
      },
    }),
    {
      name: 'wallet-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        address: state.address,
        isConnected: state.isConnected,
        chainId: state.chainId,
      }),
    }
  )
);
```

**Key points:**
- Uses `ethers.BrowserProvider` (v6 syntax)
- Persists connection across page refreshes
- Handles MetaMask not installed
- Provides actions for connect/disconnect/updateBalance

---

### Activity 5: Create Connect Wallet Button Component

**Goal:** Build a reusable button component for wallet connection.

**Step 1:** Create components directory:

```powershell
mkdir components
```

**Step 2:** Create button component:

```powershell
New-Item -Path "components\ConnectWalletButton.tsx" -ItemType File
```

**Step 3:** Add the following code to `components/ConnectWalletButton.tsx`:

```typescript
'use client'; // Mark as Client Component (uses hooks)

import { useWalletStore } from '@/store/useWalletStore';

export default function ConnectWalletButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWalletStore();

  // Format address: 0x1234...5678
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {isConnected && address ? (
        <>
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-mono text-sm">
            {formatAddress(address)}
          </div>
          <button
            onClick={disconnect}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
```

**Key features:**
- Shows "Connect Wallet" when disconnected
- Shows formatted address when connected
- "Disconnect" button when connected
- Loading state during connection
- Tailwind CSS styling

---

### Activity 6: Create Wallet Info Component

**Goal:** Display wallet balance and network information.

**Step 1:** Create wallet info component:

```powershell
New-Item -Path "components\WalletInfo.tsx" -ItemType File
```

**Step 2:** Add the following code to `components/WalletInfo.tsx`:

```typescript
'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { useEffect } from 'react';

export default function WalletInfo() {
  const { address, balance, chainId, isConnected, updateBalance } = useWalletStore();

  // Update balance every 10 seconds
  useEffect(() => {
    if (!isConnected) return;

    updateBalance(); // Initial load
    const interval = setInterval(updateBalance, 10000);
    return () => clearInterval(interval);
  }, [isConnected, updateBalance]);

  // Network name lookup
  const getNetworkName = (chainId: string | null): string => {
    if (!chainId) return 'Unknown';
    const id = parseInt(chainId, 16);
    switch (id) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 137:
        return 'Polygon';
      default:
        return `Chain ID: ${id}`;
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg text-center text-gray-500">
        Connect your wallet to see details
      </div>
    );
  }

  const isCorrectNetwork = chainId === '0xaa36a7'; // Sepolia

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Wallet Information</h2>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Address:</span>
          <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
            {address}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Balance:</span>
          <span className="font-bold text-xl text-blue-600">
            {parseFloat(balance).toFixed(4)} ETH
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Network:</span>
          <span
            className={`px-3 py-1 rounded font-semibold ${
              isCorrectNetwork
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {getNetworkName(chainId)}
          </span>
        </div>

        {!isCorrectNetwork && (
          <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
            <p className="font-semibold">⚠️ Wrong Network</p>
            <p className="text-sm mt-1">
              Please switch to Sepolia Testnet in MetaMask to use this DApp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Key features:**
- Displays address, balance, network
- Auto-updates balance every 10 seconds
- Warns if user is on wrong network
- Styled with Tailwind CSS

---

### Activity 7: Update Home Page

**Goal:** Replace default Next.js page with our wallet UI.

**Step 1:** Open `app/page.tsx`

**Step 2:** Replace entire content with:

```typescript
import ConnectWalletButton from '@/components/ConnectWalletButton';
import WalletInfo from '@/components/WalletInfo';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            FamilyChain DApp
          </h1>
          <p className="text-lg text-gray-600">
            Decentralized Family Finance Platform
          </p>
        </div>

        {/* Connect Wallet Section */}
        <div className="flex justify-center">
          <ConnectWalletButton />
        </div>

        {/* Wallet Info Section */}
        <WalletInfo />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Built with Next.js 15, ethers.js v6, and Zustand</p>
          <p className="mt-1">FamilyWallet Contract: Sepolia Testnet</p>
        </div>
      </div>
    </main>
  );
}
```

---

### Activity 8: Handle Account/Network Changes

**Goal:** React to MetaMask account or network changes.

**Step 1:** Create a client-side effect handler.

**Update `app/layout.tsx`** to include MetaMask listeners:

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FamilyChain DApp',
  description: 'Decentralized Family Finance Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Step 2:** Create a MetaMask event listener component:

```powershell
New-Item -Path "components\MetaMaskListener.tsx" -ItemType File
```

**Add to `components/MetaMaskListener.tsx`:**

```typescript
'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/store/useWalletStore';

export default function MetaMaskListener() {
  const { address, connect, disconnect } = useWalletStore();

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected all accounts
        disconnect();
      } else if (accounts[0] !== address) {
        // User switched account
        connect();
      }
    };

    // Handle network changes
    const handleChainChanged = () => {
      // Reload the page on network change (recommended by MetaMask)
      window.location.reload();
    };

    // Subscribe to events
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Cleanup
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, connect, disconnect]);

  return null; // This component doesn't render anything
}
```

**Step 3:** Import listener in `app/page.tsx` (add at top of component):

```typescript
import MetaMaskListener from '@/components/MetaMaskListener';

export default function Home() {
  return (
    <>
      <MetaMaskListener />
      <main className="min-h-screen...">
        {/* existing code */}
      </main>
    </>
  );
}
```

---

### Activity 9: Test Your DApp

**Goal:** Verify everything works end-to-end.

**Step 1:** Start the development server:

```powershell
npm run dev
```

**Step 2:** Open browser: http://localhost:3000

**Expected UI:**
- Title: "FamilyChain DApp"
- Blue "Connect Wallet" button
- "Connect your wallet to see details" message

**Step 3:** Click "Connect Wallet"

**Expected MetaMask popup:**
- Lists your accounts
- Shows permissions requested
- "Next" → "Connect" buttons

**Step 4:** Approve connection in MetaMask

**Expected result:**
- Button changes to formatted address + "Disconnect"
- Wallet Info appears with:
  - Your address
  - Your Sepolia ETH balance (~0.799 ETH)
  - Network: "Sepolia Testnet" (green)

**Step 5:** Test network detection:
- Switch MetaMask to "Ethereum Mainnet"
- Page should reload (due to chainChanged listener)
- Reconnect wallet
- Should see red "Wrong Network" warning

**Step 6:** Switch back to Sepolia:
- Change network in MetaMask to Sepolia
- Page reloads
- Green "Sepolia Testnet" indicator

**Step 7:** Test disconnect:
- Click "Disconnect" button
- UI resets to initial state
- Wallet info disappears

**Success!** Your DApp UI is working.

---

## Expected Outputs

By the end of this class, you should have:

1. ✅ Next.js 15 project running on localhost:3000
2. ✅ MetaMask installed and configured
3. ✅ Zustand store managing wallet state
4. ✅ Connect Wallet button functional
5. ✅ Wallet information displayed (address, balance, network)
6. ✅ Network detection working (Sepolia vs others)
7. ✅ Account/network change handlers working
8. ✅ Modern UI with Tailwind CSS

---

## Common Issues & Solutions

### Issue 1: "window.ethereum is undefined"

**Symptoms:** Error when trying to connect wallet

**Solution:**
- Ensure MetaMask is installed
- Refresh the page after installing MetaMask
- Check browser console for MetaMask conflicts (other wallet extensions)

---

### Issue 2: Connection Rejected

**Symptoms:** MetaMask popup closes without connecting

**Solution:**
- User clicked "Cancel" - this is expected behavior
- Try again and click "Connect" in MetaMask popup
- Check if MetaMask is locked (unlock with password)

---

### Issue 3: Balance Shows 0.0000 ETH

**Symptoms:** Connected but balance is zero

**Solution:**
- Verify you're on Sepolia network (not mainnet)
- Check balance directly in MetaMask
- Get testnet ETH from faucet: https://sepoliafaucet.com/

---

### Issue 4: TypeScript Errors on window.ethereum

**Symptoms:** `Property 'ethereum' does not exist on type 'Window'`

**Solution:** Create `types/window.d.ts`:

```typescript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export {};
```

---

### Issue 5: Page Not Reloading on Network Change

**Symptoms:** Network changes but UI doesn't update

**Solution:**
- Check MetaMaskListener component is imported in page.tsx
- Verify event listeners are attached (check browser console for errors)
- Manually refresh page as fallback

---

## Self-Assessment Quiz

### Question 1: Next.js App Router
**Q:** What's the file path for the homepage in Next.js App Router?
<details>
<summary>Click to reveal answer</summary>

**A:** `app/page.tsx` (or `app/page.js`)

In App Router, `app/` is the root, and `page.tsx` defines the route content.
</details>

---

### Question 2: BrowserProvider
**Q:** What's the ethers.js v6 syntax for creating a browser provider?
<details>
<summary>Click to reveal answer</summary>

**A:**
```typescript
const provider = new ethers.BrowserProvider(window.ethereum);
```

**NOT** `Web3Provider` (that's v5).
</details>

---

### Question 3: Requesting Accounts
**Q:** What method triggers the MetaMask "Connect" popup?
<details>
<summary>Click to reveal answer</summary>

**A:**
```typescript
await provider.send('eth_requestAccounts', []);
```

Or directly: `await window.ethereum.request({ method: 'eth_requestAccounts' })`
</details>

---

### Question 4: Sepolia Chain ID
**Q:** What's the chain ID for Sepolia testnet (in hex)?
<details>
<summary>Click to reveal answer</summary>

**A:** `0xaa36a7` (11155111 in decimal)

**Mainnet:** `0x1` (1)
**Polygon:** `0x89` (137)
</details>

---

### Question 5: Zustand Persistence
**Q:** What Zustand middleware enables localStorage persistence?
<details>
<summary>Click to reveal answer</summary>

**A:** `persist` middleware

```typescript
persist(
  (set, get) => ({ /* state */ }),
  { name: 'wallet-storage' }
)
```

This saves state to `localStorage` with key "wallet-storage".
</details>

---

### Question 6: Client Components
**Q:** Why do we use `'use client'` at the top of component files?
<details>
<summary>Click to reveal answer</summary>

**A:** Next.js 15 App Router uses **Server Components** by default. Components that use:
- React hooks (`useState`, `useEffect`)
- Browser APIs (`window`, `document`)
- Event handlers (`onClick`)

Must be marked as Client Components with `'use client'`.
</details>

---

### Question 7: Account Changes
**Q:** What MetaMask event fires when the user switches accounts?
<details>
<summary>Click to reveal answer</summary>

**A:** `accountsChanged`

```typescript
window.ethereum.on('accountsChanged', (accounts: string[]) => {
  // Handle account switch
});
```
</details>

---

## Key Takeaways

### Most Important Concepts

1. **Next.js 15 App Router** is the modern standard for Web3 DApps
2. **MetaMask injects window.ethereum** - this is your gateway to Ethereum
3. **ethers.js v6 uses BrowserProvider** (not Web3Provider)
4. **Zustand provides lightweight state management** with persistence
5. **Always handle MetaMask events** (accountsChanged, chainChanged)
6. **Network detection is critical** - users must be on the right chain
7. **'use client' marks Client Components** in Next.js App Router

### UI/UX Best Practices

| Best Practice | Why |
|---------------|-----|
| Show loading states | User knows connection is in progress |
| Format addresses | `0x1234...5678` is more readable than full address |
| Detect wrong network | Prevent transactions on wrong chain |
| Handle MetaMask not installed | Provide clear instructions |
| Auto-update balance | Keep UI in sync with blockchain |
| Graceful disconnect | Allow users to disconnect easily |

---

## Reading Assignments

To understand the web3 ecosystem better, read:

### Ethereum Book
- **Chapter 3:** Ethereum Clients
  - Section: "Remote Clients" (MetaMask architecture)
  - Section: "Web3.js and Ethers.js" (library comparison)
- **Chapter 12:** Decentralized Applications (DApps)
  - Section: "DApp Architecture" (frontend + backend + blockchain)
  - Section: "Web3 Provider and Injected Providers" (MetaMask integration)
  - Section: "DApp Frontend Frameworks" (React/Next.js for Web3)
- **Appendix:** Web3.js Tutorial
  - Section: "Connecting to Ethereum" (provider patterns)
  - Section: "Accounts and Wallets" (address management)

**Why these chapters?**
- Chapter 3 explains MetaMask's role as a "light client"
- Chapter 12 is the **definitive guide** to DApp architecture
- Understanding provider patterns is critical for frontend dev

---

## Next Steps

**Class 6.4: Interacting with FamilyWallet Contract** (~3-4 hours)
- Load FamilyWallet ABI
- Create contract instance in browser
- Read contract state (members, balances)
- Deposit ETH via UI
- Withdraw ETH via UI
- Transaction confirmation UX

**Prerequisites for Next Class:**
- ✅ Next.js DApp running
- ✅ MetaMask connected
- ✅ Balance visible in UI
- ✅ Understanding of wallet state management

---

**Class 6.3 Complete!** You have a working Web3 frontend that connects to MetaMask!

**Next:** Time to interact with your FamilyWallet smart contract from the UI - the full DApp experience!

---

**Early Win:** You just built a real DApp UI! Open http://localhost:3000, connect your wallet, and see your address and balance. This is what users see in production DApps like Uniswap and Aave!
