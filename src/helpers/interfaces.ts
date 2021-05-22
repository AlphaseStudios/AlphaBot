import Discord from "discord.js";

export interface Command {
  name: string,
  description: string,
  aliases?: Array<string>,
  usage?: string,
  args?: number,
  devOnly?: boolean,
  guildOnly?: boolean,
  run: (client: Client, message: Discord.Message, args: Array<string>) => void,
}

export interface Client extends Discord.Client {
  commands: Discord.Collection<string, Command>
}

export interface DataBaseModel {
  servers: ServerDataBase,
  users: UserDataBase,
}

interface ServerDataBase {
  [snowflake: string]: {
    enableWelcome?: number,
    fMsg?: string,
    fchannel?: string,
    lvlMsg?: string,
    milestones?: {
      [lvl: number]: string
    },
    modlog?: string,
    muteRole?: string,
    noxp?: Array<string>,
    nword?: string,
    pnc?: string,
    rr?: {
      [snowflake: string]: {
        [emoji: string]: {
          role: string,
          type: number,
        }
      }
    },
    shoutC?: string,
    shoutLvl?: boolean,
    wMsg?: string,
    wchannel?: string,
  }
}

interface UserDataBase {
  [snowflake: string]: {
    [snowflake: string]: {
      level?: number,
      lvl?: number,
      xp?: number
    },
  }
}