import { createInstaller } from "@jonloucks/badges-ts";
import { Installer } from "@jonloucks/badges-ts/api/Installer";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { guard as guardAutoOpen } from "@jonloucks/contracts-ts/api/AutoOpen";
import { ok } from "node:assert";
import { describe, it } from "node:test";

describe('Installer tests', () => {
  it('should create an installer instance', () => {
    const installer: Installer = createInstaller();
    ok(installer, 'Installer instance should be created');
  });

  it('should have an open method that returns an AutoClose', () => {
    const installer: Installer = createInstaller();
    const autoClose: AutoClose = installer.open();
    ok(autoClose, 'open method should return an AutoClose instance');
    ok(typeof autoClose.close === 'function', 'AutoClose instance should have a close method');
    autoClose.close(); // Ensure we call close to clean up any resources if needed
  });

  it('if AutoOpen is implemented, autoOpen should return an AutoClose', () => {
    const installer: Installer = createInstaller();
    if (guardAutoOpen(installer)) {
      const autoClose: AutoClose = installer.autoOpen();
      ok(autoClose, 'autoOpen method should return an AutoClose instance');
      ok(typeof autoClose.close === 'function', 'AutoClose instance should have a close method');
      autoClose.close(); // Ensure we call close to clean up any resources if needed
    } else {
      ok(true, 'Installer does not implement AutoOpen, skipping test');
    }
  });
});