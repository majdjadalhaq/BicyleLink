#!/usr/bin/env node
/**
 * Live API verification script — tests backend without a browser.
 * Run with: npm run verify:api (requires server on localhost:3000)
 *
 * Uses try/catch per step to isolate failures.
 * Optional admin test: set env VERIFY_ADMIN=1 and ensure DB has seeded admin user.
 */
const BASE = "http://localhost:3000";
const results = [];
const ADMIN_EMAIL = "bicyclel2026@gmail.com";
const ADMIN_PASSWORD = "AdminRide2026!";

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  const icon = pass ? "✅" : "❌";
  const suffix = detail ? `: ${detail}` : "";
  console.log(`  ${icon} ${name}${suffix}`);
}

function recordSkip(name, reason) {
  results.push({ name, pass: true, detail: `skipped (${reason})` });
  console.log(`  ⏭️  ${name}: skipped (${reason})`);
}

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, ok: res.ok, headers: res.headers };
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  console.log("\n=== Live API Verification ===\n");

  const ts = Date.now();
  let cookies = "";
  let listingId = null;
  const testEmail = `verify_${ts}@test.com`;
  const testPassword = "Password123!";

  // 1. GET /api/listings (public)
  try {
    const listings = await safeFetch(`${BASE}/api/listings?page=1&limit=5`);
    if (listings.error) {
      record("GET /api/listings (public)", false, listings.error);
    } else {
      record("GET /api/listings (public)", listings.ok, listings.ok ? "" : `status ${listings.status}`);
    }
  } catch (e) {
    record("GET /api/listings (public)", false, e.message);
  }

  // 2. POST /api/users (signup)
  try {
    const signup = await safeFetch(`${BASE}/api/users`, {
      method: "POST",
      body: JSON.stringify({
        user: {
          name: `verify_${ts}`,
          email: testEmail,
          password: testPassword,
          agreedToTerms: true,
        },
      }),
    });
    if (signup.error) {
      record("POST /api/users (signup)", false, signup.error);
    } else {
      record("POST /api/users (signup)", signup.ok, signup.ok ? "" : signup.data?.msg || `status ${signup.status}`);
    }
  } catch (e) {
    record("POST /api/users (signup)", false, e.message);
  }

  // 3. Login unverified
  try {
    const loginUnverified = await safeFetch(`${BASE}/api/users/login`, {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    if (loginUnverified.error) {
      record("POST /api/users/login (unverified)", false, loginUnverified.error);
    } else {
      const expect403Or200 = loginUnverified.status === 403 || loginUnverified.ok;
      record("POST /api/users/login (unverified)", expect403Or200, expect403Or200 ? "" : `status ${loginUnverified.status}`);
    }
  } catch (e) {
    record("POST /api/users/login (unverified)", false, e.message);
  }

  // 4. Verify user via test endpoint
  try {
    const verify = await safeFetch(`${BASE}/api/test/verify-user`, {
      method: "POST",
      body: JSON.stringify({ email: testEmail }),
    });
    if (verify.error) {
      record("POST /api/test/verify-user", false, verify.error);
    } else {
      const ok = verify.ok && verify.data?.success;
      record("POST /api/test/verify-user", ok, ok ? "" : "verify-user may not be available in prod");
    }
  } catch (e) {
    record("POST /api/test/verify-user", false, e.message);
  }

  // 5. Login (verified)
  try {
    const loginRes = await fetch(`${BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
      redirect: "manual",
    });
    const loginData = await loginRes.json().catch(() => ({}));
    const cookieHeader = loginRes.headers.get("set-cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    cookies = tokenMatch ? `token=${tokenMatch[1]}` : "";
    const pass = loginRes.ok && (loginData?.user || !!tokenMatch);
    record("POST /api/users/login (verified)", pass, pass ? "" : loginData?.msg || `status ${loginRes.status}`);
  } catch (e) {
    record("POST /api/users/login (verified)", false, e.message);
  }

  const withCookies = (opts = {}) => ({
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
      ...opts.headers,
    },
  });

  // 6. GET /api/users/me
  try {
    const meRes = await fetch(`${BASE}/api/users/me`, withCookies({ credentials: "include" }));
    const meData = await meRes.json().catch(() => ({}));
    record("GET /api/users/me (session)", meRes.ok && meData?.success, meRes.ok ? "" : `status ${meRes.status}`);
  } catch (e) {
    record("GET /api/users/me (session)", false, e.message);
  }

  // 7. POST /api/listings (create)
  try {
    const createRes = await fetch(`${BASE}/api/listings`, withCookies({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        listing: {
          title: "API Verify Bike",
          description: "Test",
          price: 100,
          location: "Amsterdam",
          category: "Road",
          condition: "good",
        },
      }),
    }));
    const createData = await createRes.json().catch(() => ({}));
    listingId = createData?.listing?._id;
    record("POST /api/listings (create)", createRes.ok, createRes.ok ? "" : createData?.msg || `status ${createRes.status}`);
  } catch (e) {
    record("POST /api/listings (create)", false, e.message);
  }

  // 8. PUT /api/listings/:id (update)
  if (listingId) {
    try {
      const updateRes = await fetch(`${BASE}/api/listings/${listingId}`, withCookies({
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ listing: { title: "API Verify Bike Updated" } }),
      }));
      const updData = await updateRes.json().catch(() => ({}));
      record("PUT /api/listings/:id (update)", updateRes.ok, updateRes.ok ? "" : updData?.msg || `status ${updateRes.status}`);
    } catch (e) {
      record("PUT /api/listings/:id (update)", false, e.message);
    }
  } else {
    recordSkip("PUT /api/listings/:id (update)", "no listingId");
  }

  // 9. Admin PATCH route exists
  try {
    const adminPatch = await fetch(`${BASE}/api/admin/listings/${listingId || "000000000000000000000001"}`, withCookies({
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({ listing: { title: "Admin Edit" } }),
    }));
    record("PATCH /api/admin/listings/:id (route exists)", adminPatch.status !== 405, adminPatch.status === 405 ? "405" : `status ${adminPatch.status}`);
  } catch (e) {
    record("PATCH /api/admin/listings/:id (route exists)", false, e.message);
  }

  // 10. POST /api/users/request-reset
  try {
    const resetReq = await safeFetch(`${BASE}/api/users/request-reset`, {
      method: "POST",
      body: JSON.stringify({ email: testEmail }),
    });
    if (resetReq.error) {
      record("POST /api/users/request-reset", false, resetReq.error);
    } else {
      record("POST /api/users/request-reset", resetReq.ok, resetReq.ok ? "" : resetReq.data?.msg || `status ${resetReq.status}`);
    }
  } catch (e) {
    record("POST /api/users/request-reset", false, e.message);
  }

  // 11. Reset password execution (fetch code via test endpoint + POST reset-password)
  try {
    await new Promise((r) => setTimeout(r, 500));
    const codeRes = await safeFetch(`${BASE}/api/test/get-last-code?email=${encodeURIComponent(testEmail)}`);
    if (codeRes.error) {
      record("POST /api/users/reset-password", false, codeRes.error);
    } else if (!codeRes.ok) {
      recordSkip("POST /api/users/reset-password", "get-last-code unavailable (test router only in dev)");
    } else if (!codeRes.data?.passwordResetCode) {
      recordSkip("POST /api/users/reset-password", "no code yet (restart server to pick up test router update)");
    } else {
      const code = codeRes.data.passwordResetCode;
      const resetExec = await safeFetch(`${BASE}/api/users/reset-password`, {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          code,
          newPassword: "NewPassword123!",
        }),
      });
      if (resetExec.error) {
        record("POST /api/users/reset-password", false, resetExec.error);
      } else {
        record("POST /api/users/reset-password", resetExec.ok, resetExec.ok ? "" : resetExec.data?.msg || `status ${resetExec.status}`);
      }
    }
  } catch (e) {
    record("POST /api/users/reset-password", false, e.message);
  }

  // 12. Account Settings: request security code + change password via authenticated flow
  try {
    const secReq = await safeFetch(
      `${BASE}/api/users/request-security-code`,
      withCookies({ method: "POST" }),
    );
    if (secReq.error || !secReq.ok) {
      record(
        "AccountSettings: POST /api/users/request-security-code",
        false,
        secReq.error || secReq.data?.msg || `status ${secReq.status}`,
      );
    } else {
      // Fetch security code via test endpoint
      await new Promise((r) => setTimeout(r, 300));
      const codeRes = await safeFetch(
        `${BASE}/api/test/get-last-code?email=${encodeURIComponent(testEmail)}`,
      );
      const secCode = codeRes.data?.securityCode;
      if (!secCode) {
        record(
          "AccountSettings: PUT /api/users/password",
          false,
          "No securityCode found via test router",
        );
      } else {
        const newAccPassword = "AccSettings123!";
        const changeRes = await safeFetch(
          `${BASE}/api/users/password`,
          withCookies({
            method: "PUT",
            body: JSON.stringify({ code: secCode, newPassword: newAccPassword }),
          }),
        );
        if (changeRes.error || !changeRes.ok) {
          record(
            "AccountSettings: PUT /api/users/password",
            false,
            changeRes.error || changeRes.data?.msg || `status ${changeRes.status}`,
          );
        } else {
          // Old password should now fail, new password should succeed
          const oldLogin = await safeFetch(`${BASE}/api/users/login`, {
            method: "POST",
            body: JSON.stringify({ email: testEmail, password: testPassword }),
          });
          const newLogin = await fetch(`${BASE}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: testEmail, password: newAccPassword }),
            redirect: "manual",
          });
          const newLoginData = await newLogin.json().catch(() => ({}));
          const newCookieHeader = newLogin.headers.get("set-cookie") || "";
          const newTokenMatch = newCookieHeader.match(/token=([^;]+)/);
          const newCookies = newTokenMatch ? `token=${newTokenMatch[1]}` : "";
          const oldShouldFail = oldLogin.status === 401 || oldLogin.status === 400;
          const newShouldPass = newLogin.ok && (!!newTokenMatch || !!newLoginData?.user);
          if (newShouldPass) {
            cookies = newCookies; // update session for subsequent tests
          }
          const pass = oldShouldFail && newShouldPass;
          record(
            "AccountSettings: password change end-to-end (old fails, new succeeds)",
            pass,
            pass
              ? ""
              : `oldLogin status ${oldLogin.status}, newLogin status ${newLogin.status}`,
          );
        }
      }
    }
  } catch (e) {
    record("AccountSettings: password change end-to-end", false, e.message);
  }

  // 13. Account Settings: email change (request + verify)
  try {
    const newEmail = `updated_${ts}@test.com`;
    const emailReq = await safeFetch(
      `${BASE}/api/users/request-email-change`,
      withCookies({
        method: "POST",
        body: JSON.stringify({ newEmail }),
      }),
    );
    if (emailReq.error || !emailReq.ok) {
      record(
        "AccountSettings: POST /api/users/request-email-change",
        false,
        emailReq.error || emailReq.data?.msg || `status ${emailReq.status}`,
      );
    } else {
      await new Promise((r) => setTimeout(r, 300));
      const codeRes = await safeFetch(
        `${BASE}/api/test/get-last-code?email=${encodeURIComponent(testEmail)}`,
      );
      const secCode = codeRes.data?.securityCode;
      if (!secCode) {
        record(
          "AccountSettings: POST /api/users/verify-email-change",
          false,
          "No securityCode for email change via test router",
        );
      } else {
        const verifyRes = await safeFetch(
          `${BASE}/api/users/verify-email-change`,
          withCookies({
            method: "POST",
            body: JSON.stringify({ code: secCode }),
          }),
        );
        if (verifyRes.error || !verifyRes.ok) {
          record(
            "AccountSettings: POST /api/users/verify-email-change",
            false,
            verifyRes.error ||
              verifyRes.data?.msg ||
              `status ${verifyRes.status}`,
          );
        } else {
          const meAfter = await safeFetch(
            `${BASE}/api/users/me`,
            withCookies({ method: "GET" }),
          );
          const emailMatches =
            meAfter.ok && meAfter.data?.user?.email === newEmail;
          record(
            "AccountSettings: email change end-to-end",
            emailMatches,
            emailMatches
              ? ""
              : `me.email=${meAfter.data?.user?.email}, expected ${newEmail}`,
          );
        }
      }
    }
  } catch (e) {
    record("AccountSettings: email change end-to-end", false, e.message);
  }

  // 14. Account Settings: notification settings update
  try {
    const notifRes = await safeFetch(
      `${BASE}/api/users/notification-settings`,
      withCookies({
        method: "PATCH",
        body: JSON.stringify({ settings: { messages: false, reviews: false } }),
      }),
    );
    if (notifRes.error || !notifRes.ok) {
      record(
        "AccountSettings: PATCH /api/users/notification-settings",
        false,
        notifRes.error || notifRes.data?.msg || `status ${notifRes.status}`,
      );
    } else {
      const meAfterNotif = await safeFetch(
        `${BASE}/api/users/me`,
        withCookies({ method: "GET" }),
      );
      const settings = meAfterNotif.data?.user?.notificationSettings || {};
      const ok =
        settings.messages === false &&
        settings.reviews === false;
      record(
        "AccountSettings: notification settings persisted",
        ok,
        ok ? "" : `settings=${JSON.stringify(settings)}`,
      );
    }
  } catch (e) {
    record("AccountSettings: notification settings persisted", false, e.message);
  }

  // 15. Account Settings: delete account (security code + DELETE /users/account)
  try {
    const delReq = await safeFetch(
      `${BASE}/api/users/request-security-code`,
      withCookies({ method: "POST" }),
    );
    if (delReq.error || !delReq.ok) {
      record(
        "AccountSettings: POST /api/users/request-security-code (for delete)",
        false,
        delReq.error || delReq.data?.msg || `status ${delReq.status}`,
      );
    } else {
      await new Promise((r) => setTimeout(r, 300));
      const codeRes = await safeFetch(
        `${BASE}/api/test/get-last-code?email=${encodeURIComponent(
          `updated_${ts}@test.com`,
        )}`,
      );
      const secCode = codeRes.data?.securityCode;
      if (!secCode) {
        record(
          "AccountSettings: DELETE /api/users/account",
          false,
          "No securityCode for delete via test router",
        );
      } else {
        const delExec = await safeFetch(
          `${BASE}/api/users/account`,
          withCookies({
            method: "DELETE",
            body: JSON.stringify({ code: secCode }),
          }),
        );
        if (delExec.error || !delExec.ok) {
          record(
            "AccountSettings: DELETE /api/users/account",
            false,
            delExec.error || delExec.data?.msg || `status ${delExec.status}`,
          );
        } else {
          const meAfterDelete = await safeFetch(
            `${BASE}/api/users/me`,
            withCookies({ method: "GET" }),
          );
          const loggedOut =
            !meAfterDelete.data?.success || meAfterDelete.data?.msg === "Not authenticated";
          record(
            "AccountSettings: account deletion end-to-end",
            loggedOut,
            loggedOut ? "" : `meAfterDelete=${JSON.stringify(meAfterDelete.data)}`,
          );
        }
      }
    }
  } catch (e) {
    record("AccountSettings: account deletion end-to-end", false, e.message);
  }

  // 16. Listing filters: create controlled test data and validate filters
  try {
    const filterTag = `FilterTest_${ts}`;
    const filterEmail = `filter_${ts}@test.com`;
    const filterPassword = "FilterPass123!";

    // Dedicated user for filter tests
    const signupFilter = await safeFetch(`${BASE}/api/users`, {
      method: "POST",
      body: JSON.stringify({
        user: {
          name: `filter_${ts}`,
          email: filterEmail,
          password: filterPassword,
          agreedToTerms: true,
        },
      }),
    });
    if (signupFilter.error || !signupFilter.ok) {
      record(
        "Filters: seed test user",
        false,
        signupFilter.error ||
          signupFilter.data?.msg ||
          `status ${signupFilter.status}`,
      );
    } else {
      await safeFetch(`${BASE}/api/test/verify-user`, {
        method: "POST",
        body: JSON.stringify({ email: filterEmail }),
      });

      const filterLoginRes = await fetch(`${BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: filterEmail, password: filterPassword }),
        redirect: "manual",
      });
      const filterCookieHeader = filterLoginRes.headers.get("set-cookie") || "";
      const filterTokenMatch = filterCookieHeader.match(/token=([^;]+)/);
      const filterCookies = filterTokenMatch
        ? `token=${filterTokenMatch[1]}`
        : "";

      const withFilterCookies = (opts = {}) => ({
        ...opts,
        headers: {
          "Content-Type": "application/json",
          Cookie: filterCookies,
          ...opts.headers,
        },
      });

      let lastCreateError = null;
      const createListingWith = async (overrides) => {
        const res = await safeFetch(
          `${BASE}/api/listings`,
          withFilterCookies({
            method: "POST",
            body: JSON.stringify({
              listing: {
                title: `${filterTag}_${overrides.suffix}`,
                description: overrides.description || "Filter test listing",
                price: overrides.price,
                location: overrides.location,
                category: overrides.category,
                condition: overrides.condition,
                brand: overrides.brand || "FilterBrand",
              },
            }),
          }),
        );
        if (!res.data?.listing) {
          lastCreateError = res.error || res.data?.msg || `status ${res.status}`;
        }
        return res.data?.listing;
      };

      const createResults = [];
      const l1 = await (async () => {
        const r = await createListingWith({
          suffix: "1",
          price: 100,
          location: "Amsterdam",
          category: "Road",
          condition: "new",
        });
        if (!r) createResults.push("l1");
        return r;
      })();
      const l2 = await (async () => {
        const r = await createListingWith({
          suffix: "2",
          price: 500,
          location: "Berlin",
          category: "Mountain",
          condition: "fair",
        });
        if (!r) createResults.push("l2");
        return r;
      })();
      const l3 = await (async () => {
        const r = await createListingWith({
          suffix: "3",
          price: 1500,
          location: "Amsterdam",
          category: "City",
          condition: "good",
        });
        if (!r) createResults.push("l3");
        return r;
      })();

      if (!l1 || !l2 || !l3) {
        const errDetail =
          createResults.length > 0
            ? `(failed: ${createResults.join(", ")})`
            : "";
        const errMsg = lastCreateError
          ? `${errDetail} — ${lastCreateError}`
          : `${errDetail}. Check server logs for POST /api/listings validation.`;
        record("Filters: seed test listings", false, errMsg);
      } else {
        // Individual filters
        const byCategory = await safeFetch(
          `${BASE}/api/listings?search=${encodeURIComponent(
            filterTag,
          )}&category=Road`,
        );
        const catOk =
          byCategory.ok &&
          byCategory.data?.result?.every((x) => x.category === "Road");
        record(
          "Filters: category=Road with search tag",
          catOk,
          catOk ? "" : `payload=${JSON.stringify(byCategory.data)}`,
        );

        const byPriceRange = await safeFetch(
          `${BASE}/api/listings?search=${encodeURIComponent(
            filterTag,
          )}&minPrice=200&maxPrice=1000`,
        );
        const priceOk =
          byPriceRange.ok &&
          byPriceRange.data?.result?.every(
            (x) => x.price >= 200 && x.price <= 1000,
          );
        record(
          "Filters: price range 200-1000",
          priceOk,
          priceOk ? "" : `payload=${JSON.stringify(byPriceRange.data)}`,
        );

        const byCondition = await safeFetch(
          `${BASE}/api/listings?search=${encodeURIComponent(
            filterTag,
          )}&condition=new,fair`,
        );
        const condOk =
          byCondition.ok &&
          byCondition.data?.result?.every((x) =>
            ["new", "fair"].includes(x.condition),
          );
        record(
          "Filters: condition=new,fair",
          condOk,
          condOk ? "" : `payload=${JSON.stringify(byCondition.data)}`,
        );

        // Combined filters: AND logic
        const combined = await safeFetch(
          `${BASE}/api/listings?search=${encodeURIComponent(
            filterTag,
          )}&category=Road&minPrice=50&maxPrice=150&condition=new`,
        );
        const combinedOk =
          combined.ok &&
          combined.data?.result?.length === 1 &&
          combined.data.result[0]._id === l1._id;
        record(
          "Filters: combined (category+price+condition+search)",
          combinedOk,
          combinedOk ? "" : `payload=${JSON.stringify(combined.data)}`,
        );

        // Edge: minPrice > maxPrice → 400
        const badRange = await safeFetch(
          `${BASE}/api/listings?search=${encodeURIComponent(
            filterTag,
          )}&minPrice=2000&maxPrice=10`,
        );
        const badRangeOk = badRange.status === 400;
        record(
          "Filters: minPrice > maxPrice returns 400",
          badRangeOk,
          badRangeOk ? "" : `payload=${JSON.stringify(badRange.data)}`,
        );

        // Edge: minYear > maxYear → 400
        const badYearRange = await safeFetch(
          `${BASE}/api/listings?minYear=2025&maxYear=2020`,
        );
        const badYearOk = badYearRange.status === 400;
        record(
          "Filters: minYear > maxYear returns 400",
          badYearOk,
          badYearOk ? "" : `payload=${JSON.stringify(badYearRange.data)}`,
        );

        // Pagination with filters
        const page1 = await safeFetch(
          `${BASE}/api/listings?search=${encodeURIComponent(
            filterTag,
          )}&limit=1&page=1`,
        );
        const page2 = await safeFetch(
          `${BASE}/api/listings?search=${encodeURIComponent(
            filterTag,
          )}&limit=1&page=2`,
        );
        const pagOk =
          page1.ok &&
          page2.ok &&
          page1.data?.result?.length === 1 &&
          page2.data?.result?.length === 1 &&
          page1.data.result[0]._id !== page2.data.result[0]._id;
        record(
          "Filters: pagination with search filter",
          pagOk,
          pagOk
            ? ""
            : `page1=${JSON.stringify(page1.data)}, page2=${JSON.stringify(
                page2.data,
              )}`,
        );
      }
    }
  } catch (e) {
    record("Filters: full filter validation", false, e.message);
  }

  // 17. Optional: Admin tools & stats validation (requires VERIFY_ADMIN=1 and seeded admin)
  if (process.env.VERIFY_ADMIN === "1") {
    try {
      // Seed a known state for admin tests (users, listings, messages)
      const seedRes = await safeFetch(`${BASE}/api/test/seed`, {
        method: "POST",
      });
      if (seedRes.error || !seedRes.ok) {
        record(
          "Admin: POST /api/test/seed",
          false,
          seedRes.error || seedRes.data?.msg || `status ${seedRes.status}`,
        );
      } else {
        record("Admin: POST /api/test/seed", true, "");
      }

      const adminLoginRes = await fetch(`${BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        redirect: "manual",
      });
      const adminLoginData = await adminLoginRes.json().catch(() => ({}));
      if (!adminLoginRes.ok) {
        recordSkip(
          "Admin tools (protected)",
          "admin login failed - seed DB first",
        );
      } else {
        const adminCookieHeader = adminLoginRes.headers.get("set-cookie") || "";
        const adminTokenMatch = adminCookieHeader.match(/token=([^;]+)/);
        const adminCookies = adminTokenMatch ? `token=${adminTokenMatch[1]}` : "";

        const withAdminCookies = (opts = {}) => ({
          ...opts,
          headers: {
            "Content-Type": "application/json",
            Cookie: adminCookies,
            ...opts.headers,
          },
        });

        // Admin stats should reflect seeded data
        const statsRes = await safeFetch(
          `${BASE}/api/admin/stats`,
          withAdminCookies({ method: "GET" }),
        );
        if (statsRes.error || !statsRes.ok) {
          record(
            "Admin: GET /api/admin/stats",
            false,
            statsRes.error || statsRes.data?.msg || `status ${statsRes.status}`,
          );
        } else {
          const stats = statsRes.data?.stats || {};
          const statsOk =
            typeof stats.totalUsers === "number" &&
            typeof stats.totalListings === "number" &&
            Array.isArray(stats.recentListings);
          record(
            "Admin: stats structure & counts present",
            statsOk,
            statsOk ? "" : `stats=${JSON.stringify(stats)}`,
          );
        }

        // Admin: list users & listings
        const adminUsers = await safeFetch(
          `${BASE}/api/admin/users`,
          withAdminCookies({ method: "GET" }),
        );
        record(
          "Admin: GET /api/admin/users",
          adminUsers.ok,
          adminUsers.ok
            ? ""
            : adminUsers.data?.msg || `status ${adminUsers.status}`,
        );

        const adminListings = await safeFetch(
          `${BASE}/api/admin/listings`,
          withAdminCookies({ method: "GET" }),
        );
        record(
          "Admin: GET /api/admin/listings",
          adminListings.ok,
          adminListings.ok
            ? ""
            : adminListings.data?.msg || `status ${adminListings.status}`,
        );

        // Admin: toggle user block/role/verify and send warning on first non-admin user
        const firstUser = adminUsers.data?.users?.find(
          (u) => u.role !== "admin",
        );
        if (firstUser?._id) {
          const uid = firstUser._id;
          const blockRes = await safeFetch(
            `${BASE}/api/admin/users/${uid}/block`,
            withAdminCookies({ method: "PATCH" }),
          );
          record(
            "Admin: PATCH /api/admin/users/:id/block",
            blockRes.ok,
            blockRes.ok
              ? ""
              : blockRes.data?.msg || `status ${blockRes.status}`,
          );

          const roleRes = await safeFetch(
            `${BASE}/api/admin/users/${uid}/role`,
            withAdminCookies({ method: "PATCH" }),
          );
          const roleOk =
            roleRes.ok &&
            ["user", "admin"].includes(roleRes.data?.user?.role || "");
          record(
            "Admin: PATCH /api/admin/users/:id/role",
            roleOk,
            roleOk ? "" : roleRes.data?.msg || `status ${roleRes.status}`,
          );

          const verifyRes = await safeFetch(
            `${BASE}/api/admin/users/${uid}/verify`,
            withAdminCookies({ method: "PATCH" }),
          );
          record(
            "Admin: PATCH /api/admin/users/:id/verify",
            verifyRes.ok,
            verifyRes.ok
              ? ""
              : verifyRes.data?.msg || `status ${verifyRes.status}`,
          );

          const warnRes = await safeFetch(
            `${BASE}/api/admin/users/${uid}/warn`,
            withAdminCookies({
              method: "POST",
              body: JSON.stringify({ message: "Test admin warning" }),
            }),
          );
          record(
            "Admin: POST /api/admin/users/:id/warn",
            warnRes.ok,
            warnRes.ok
              ? ""
              : warnRes.data?.msg || `status ${warnRes.status}`,
          );

          const getWarnRes = await safeFetch(
            `${BASE}/api/admin/users/${uid}/warnings`,
            withAdminCookies({ method: "GET" }),
          );
          record(
            "Admin: GET /api/admin/users/:id/warnings",
            getWarnRes.ok,
            getWarnRes.ok
              ? ""
              : getWarnRes.data?.msg || `status ${getWarnRes.status}`,
          );
        } else {
          recordSkip(
            "Admin: user moderation endpoints",
            "no non-admin user found after seeding",
          );
        }

        // Admin: listing moderation — feature & delete first listing
        const firstListing = adminListings.data?.listings?.[0];
        if (firstListing?._id) {
          const lid = firstListing._id;
          const featRes = await safeFetch(
            `${BASE}/api/admin/listings/${lid}/featured`,
            withAdminCookies({ method: "PATCH" }),
          );
          record(
            "Admin: PATCH /api/admin/listings/:id/featured",
            featRes.ok,
            featRes.ok
              ? ""
              : featRes.data?.msg || `status ${featRes.status}`,
          );

          const patchRes = await safeFetch(
            `${BASE}/api/admin/listings/${lid}`,
            withAdminCookies({
              method: "PATCH",
              body: JSON.stringify({ listing: { title: "Admin PATCH Verified" } }),
            }),
          );
          record(
            "Admin: PATCH /api/admin/listings/:id",
            patchRes.ok,
            patchRes.ok
              ? ""
              : patchRes.data?.msg || `status ${patchRes.status}`,
          );

          const delRes = await safeFetch(
            `${BASE}/api/admin/listings/${lid}`,
            withAdminCookies({ method: "DELETE" }),
          );
          record(
            "Admin: DELETE /api/admin/listings/:id",
            delRes.ok,
            delRes.ok
              ? ""
              : delRes.data?.msg || `status ${delRes.status}`,
          );
        } else {
          recordSkip(
            "Admin: listing moderation endpoints",
            "no listing found after seeding",
          );
        }

        // Admin: reports list (may be empty but route must succeed)
        const reportsRes = await safeFetch(
          `${BASE}/api/admin/reports`,
          withAdminCookies({ method: "GET" }),
        );
        record(
          "Admin: GET /api/admin/reports",
          reportsRes.ok,
          reportsRes.ok
            ? ""
            : reportsRes.data?.msg || `status ${reportsRes.status}`,
        );

        // Non-admin access should be forbidden
        const unauthStats = await safeFetch(`${BASE}/api/admin/stats`, {
          method: "GET",
        });
        const forbidden =
          !unauthStats.ok &&
          (unauthStats.status === 401 || unauthStats.status === 403);
        record(
          "Admin: unauthorized access blocked",
          forbidden,
          forbidden
            ? ""
            : `status=${unauthStats.status}, data=${JSON.stringify(
                unauthStats.data,
              )}`,
        );
      }
    } catch (e) {
      record("Admin tools & stats (VERIFY_ADMIN=1)", false, e.message);
    }
  } else {
    recordSkip("Admin tools & stats (VERIFY_ADMIN=1)", "set VERIFY_ADMIN=1 to run");
  }

  // Summary
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const skipped = results.filter((r) => r.detail?.startsWith("skipped")).length;
  console.log(`\n--- Summary: ${passed} passed, ${failed} failed${skipped ? `, ${skipped} skipped` : ""} ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
