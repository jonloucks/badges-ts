import { MockProxy } from "jest-mock-extended";
import { ok } from "node:assert";

import { BadgeFactory, CONTRACT, guard } from "@jonloucks/badges-ts/api/BadgeFactory";

import { AutoClose } from "@jonloucks/contracts-ts";
import { createInstaller } from "..";
import { assertContract, assertGuard, mockDuck } from "./helper.test";

describe('guard tests', () => {
  let closeInstaller: AutoClose;
  beforeEach(() => {
    closeInstaller = createInstaller().open();
  });

  afterEach(() => {
    closeInstaller.close();
  });
  it('guard should return true for BadgeFactory', () => {
    const instance: MockProxy<BadgeFactory> = mockDuck<BadgeFactory>('createBadge');
    ok(guard(instance), 'BadgeFactory should return true');
  });
});

assertGuard(guard, "createBadge");

assertContract(CONTRACT, "BadgeFactory");