// Initializes the `guild` service on path `/guild`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Guild } from "./guild.class";
import hooks from "./guild.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    "guild": Guild & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    "paginate": app.get("paginate")
  };

  // Initialize our service with any options it requires
  app.use("/guild", new Guild(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("guild");

  service.hooks(hooks);
}
