import logger from "./api/logger";
import app from "./api/app";
import initClient from "@/index";
initClient();

const port = app.get("port");
const server = app.listen(port);

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);

server.on("listening", () =>
  logger.info("Feathers application started on http://%s:%d", app.get("host"), port)
);
