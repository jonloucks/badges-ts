#!/usr/bin/env node
import { runMain } from "../cli.js";
import { toContext } from "../impl/Command.impl.js";

await runMain(toContext(process.argv.slice(2)));