import { Application } from "../declarations";
import users from "./users/users.service";
import guild from "./guild/guild.service";
import guilds from './guilds/guilds.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(guild);
  app.configure(guilds);
}
