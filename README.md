# Playwright Test Automation Boilerplate

This project provides a robust and scalable Playwright test automation framework, designed to be easily extended and integrated into your projects. It includes examples for different user roles and demonstrates the use of Page Object Model (POM) for maintainable tests.

## Table of Contents

- [Playwright Test Automation Boilerplate](#playwright-test-automation-boilerplate)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Project Structure](#project-structure)
  - [Running Tests](#running-tests)
    - [Run all tests](#run-all-tests)
    - [Run tests by file](#run-tests-by-file)
    - [Run tests by specific test name](#run-tests-by-specific-test-name)
    - [Run tests with specific projects (browsers)](#run-tests-with-specific-projects-browsers)
    - [Run tests in UI Mode](#run-tests-in-ui-mode)
    - [Generate HTML Report](#generate-html-report)
    - [View Trace Report](#view-trace-report)
  - [Extending the Framework](#extending-the-framework)
    - [Adding a New User Role](#adding-a-new-user-role)
    - [Creating a New Page Object Model (POM)](#creating-a-new-page-object-model-pom)
  - [Configuration](#configuration)
  - [CI/CD Integration](#cicd-integration)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd playwright-boilerplate
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Project Structure

```
playwright-boilerplate/
├── .env                                # Environment variables
├── .github/workflows/playwright.yml    # GitHub Actions CI/CD workflow
├── playwright.config.ts                # Playwright configuration file
├── playwright/                         # Playwright-specific files
│   ├── .auth/                          # Authentication state files
│   │   ├── admin.json
│   │   └── user.json
│   ├── fixtures/                       # Custom fixtures for different user roles
│   │   ├── adminFixtures.ts
│   │   └── userFixtures.ts
│   └── pages/                          # Page Object Models
│       ├── BasePage.ts                 # Base class for all page objects
│       ├── adminPages/                 # Admin-specific page objects
│       └── userPages/                  # User-specific page objects
├── tests/                              # Test files
│   ├── admin/                          # Admin-specific tests
│   │   └── admin.spec.ts
│   └── user/                           # User-specific tests
│       └── user.spec.ts
└── utils/                              # Utility functions
    └── db.ts                           # Example database utility
```

### Database Utility (`utils/db.ts`)

The `utils/db.ts` file provides utility functions for interacting with the database, primarily for test data setup, teardown, and fetching dynamic data required during tests (e.g., One-Time Passwords).

**Example: Fetching OTP for Authentication**

The `getOtpByEmail` function is used in custom fixtures to retrieve an OTP for a given email, which is crucial for authentication flows that involve OTP verification.

```typescript
// playwright/fixtures/userFixtures.ts (excerpt)
import { getOtpByEmail } from '../../utils/db';

// ... inside a fixture ...
const userOtp = await getOtpByEmail(process.env.USER_EMAIL as string);
console.log(`User OTP for ${process.env.USER_EMAIL}: ${userOtp}`);
// ... use userOtp for login ...
```

This utility helps in creating robust and dynamic test scenarios by allowing direct interaction with the test environment's database.

**Adding New Database Query Functions**

To add new database query functions, you can leverage the `executeQuery` function provided in `utils/db.ts`. This function handles the database connection and execution, allowing you to focus on your SQL query.

1.  **Define your SQL query**: Write the SQL query you need to perform.
2.  **Create an async function**: Wrap your query execution in an `async` function.
3.  **Use `executeQuery`**: Call `executeQuery` with your SQL query and any necessary parameters.

```typescript
// utils/db.ts (example of adding a new function)

export async function getUserById(userId: number): Promise<any | null> {
  if (!connection) {
    await connectToDatabase();
  }
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}
```

Remember to handle potential errors and ensure that `connectToDatabase()` is called if the connection is not already established before executing queries. The `closeDatabaseConnection()` function should be used when database interactions are complete, typically in a global teardown or after a series of database operations.

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run tests by file

```bash
npx playwright test tests/user/user.spec.ts
```

### Run tests by specific test name

```bash
npx playwright test -g "should be able to access user portal"
```

### Run tests with specific projects (browsers)

```bash
npx playwright test --project=chromium
```

### Run tests in UI Mode

```bash
npx playwright test --ui
```

### Generate HTML Report

After running tests, you can generate an HTML report:

```bash
npx playwright show-report
```

### View Trace Report

To view the trace of a failed test:

```bash
npx playwright show-trace test-results/user-user-user-should-be-able-to-access-user-portal-chromium/trace.zip
```

## Extending the Framework

### Adding a New User Role

To add a new user role (e.g., `manager`):

1.  **Update the `.env` file**: 
    Add the URL, email, and password for the new role in `playwright-boilerplate/.env`.
    ```dotenv
    MANAGER_URL=https://your-manager-app.com
    MANAGER_EMAIL=manager@example.com
    MANAGER_PASSWORD=manager_password
    ```

2.  **Create an authentication state file**: 
    Create `playwright/.auth/manager.json`. This file will store the authentication state for the manager user.

3.  **Create role-specific page objects**: 
    Create a new directory `playwright/pages/managerPages/` and add your page objects there (e.g., `ManagerPage.ts`, `ManagerDashboardPage.ts`).
    ```typescript
    import { Page } from '@playwright/test';
    import { BasePage } from '../BasePage';

    export class ManagerPage extends BasePage {
      constructor(public page: Page) {
        super(page, process.env.MANAGER_URL as string);
      }
      // Add any manager-specific methods here
    }
    ```

4.  **Create a custom fixture**: 
    Create `playwright/fixtures/managerFixtures.ts`. This fixture will handle the authentication and provide a `managerPage` object. The fixture first checks if an authentication state file (`manager.json`) exists. If it does, it reuses the stored session. If not, or if the session is invalid, it performs a full login using the credentials from the `.env` file and then saves the new authentication state to `manager.json` for future use.
    ```typescript
    import { test as baseTest, expect, Page } from '@playwright/test';
    import { ManagerPage } from '../pages/managerPages/ManagerPage'; // Assuming you create this page object
    import * as fs from 'fs';
    import * as path from 'path';
    import dotenv from 'dotenv';

    dotenv.config();

    const managerAuthFile = 'playwright/.auth/manager.json';

    type MyFixtures = {
      managerPage: ManagerPage;
    };

    export const test = baseTest.extend<MyFixtures>({
      managerPage: async ({ browser }, use) => {
        let page: Page | undefined;

        if (fs.existsSync(managerAuthFile)) {
          const context = await browser.newContext({ storageState: managerAuthFile });
          const tempPage = await context.newPage();
          await tempPage.goto(process.env.MANAGER_URL as string);
          try {
            await expect(tempPage.getByRole('heading', { name: 'Manager Dashboard' })).toBeVisible({ timeout: 5000 }); // Adjust locator as per manager dashboard
            page = tempPage;
          } catch (e) {
            console.log('Manager session expired, re-authenticating...');
            await tempPage.close();
          }
        }

        if (!page) {
          const context = await browser.newContext();
          page = await context.newPage();
          await page.goto(process.env.MANAGER_URL as string);
          await page.locator('#username').fill(process.env.MANAGER_EMAIL as string);
          await page.locator('#password').fill(process.env.MANAGER_PASSWORD as string);
          await page.locator('#loginButton').click();
          // Add any additional steps for manager login, e.g., OTP
          await expect(page.getByRole('heading', { name: 'Manager Dashboard' })).toBeVisible(); // Adjust locator as per manager dashboard
          await page.context().storageState({ path: managerAuthFile });
        }
        await use(new ManagerPage(page as Page));
      },
    });
    ```
    
5.  **Create a spec file for the role**: 
    Create a new directory `tests/manager/` and add your test files (e.g., `manager.spec.ts`).
    ```typescript
    import { test } from '../../playwright/fixtures/managerFixtures';
    import { expect } from '@playwright/test';

    test('manager should be able to view manager dashboard', async ({ managerPage }) => {
      await managerPage.gotoManagerDashboard();
      await expect(managerPage.dashboardTitle).toHaveText('Manager Dashboard');
    });
    ```

### Creating a New Page Object Model (POM)

1.  **Create a new POM file**: 
    Inside a role-specific directory (e.g., `playwright/pages/userPages/`), create a new TypeScript file for your POM (e.g., `ProductListPage.ts`).
    ```typescript
    import { Page, Locator } from '@playwright/test';
    import { BasePage } from '../BasePage';

    export class ProductListPage extends BasePage {
      readonly productListTitle: Locator;
      readonly firstProductLink: Locator;

      constructor(public page: Page) {
        super(page, process.env.USER_URL as string);
        this.productListTitle = page.locator('h1', { hasText: 'Product List' });
        this.firstProductLink = page.locator('.product-item a').first();
      }

      async navigate() {
        await this.goto('/products');
      }

      async clickFirstProduct() {
        await this.firstProductLink.click();
      }
    }
    ```

2.  **Declare the new POM in its respective fixture file**: 
    In the relevant fixture file (e.g., `playwright/fixtures/userFixtures.ts`), declare the new POM.
    ```typescript
    import { test as baseTest, Page } from '@playwright/test';
    import { UserPage } from '../pages/userPages/UserPage';
    import { CartPage } from '../pages/userPages/CartPage';
    import { FavoritesPage } from '../pages/userPages/FavoritesPage';
    import { ProductListPage } from '../pages/userPages/ProductListPage'; // Import your new POM

    type UserFixtures = {
      userPage: UserPage;
      cartPage: CartPage;
      favoritesPage: FavoritesPage;
      productListPage: ProductListPage; // Add your new POM to the fixtures type
    };

    export const test = baseTest.extend<UserFixtures>({
      userPage: async ({ page }, use) => {
        await use(new UserPage(page));
      },
      cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
      },
      favoritesPage: async ({ page }, use) => {
        await use(new FavoritesPage(page));
      },
      productListPage: async ({ page }, use) => { // Instantiate and provide your new POM
        await use(new ProductListPage(page));
      },
    });
    ```

3.  **Show an example with the used fixture in a spec file**: 
    In a test file (e.g., `tests/user/user.spec.ts`), demonstrate how to use the new POM with the fixture.
    ```typescript
    import { test, expect } from '../../playwright/fixtures/userFixtures'; // Use the custom fixture

    test('should navigate to product list and click first product', async ({ productListPage }) => {
      await productListPage.goto();
      await expect(productListPage.productListTitle).toBeVisible();
      await productListPage.clickFirstProduct();
      // Assert navigation to product detail page
    });
    ```

## Configuration

The `playwright.config.ts` file contains the main configuration for Playwright. Here you can define:

-   **Projects**: Configure different browsers (chromium, firefox, webkit). User roles are managed via custom fixtures, not directly as projects here.
-   **Base URL**: Set the base URL for your application.
-   **Retries**: Configure the number of retries for failed tests.
-   **Reporters**: Specify test reporters (e.g., html, list, json).

Refer to the [Playwright documentation](https://playwright.dev/docs/test-configuration) for more details.

## CI/CD Integration

The `.github/workflows/playwright.yml` file provides an example of how to integrate Playwright tests with GitHub Actions. This workflow will run your tests on every push and pull request to the `main` branch. You can adapt this to other CI/CD platforms like GitLab CI, Jenkins, etc.

### Environment Variables and GitHub Secrets

For security reasons, sensitive information such as URLs, usernames, and passwords should not be committed directly to your repository. This project uses environment variables, typically defined in a `.env` file for local development. However, for CI/CD environments like GitHub Actions, these variables must be managed securely using **GitHub Secrets**.

**To set up your environment variables in GitHub Actions:**

1.  **Add `.env` to `.gitignore`**: Ensure that your `.env` file is listed in your `.gitignore` to prevent it from being accidentally committed. This has already been done for you.
2.  **Create GitHub Secrets**:
    *   Go to your repository on GitHub.
    *   Navigate to "Settings" -> "Secrets and variables" -> "Actions".
    *   Click "New repository secret".
    *   For each of the following environment variables, create a corresponding GitHub Secret with its value:
        *   `ADMIN_URL`
        *   `ADMIN_EMAIL`
        *   `ADMIN_PASSWORD`
        *   `USER_URL`
        *   `USER_EMAIL`
        *   `USER_PASSWORD`
        *   `DB_HOST`
        *   `DB_USER`
        *   `DB_PASSWORD`
        *   `DB_NAME`
    *   The `playwright.yml` workflow is configured to automatically pick up these secrets and expose them as environment variables during the test run.

This approach ensures that your sensitive data is kept secure and separate from your codebase, while still being accessible to your CI/CD pipeline.

Feel free to explore and modify the existing tests and page objects to fit your application's needs. Happy testing!