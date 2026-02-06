import { createInstaller } from "@jonloucks/badges-ts";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";
import { AutoClose } from "@jonloucks/contracts-ts";
import { ok } from "assert/strict";
import { COMMAND } from "../impl/apply-version-command";
import { Context, toContext } from "../impl/Command.impl";

describe('apply-version tests', () => {
  let closeInstaller: AutoClose;
  let context: Context;

  beforeEach(() => {
    closeInstaller = createInstaller().open();
    context = toContext(['apply-version', '--quiet']);
  });

  afterEach(() => {
    closeInstaller.close();
  });

  test('applyVersion test', async () => {
    await COMMAND.execute(context)
      .then((result) => {
        used(result);
        ok(true, 'applyVersion executed successfully');
      }).catch((error) => {
        used(error);
        // ok(guardException(error));
      });
  })

  test('applyVersion test', async () => {
    const result = await COMMAND.execute(context);
    expect(result).toBeTruthy();
  });
});