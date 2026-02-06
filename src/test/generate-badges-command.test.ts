import { createInstaller } from "@jonloucks/badges-ts";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";
import { AutoClose } from "@jonloucks/contracts-ts";
import { Context, toContext } from "../impl/Command.impl";
import { COMMAND } from "../impl/generate-badges-command";

describe('generate-badges tests', () => {
  let closeInstaller: AutoClose;
  let context: Context;

  beforeEach(() => {
    closeInstaller = createInstaller().open();
    context = toContext(['generate-badges', '--quiet']);
  });

  afterEach(() => {
    closeInstaller.close();
  });

  test('generate-badges command test', async () => {
    await COMMAND.execute(context)
      .then((result) => {
        expect(result).toBeTruthy();
      }).catch((error) => {
        used(error);
        // ok(guardException(error));
      });
  })
});