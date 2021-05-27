// Initializes the `guilds` service on path `/guilds`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Guilds } from "./guilds.class";
import hooks from "./guilds.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    "guilds": Guilds & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    "paginate": app.get("paginate")
  };

  // Initialize our service with any options it requires
  app.use("/guilds", new Guilds(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("guilds");

  service.hooks(hooks);
}
