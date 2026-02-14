import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { BadgeFactory, CONTRACT, guard } from "@jonloucks/badges-ts/api/BadgeFactory";

import { Badge, BadgeConfig, createInstaller } from "@jonloucks/badges-ts";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { used } from "../auxiliary/Checks.js";
import { assertContract, assertGuard } from "./helper.test.js";

describe('guard tests', () => {
  let closeInstaller: AutoClose;

  beforeEach(() => {
    closeInstaller = createInstaller().open();
  });

  afterEach(() => {
    closeInstaller.close();
  });
  it('guard should return true for BadgeFactory', () => {
    const instance: BadgeFactory = {
      createBadge: function (config: BadgeConfig): Promise<Badge> {
        used(config);
        throw new Error("Function not implemented.");
      }
    };
    ok(guard(instance), 'BadgeFactory should return true');
  });
});

assertGuard(guard, "createBadge");

assertContract(CONTRACT, "BadgeFactory");