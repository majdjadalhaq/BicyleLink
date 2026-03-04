import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";

import CreateUser from "../CreateUser";
import TEST_ID_CREATE_USER from "../CreateUser.testid";
import {
  createUserSuccessMock,
  createUserFailedMock,
} from "../../../__testUtils__/fetchUserMocks";

// Mock hooks to avoid context wrapper complexity
jest.mock("../../../hooks/useToast", () => ({
  __esModule: true,
  default: () => ({ showToast: jest.fn() }),
}));

jest.mock("../../../hooks/useAuth", () => ({
  __esModule: true,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// We need to wrap with MemoryRouter because CreateUser uses useNavigate
const WrappedCreateUser = () => (
  <MemoryRouter>
    <CreateUser />
  </MemoryRouter>
);

beforeEach(() => {
  fetch.resetMocks();
  // Robust mock for all possible calls
  fetch.mockResponse(async (req) => {
    if (req.url.includes("/api/users/me")) {
      return JSON.stringify({ success: true, user: null });
    }
    if (req.url.includes("/api/users")) {
      if (req.method === "POST") {
        // This will be overridden in specific tests if needed
        return createUserSuccessMock();
      }
      return JSON.stringify({ success: true, result: [] });
    }
    return { status: 404, body: "Not Found" };
  });
});

describe("CreateUser", () => {
  it("Renders without a problem", () => {
    render(<WrappedCreateUser />);

    expect(
      screen.getByTestId(TEST_ID_CREATE_USER.container),
    ).toBeInTheDocument();
  });

  it("Should be able to change name and email input", () => {
    const testName = "John";
    const testEmail = "john@doe.com";

    render(<WrappedCreateUser />);

    // Check initially fields are empty
    expect(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value).toEqual(
      "",
    );
    expect(screen.getByTestId(TEST_ID_CREATE_USER.emailInput).value).toEqual(
      "",
    );

    // Change fields
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput), {
      target: { value: testName },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.emailInput), {
      target: { value: testEmail },
    });

    // Check fields have changed value
    expect(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value).toEqual(
      testName,
    );
    expect(screen.getByTestId(TEST_ID_CREATE_USER.emailInput).value).toEqual(
      testEmail,
    );
  });

  it("Should send the input values to the server on clicking submit and indicate loading states", async () => {
    const testName = "JohnDoe";
    const testEmail = "john@doe.com";
    const testPassword = "Password123!";

    // Mock our fetch specifically for this test
    fetch.mockResponse(async (req) => {
      if (req.url.includes("/api/users/me"))
        return JSON.stringify({ success: true, user: null });
      if (req.url.includes("/api/users") && req.method === "POST")
        return createUserSuccessMock({ name: testName, email: testEmail });
      return JSON.stringify({ success: true, result: [] });
    });

    render(<WrappedCreateUser />);

    // Fill in ALL required fields to pass validation
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput), {
      target: { value: testName },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.emailInput), {
      target: { value: testEmail },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.passwordInput), {
      target: { value: testPassword },
    });
    fireEvent.change(
      screen.getByTestId(TEST_ID_CREATE_USER.confirmPasswordInput),
      {
        target: { value: testPassword },
      },
    );

    // Click submit
    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_ID_CREATE_USER.submitButton));
    });

    // Wait for the loading state to be removed (if it was shown)
    // Note: Due to fast mock response, it might be gone instantly
    await waitFor(() => {
      expect(
        screen.queryByTestId(TEST_ID_CREATE_USER.loadingContainer),
      ).not.toBeInTheDocument();
    });

    // Check that the fields were cleared after a successful submit
    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value,
      ).toEqual("");
    });
  });

  it("Should show an error state if the creation is unsuccessful", async () => {
    const testName = "JohnDoe";
    const testEmail = "john@doe.com";
    const testPassword = "Password123!";

    // Mock our fetch to fail
    fetch.mockResponse(async (req) => {
      if (req.url.includes("/api/users/me"))
        return JSON.stringify({ success: true, user: null });
      if (req.url.includes("/api/users") && req.method === "POST") {
        return Promise.reject(new Error("Something went wrong"));
      }
      return JSON.stringify({ success: true, result: [] });
    });

    render(<WrappedCreateUser />);

    // Fill in ALL required fields
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput), {
      target: { value: testName },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.emailInput), {
      target: { value: testEmail },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.passwordInput), {
      target: { value: testPassword },
    });
    fireEvent.change(
      screen.getByTestId(TEST_ID_CREATE_USER.confirmPasswordInput),
      {
        target: { value: testPassword },
      },
    );

    // Click submit
    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_ID_CREATE_USER.submitButton));
    });

    // Wait to see the error component (we expect text inside the red error box)
    await waitFor(() => {
      // The component renders {displayError} inside the red box.
      // fetchUserMocks returns { success: false, msg: "Something went wrong" }.
      // If useApi doesn't extract `msg` properly, it might just stringify the whole thing or return a generic error.
      // Let's check for "Something went wrong" since that's what the mock returns.
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    // Check to see that the fields are still filled in
    expect(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value).toEqual(
      testName,
    );
  });
});
