/**
 * This file will be imported in all tests automatically by Jest
 */

// For react-testing-library, it will be the DOM mock
import "@testing-library/jest-dom";

// Make it automatically mock fetch requests. Docs: https://www.npmjs.com/package/jest-fetch-mock
import jestFetchMock from "jest-fetch-mock";
jestFetchMock.enableMocks();

// Polyfill for TextEncoder - Otherwise it creates an error 'TextEncoder' is not defined inside
// the react-router-dom library.
import { TextEncoder, TextDecoder } from "util";
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock import.meta for Jest
process.env.VITE_GOOGLE_CLIENT_ID = "mock-client-id";
