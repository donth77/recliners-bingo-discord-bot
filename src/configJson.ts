import * as path from "path";
import { ConfigJson } from "./types";
export const configJson: ConfigJson = require(path.join(
  __dirname,
  "..",
  "config.json"
));
