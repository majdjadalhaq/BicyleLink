import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import App from "../../App";
import TEST_ID_HOME from "../../pages/Home/Home.testid";
import TEST_ID_NAV from "../Nav.testid";
import TEST_ID_CREATE_USER from "../../pages/User/CreateUser.testid";

beforeEach(() => {
  fetch.resetMocks();

  fetch.mockResponse(async (req) => {
    if (req.url.includes("/api/users/me")) {
      return JSON.stringify({ success: true, user: null });
    }
    if (req.url.includes("/api/listings")) {
      return JSON.stringify({ success: true, result: [] });
    }
    return { status: 404, body: "Not Found" };
  });
});

describe("Navigation", () => {
  it("should render the Nav component on the home page", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_NAV.container)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_HOME.container)).toBeInTheDocument();
    });
  });

  it("should show Login and Sign Up links when user is not logged in", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    // Wait for the nav and auth loading to complete
    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_NAV.container)).toBeInTheDocument();
    });

    // Login and signup links should appear for unauthenticated users
    await waitFor(() => {
      const loginLinks = screen.getAllByRole("link", { name: /login/i });
      expect(loginLinks.length).toBeGreaterThan(0);
    });
  });

  it("should navigate to the signup page when visiting /signup", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/signup"]}>
          <App />
        </MemoryRouter>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_ID_CREATE_USER.container),
      ).toBeInTheDocument();
    });
  });
});
