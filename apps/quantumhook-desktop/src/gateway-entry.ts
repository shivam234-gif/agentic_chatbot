import { startGatewayServer } from "../../../src/gateway/server";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

console.log(`[GatewayEntry] Starting Gateway Server on port ${port}...`);

startGatewayServer(port, {
  // enable control UI, etc if needed
}).then((server) => {
  console.log(`[GatewayEntry] Gateway Server Started on port ${port}`);
}).catch((err) => {
  console.error("[GatewayEntry] Failed to start gateway server:", err);
  process.exit(1);
});
