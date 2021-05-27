import admin, { ServiceAccount } from "firebase-admin";
import * as secret from "../resources/secrets/firebase";
import { DataBaseModel } from "@/helpers/interfaces";

const db: DataBaseModel = { "servers": {}, "users": {} };
export default db;

export function init (): Promise<void | Error> {
  return new Promise<void | Error>((resolve, reject) => {
    admin.initializeApp({
      "credential": admin.credential.cert(secret.firebase as ServiceAccount),
      "databaseURL": "https://discordbot-58332.firebaseio.com"
    });

    admin.database().ref()
      .once("value")
      .then(function (snapshot) {
        db.servers = snapshot.val().Servers;
        db.users = snapshot.val().Users;

        resolve();
      }).catch((err) => {
        reject(new Error(err));
      });
  });
}
