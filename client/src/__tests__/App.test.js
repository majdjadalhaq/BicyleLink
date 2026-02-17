import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../App";
import TEST_ID_HOME from "../pages/Home/Home.testid";
import TEST_ID_USER_LIST from "../pages/User/UserList.testid";
import TEST_ID_CREATE_USER from "../pages/User/CreateUser.testid";
import { getUsersSuccessMock } from "../__testUtils__/fetchUserMocks";

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

describe("Routing", () => {
  it("Path '/' should go to Home page ", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    expect(screen.getByTestId(TEST_ID_HOME.container)).toBeInTheDocument();
  });

  it("Path '/user' should go to User list ", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/user"]}>
          <App />
        </MemoryRouter>,
      );
    });

    await waitFor(() =>
      expect(
        screen.getByTestId(TEST_ID_USER_LIST.container),
      ).toBeInTheDocument(),
    );
  });

  it("Path '/signup' should go to User create page ", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/signup"]}>
          <App />
        </MemoryRouter>,
      );
    });

    expect(
      screen.getByTestId(TEST_ID_CREATE_USER.container),
    ).toBeInTheDocument();
  });
});
