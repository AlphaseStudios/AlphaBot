import app from "../../src/api/app";

describe("'guild' service", () => {
  it("registered the service", () => {
    const service = app.service("guild");
    expect(service).toBeTruthy();
  });
});
