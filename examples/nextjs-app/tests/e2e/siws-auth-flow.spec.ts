import { test, expect, Page } from '@playwright/test';

test.describe('SIWS Authentication Flow', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Reset logs for each test
    consoleLogs = [];
    consoleErrors = [];

    // Listen to console events
    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Listen to page errors
    page.on('pageerror', (error) => {
      const errorText = `[PAGE ERROR] ${error.message}`;
      consoleErrors.push(errorText);
    });
  });

  test('should load homepage and display connect wallet UI', async ({ page }) => {
    // Step 1: Navigate to http://localhost:3000
    console.log('Step 1: Navigating to homepage...');
    await page.goto('/');
    
    // Take screenshot of initial page load
    await page.screenshot({ 
      path: 'tests/screenshots/01-homepage-loaded.png',
      fullPage: true 
    });
    
    // Verify page title and main elements
    await expect(page).toHaveTitle(/Better-SIWS/);
    
    // Check that the main components are present
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for the auth card
    await expect(page.getByText('Connect Your Wallet')).toBeVisible();
    
    console.log('✓ Homepage loaded successfully');
    console.log(`Console logs count: ${consoleLogs.length}`);
    console.log(`Console errors count: ${consoleErrors.length}`);
  });

  test('should display and interact with Connect Wallet button', async ({ page }) => {
    await page.goto('/');
    
    // Step 2: Click on the "Connect Wallet" button
    console.log('Step 2: Looking for Connect Wallet button...');
    
    const connectWalletButton = page.getByRole('button', { name: /Connect Wallet/i });
    await expect(connectWalletButton).toBeVisible();
    
    // Take screenshot before clicking
    await page.screenshot({ 
      path: 'tests/screenshots/02-before-connect-wallet-click.png',
      fullPage: true 
    });
    
    console.log('Step 2: Clicking Connect Wallet button...');
    await connectWalletButton.click();
    
    // Wait a moment for any modal or UI changes
    await page.waitForTimeout(1000);
    
    // Take screenshot after clicking
    await page.screenshot({ 
      path: 'tests/screenshots/03-after-connect-wallet-click.png',
      fullPage: true 
    });
    
    console.log('✓ Connect Wallet button clicked');
    console.log(`Console logs count: ${consoleLogs.length}`);
    console.log(`Console errors count: ${consoleErrors.length}`);
  });

  test('should handle wallet modal and no extension scenario', async ({ page }) => {
    await page.goto('/');
    
    // Click Connect Wallet button to open modal
    const connectWalletButton = page.getByRole('button', { name: /Connect Wallet/i });
    await connectWalletButton.click();
    
    // Step 3: Check what happens when no wallet is installed
    console.log('Step 3: Testing wallet modal behavior...');
    
    // Wait for modal or any dynamic content to appear
    await page.waitForTimeout(2000);
    
    // Look for wallet modal or any error messages
    const modal = page.locator('[role="dialog"]');
    const modalVisible = await modal.isVisible().catch(() => false);
    
    if (modalVisible) {
      console.log('✓ Wallet modal appeared');
      
      // Take screenshot of modal
      await page.screenshot({ 
        path: 'tests/screenshots/04-wallet-modal-opened.png',
        fullPage: true 
      });
      
      // Check for wallet extension options or error messages
      const polkadotjsOption = page.getByText(/Polkadot/i);
      const talismanOption = page.getByText(/Talisman/i);
      const subwalletOption = page.getByText(/SubWallet/i);
      
      const hasPolkadotjs = await polkadotjsOption.isVisible().catch(() => false);
      const hasTalisman = await talismanOption.isVisible().catch(() => false);
      const hasSubwallet = await subwalletOption.isVisible().catch(() => false);
      
      console.log(`Polkadot.js option visible: ${hasPolkadotjs}`);
      console.log(`Talisman option visible: ${hasTalisman}`);
      console.log(`SubWallet option visible: ${hasSubwallet}`);
      
      // Try clicking on wallet options to see error handling
      if (hasPolkadotjs) {
        console.log('Testing Polkadot.js extension click...');
        await polkadotjsOption.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot after clicking wallet option
        await page.screenshot({ 
          path: 'tests/screenshots/05-after-wallet-option-click.png',
          fullPage: true 
        });
      }
    } else {
      console.log('No wallet modal detected');
      
      // Check if there are any error messages or different UI
      const errorMessage = page.locator('[role="alert"]');
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      if (hasError) {
        console.log('✓ Error message displayed');
        await page.screenshot({ 
          path: 'tests/screenshots/04-error-message.png',
          fullPage: true 
        });
      }
    }
    
    console.log('✓ Wallet interaction test completed');
    console.log(`Console logs count: ${consoleLogs.length}`);
    console.log(`Console errors count: ${consoleErrors.length}`);
  });

  test('should capture and analyze console logs and errors', async ({ page }) => {
    await page.goto('/');
    
    // Interact with the page to generate logs
    const connectWalletButton = page.getByRole('button', { name: /Connect Wallet/i });
    await connectWalletButton.click();
    
    // Wait for any async operations
    await page.waitForTimeout(3000);
    
    // Step 5: Analyze console logs and errors
    console.log('\n=== CONSOLE LOGS ANALYSIS ===');
    console.log(`Total console messages: ${consoleLogs.length}`);
    console.log(`Total console errors: ${consoleErrors.length}`);
    
    if (consoleLogs.length > 0) {
      console.log('\nAll Console Messages:');
      consoleLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    }
    
    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✓ No console errors detected');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/06-final-state.png',
      fullPage: true 
    });
    
    // Write logs to file for detailed analysis
    const logsContent = {
      timestamp: new Date().toISOString(),
      totalLogs: consoleLogs.length,
      totalErrors: consoleErrors.length,
      allLogs: consoleLogs,
      errors: consoleErrors
    };
    
    await page.evaluate((logs) => {
      // This will be available in the test results
      console.log('=== DETAILED LOGS FOR ANALYSIS ===');
      console.log(JSON.stringify(logs, null, 2));
    }, logsContent);
  });

  test('should test accessibility and page structure', async ({ page }) => {
    await page.goto('/');
    
    console.log('Testing page accessibility and structure...');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toBeVisible();
    console.log(`✓ H1 found: ${await h1.textContent()}`);
    
    const h2Count = await h2.count();
    console.log(`✓ H2 elements found: ${h2Count}`);
    
    // Check for proper button accessibility
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`✓ Buttons found: ${buttonCount}`);
    
    // Check for ARIA labels and roles
    const connectButton = page.getByRole('button', { name: /Connect Wallet/i });
    const buttonText = await connectButton.textContent();
    console.log(`✓ Connect button text: ${buttonText}`);
    
    // Check for proper link structure
    const links = page.locator('a');
    const linkCount = await links.count();
    console.log(`✓ Links found: ${linkCount}`);
    
    // Take accessibility screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/07-accessibility-check.png',
      fullPage: true 
    });
    
    console.log('✓ Accessibility check completed');
  });

  test.afterEach(async ({ page }) => {
    // Final log summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Final console logs: ${consoleLogs.length}`);
    console.log(`Final console errors: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\nErrors that occurred during test:');
      consoleErrors.forEach(error => console.log(`- ${error}`));
    }
  });
});