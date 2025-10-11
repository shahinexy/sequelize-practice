import { Server } from "http";
import config from "./config";
import app from "./app";
import { setupSocketIO } from "./app/modules/SocketIo";
import { checkPlans } from "./app/modules/PurchasedPlan/purchasedPlan.service";
import cron from "node-cron";

let server: Server;

async function startServer() {
  server = app.listen(config.port, () => {
    console.log("Server is listening on port ", config.port);
  });
  setupSocketIO(server);
}

cron.schedule("0 0 * * *", async () => {
  await checkPlans();
});

async function main() {
  await startServer();
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
        restartServer();
      });
    } else {
      process.exit(1);
    }
  };

  const restartServer = () => {
    console.info("Restarting server...");
    main();
  };

  process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception: ", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection: ", error);
    exitHandler();
  });

  // Handling the server shutdown with SIGTERM and SIGINT
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Shutting down gracefully...");
    exitHandler();
  });

  process.on("SIGINT", () => {
    console.log("SIGINT signal received. Shutting down gracefully...");
    exitHandler();
  });
}

main();
