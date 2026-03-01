import { throws } from "node:assert";
import { describe, it } from "node:test";

import { BadgeException, guard} from "@jonloucks/badges-ts/api/BadgeException";

describe('BadgeException Tests', () => {
  it('without message throws IllegalArgumentException', () => {
    throws(() => {
      new BadgeException(null as unknown as string);
    }, {
      name: 'IllegalArgumentException',
      message: 'Message must be present.'
    });
  });

  it('with message, has correct name and message', () => {
    throws(() => {
      throw new BadgeException("Problem.");
    }, {
      name: 'BadgeException',
      message: "Problem."
    });
  });

  it('rethrow with Error caught with message, has correct name and message', () => {
    throws(() => {
      BadgeException.rethrow(new Error("Inner problem."), "Outer Problem.");
    }, {
      name: 'BadgeException',
      message: "Outer Problem."
    });
  });

  it('rethrow with Error caught without message, has correct name and message', () => {
    throws(() => {
      BadgeException.rethrow(new Error("Inner problem."));
    }, {
      name: 'BadgeException',
      message: "Inner problem."
    });
  });

  it('rethrow with null caught without message, has correct name and message', () => {
    throws(() => {
      BadgeException.rethrow(null);
    }, {
      name: 'BadgeException',
      message: "Unknown type of caught value."
    });
  });

  it('rethrow with number caught without message, has correct name and message', () => {
    throws(() => {
      BadgeException.rethrow(13);
    }, {
      name: 'BadgeException',
      message: "Unknown type of caught value."
    });
  });

  it('rethrow with null caught with message, has correct name and message', () => {
    throws(() => {
      BadgeException.rethrow(null, "Outer Problem.");
    }, {
      name: 'BadgeException',
      message: "Outer Problem."
    });
  });


  it('rethrow with BadgeException caught with message, has correct name and message', () => {
    throws(() => {
      BadgeException.rethrow(new BadgeException("Inner Problem."), "Outer Problem.");
    }, {
      name: 'BadgeException',
      message: "Inner Problem."
    });
  });

  it('gaurd should return true for BadgeException instances', () => {
    const exception = new BadgeException("Test message");
    if (!guard(exception)) {
      throw new Error("Guard should recognize BadgeException instance");
    }
  });

  it('gaurd should return false for non-BadgeException instances', () => {
    const notAnException = { name: "NotBadgeException", message: "I am not a BadgeException" };
    if (guard(notAnException)) {
      throw new Error("Guard should not recognize non-BadgeException instance");
    }
  }); 
});
