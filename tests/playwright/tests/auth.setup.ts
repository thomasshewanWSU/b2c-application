import { test as setup } from "@playwright/test";
import fs from "fs";

////////////////////////////////////////
// Authentication for Assignment 2
// Delete the code block below if you are not using it
////////////////////////////////////////

// setup(
//   "authenticate assignment 2",
//   { tag: "@a2" },
//   async ({ page, playwright }) => {
//     const authFile = ".auth/user.json";
//     const content = {
//       cookies: [
//         {
//           name: "auth_token",
//           value: "123",
//           domain: "localhost",
//           secure: false,
//           expires: -1,
//           path: "/",
//           httpOnly: false,
//           sameSite: "Lax",
//         },
//       ],
//     };
//     fs.writeFileSync(authFile, JSON.stringify(content, null, 2));
//   },
// );

////////////////////////////////////////////////////////
// Authentication for Assignment 3
// Uncomment once you start working on the assignment 3
////////////////////////////////////////////////////////

setup("authenticate assignment 3", { tag: "@a3" }, async ({ playwright }) => {
  const authFile = ".auth/user.json";

  const apiContext = await playwright.request.newContext();

  await apiContext.post("/api/login", {
    data: JSON.stringify({ password: "123" }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  await apiContext.storageState({ path: authFile });
});
