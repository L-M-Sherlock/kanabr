import { type Binder, type Module } from "@fastr/invert";
import Knex from "knex";
import { Env } from "./env.ts";
import { makeKnex } from "./knex.ts";

export class ConfigModule implements Module {
  configure({ bind }: Binder): void {
    bind(Knex).toValue(makeKnex());
    bind("dataDir").toValue(
      Env.getPath("DATA_DIR", "/var/lib/kanabr"), //
    );
    bind("publicDir").toValue(
      Env.getPath("PUBLIC_DIR", "/opt/kanabr/public"), //
    );
    bind("canonicalUrl").toValue(
      Env.getString("APP_URL", "http://localhost:3000/"), //
    );
  }
}
