  // blockchain/services/EventListenerService.ts
  import { ethers, EventLog, Contract } from "ethers";
  import pkg from "pg";

  // Fix: Import Pool type correctly
  type Pool = InstanceType<typeof pkg.Pool>;

  export interface EventListenerConfig {
    contractAddress: string;
    contractABI: any[];
    eventNames: string[];
    dbConfig: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
    };
  }

  export class EventListenerService {
    private provider: ethers.Provider | null = null;
    private contract: Contract | null = null;
    private pool: Pool | null = null;  // Now this works!
    private config: EventListenerConfig;
    private isRunning = false;

    constructor(config: EventListenerConfig) {
      this.config = config;
    }

    /**
     * Initialize the service
     */
    async initialize(provider: ethers.Provider): Promise<void> {
      this.provider = provider;

      // Create contract instance
      this.contract = new ethers.Contract(
        this.config.contractAddress,
        this.config.contractABI,
        provider
      );

      // Connect to database
      this.pool = new pkg.Pool(this.config.dbConfig);

      console.log("✅ Event Listener Service initialized");
      console.log(`   Contract: ${this.config.contractAddress}`);
      console.log(`   Database: ${this.config.dbConfig.database}`);
      console.log(`   Events: ${this.config.eventNames.join(", ")}`);
    }

    /**
     * Start real-time event listening
     */
    async startListening(): Promise<void> {
      if (!this.contract) throw new Error("Service not initialized");
      if (this.isRunning) throw new Error("Already listening");

      this.isRunning = true;
      console.log("\n📡 Starting real-time event listener...");

      // Listen to each event type
      for (const eventName of this.config.eventNames) {
        this.contract.on(eventName, async (...args) => {
          // Last argument is the event object
          const event = args[args.length - 1];

          if (!(event instanceof EventLog)) return;

          console.log(`\n💡 New ${eventName} event detected!`);
          console.log(`   Block: ${event.blockNumber}`);
          console.log(`   Tx: ${event.transactionHash}`);

          await this.storeEvent(event);
        });

        console.log(`   ✅ Listening for ${eventName}`);
      }

      console.log("\n✅ Real-time listener active!");
    }

    /**
     * Stop listening
     */
    async stopListening(): Promise<void> {
      if (!this.contract) return;
      if (!this.isRunning) return;

      console.log("\n🛑 Stopping event listener...");

      // Remove all listeners
      this.contract.removeAllListeners();

      this.isRunning = false;
      console.log("✅ Listener stopped");
    }

    /**
     * Store event in database
     */
    private async storeEvent(event: EventLog): Promise<void> {
      if (!this.pool) throw new Error("Database not connected");

      try {
        // Check if already stored
        const existing = await this.pool.query(
          "SELECT id FROM transactions WHERE tx_hash = $1",
          [event.transactionHash]
        );

        if (existing.rows.length > 0) {
          console.log("   ⏭️  Event already in database");
          return;
        }

        // Parse event data (example for Deposited event)
        const member = event.args.member;
        const amount = ethers.formatEther(event.args.amount);
        const timestamp = new Date(Number(event.args.timestamp) * 1000);

        // Insert transaction
        await this.pool.query(`
          INSERT INTO transactions (
            amount, currency, tx_hash, tx_type, status,
            event_name, event_data, confirmed_at, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          amount,
          "ETH",
          event.transactionHash,
          event.eventName === "Deposited" ? "deposit" : "withdrawal",
          "confirmed",
          event.eventName,
          JSON.stringify({
            member,
            amount,
            blockNumber: event.blockNumber,
            timestamp: timestamp.toISOString()
          }),
          timestamp,
          `${event.eventName} from ${member.substring(0, 10)}...`
        ]);

        console.log("   ✅ Event stored in database");
      } catch (error: any) {
        console.error("   ❌ Error storing event:", error.message);
      }
    }

    /**
     * Get service status
     */
    getStatus(): { isRunning: boolean; contractAddress: string; eventNames: string[] } {
      return {
        isRunning: this.isRunning,
        contractAddress: this.config.contractAddress,
        eventNames: this.config.eventNames
      };
    }

    /**
     * Cleanup
     */
    async shutdown(): Promise<void> {
      await this.stopListening();
      if (this.pool) {
        await this.pool.end();
        console.log("✅ Database connection closed");
      }
    }
  }