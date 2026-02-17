import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * We use the App component to test here as it will do the routing for us.
 * This allows our test to be more user centric!
 */
import App from "../../App";
import TEST_ID_HOME from "../../pages/Home/Home.testid";
import TEST_ID_USER_LIST from "../../pages/User/UserList.testid";
import TEST_ID_NAV from "../Nav.testid";
import { getUsersSuccessMock } from "../../__testUtils__/fetchUserMocks";

beforeEach(() => {
  fetch.resetMocks();

  // Robust mock for all possible calls during navigation
  fetch.mockResponse(async (req) => {
    if (req.url.includes("/api/users/me")) {
      return JSON.stringify({ success: true, user: null });
    }
    if (req.url.includes("/api/listings")) {
      return JSON.stringify({ success: true, result: [] });
    }
    if (req.url.includes("/api/users")) {
      return getUsersSuccessMock([]);
    }
    return { status: 404, body: "Not Found" };
  });
});

describe("Navigation", () => {
  it("Clicking on the Home link should go to Home page ", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/user"]}>
          <App />
        </MemoryRouter>,
      );
    });

    // Ensure we are on User page first
    await waitFor(() =>
      expect(
        screen.getByTestId(TEST_ID_USER_LIST.container),
      ).toBeInTheDocument(),
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_ID_NAV.linkToHome));
    });

    await waitFor(() =>
      expect(screen.getByTestId(TEST_ID_HOME.container)).toBeInTheDocument(),
    );
  });

  it("Clicking on the User link should go to User List page ", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    // Ensure we are on Home page first
    await waitFor(() =>
      expect(screen.getByTestId(TEST_ID_HOME.container)).toBeInTheDocument(),
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_ID_NAV.linkToUsers));
    });

    await waitFor(() =>
      expect(
        screen.getByTestId(TEST_ID_USER_LIST.container),
      ).toBeInTheDocument(),
    );

    // Wait until data is loaded
    await waitFor(() =>
      expect(screen.getByTestId(TEST_ID_USER_LIST.userList)).toHaveAttribute(
        "data-loaded",
        "true",
      ),
    );
  });
});
