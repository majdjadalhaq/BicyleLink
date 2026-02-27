import React from "react";
import { render, screen } from "@testing-library/react";

import Home from "../Home";
import TEST_ID_HOME from "../Home.testid";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../../hooks/useToast", () => () => ({
  showToast: jest.fn(),
}));

jest.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

jest.mock("../../../hooks/useApi", () => () => ({
  executeApi: jest.fn(),
}));

describe("Home", () => {
  it("Renders without a problem", async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );

    expect(screen.getByTestId(TEST_ID_HOME.container)).toBeInTheDocument();
  });
});
