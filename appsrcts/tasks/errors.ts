
import * as ExtendableError from "es6-error";

export class Transition extends ExtendableError {
  to?: string;
  reason?: string;

  constructor(opts: any) {
    super("task transition");
    Object.assign(this, opts, { type: "transition" });
  }

  toString() {
    return `Transition(to ${this.to} because ${this.reason})`;
  }
}

export class InputRequired extends ExtendableError {
  constructor(opts: any) {
    super("user interaction required");
    Object.assign(this, opts, { type: "input_required" });
  }
}

export class Crash extends ExtendableError {
  constructor(opts: any) {
    super(`application crashed. ${opts.error || ""}`);
    Object.assign(this, opts, { type: "crash" });
  }
}

export class Cancelled extends ExtendableError {
  constructor(opts: any = {}) {
    super("cancelled");
    Object.assign(this, opts, { type: "cancelled" });
  }
}
