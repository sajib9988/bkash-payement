import { Server } from "http";
import app from "./app";
import config from "./app/config";


// const port = 5000;

async function main() {
  try {
    const server: Server = app.listen(config.port, () => {
      console.log(`App is listening at port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();