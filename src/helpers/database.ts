import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import * as secret from "../resources/secrets/firebase";
import { DataBaseModel } from "./interfaces";

const db: DataBaseModel = { "servers": {}, "users": {} };

/**
 * Initialize the database connection
 * -
 * -> Returns a Promise
  */
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

/**
* Get the database Object.
* -
* Every time you want to change/get data, call this function.
* 
* Do **NOT** store the object! Overwrites will occur!
*/
export function getDB (): DataBaseModel { return db; }