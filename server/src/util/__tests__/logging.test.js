import { jest } from "@jest/globals";
import logger, { logInfo, logWarn, logError } from "../logging.js";

describe("logging", () => {
  it("logInfo should log to the logger.info", () => {
    const loggerInfoMock = jest.spyOn(logger, "info").mockImplementation();

    expect(loggerInfoMock).toHaveBeenCalledTimes(0);

    logInfo("Some message");

    expect(loggerInfoMock).toHaveBeenCalledTimes(1);

    loggerInfoMock.mockRestore();
  });

  it("logWarn should log to the logger.warn", () => {
    const loggerWarnMock = jest.spyOn(logger, "warn").mockImplementation();

    expect(loggerWarnMock).toHaveBeenCalledTimes(0);

    logWarn("Some message");

    expect(loggerWarnMock).toHaveBeenCalledTimes(1);

    loggerWarnMock.mockRestore();
  });

  it("logError should log simple messages to the logger.error", () => {
    const loggerErrorMock = jest.spyOn(logger, "error").mockImplementation();

    expect(loggerErrorMock).toHaveBeenCalledTimes(0);
    const err = new Error("Some message");
    logError(err);

    expect(loggerErrorMock).toHaveBeenCalledTimes(1);

    loggerErrorMock.mockRestore();
  });

  it("logError should log Error objects with stack to the logger.error", () => {
    const loggerErrorMock = jest.spyOn(logger, "error").mockImplementation();

    expect(loggerErrorMock).toHaveBeenCalledTimes(0);
    const errMessage = "My error";
    const err = new Error(errMessage);
    logError(err);

    expect(loggerErrorMock).toHaveBeenCalledTimes(1);
    expect(loggerErrorMock).toHaveBeenLastCalledWith(errMessage, {
      stack: err.stack,
    });

    loggerErrorMock.mockRestore();
  });
});
