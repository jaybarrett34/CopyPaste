const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('CopyPaste Electron App UI Testing', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch the installed app
    const appPath = '/Applications/CopyPaste.app/Contents/MacOS/CopyPaste';

    console.log('Launching Electron app from:', appPath);

    electronApp = await electron.launch({
      executablePath: appPath,
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });

    // Wait for window to be created
    window = await electronApp.firstWindow();

    // Wait a bit for the app to fully initialize
    await window.waitForTimeout(2000);

    console.log('App launched successfully');
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should capture collapsed state screenshot', async () => {
    console.log('Test 1: Capturing collapsed state');

    // Get window bounds
    const bounds = await window.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    });

    console.log('Window dimensions (collapsed):', bounds);

    // Take screenshot of collapsed state
    await window.screenshot({
      path: '/Users/bigballsinyourjaws/Projects/CopyPaste/screenshot-collapsed.png',
      fullPage: true
    });

    console.log('Screenshot saved: screenshot-collapsed.png');
    console.log('Expected: 140×50, Actual:', bounds);
  });

  test('should click expand button and capture expanded state', async () => {
    console.log('Test 2: Clicking + button to expand');

    // Find and click the + button
    const expandButton = window.locator('button:has-text("+")');

    // Check if button exists
    const buttonExists = await expandButton.count();
    console.log('+ button found:', buttonExists > 0);

    if (buttonExists > 0) {
      await expandButton.click();
      console.log('Clicked + button');

      // Wait for animation
      await window.waitForTimeout(500);

      // Get new window bounds
      const bounds = await window.evaluate(() => {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        };
      });

      console.log('Window dimensions (expanded):', bounds);

      // Take screenshot of expanded state
      await window.screenshot({
        path: '/Users/bigballsinyourjaws/Projects/CopyPaste/screenshot-expanded.png',
        fullPage: true
      });

      console.log('Screenshot saved: screenshot-expanded.png');
      console.log('Expected: 600×60 (or 500×85 based on docs), Actual:', bounds);
    } else {
      console.log('ERROR: + button not found in UI');
    }
  });

  test('should check for sliders visibility', async () => {
    console.log('Test 3: Checking slider visibility');

    // Look for sliders
    const sliders = await window.locator('input[type="range"]').count();
    console.log('Number of sliders found:', sliders);

    // Try to find Temperature slider
    const tempSlider = window.locator('input[type="range"]').first();
    const tempSliderExists = await tempSlider.count();
    console.log('Temperature slider exists:', tempSliderExists > 0);

    if (tempSliderExists > 0) {
      // Check if it's interactable
      const isVisible = await tempSlider.isVisible();
      const isEnabled = await tempSlider.isEnabled();
      console.log('Temperature slider visible:', isVisible);
      console.log('Temperature slider enabled:', isEnabled);

      // Try to get its value
      const value = await tempSlider.inputValue();
      console.log('Temperature slider current value:', value);

      // Try to interact with it
      try {
        await tempSlider.fill('75');
        console.log('Successfully changed slider to 75');
        const newValue = await tempSlider.inputValue();
        console.log('New slider value:', newValue);
      } catch (error) {
        console.log('ERROR: Cannot interact with slider:', error.message);
      }
    }

    // Check for any element with "Pause" text
    const pauseElements = await window.locator('text=/pause/i').count();
    console.log('Elements containing "Pause":', pauseElements);

    // Take screenshot showing sliders
    await window.screenshot({
      path: '/Users/bigballsinyourjaws/Projects/CopyPaste/screenshot-sliders.png',
      fullPage: true
    });
    console.log('Screenshot saved: screenshot-sliders.png');
  });

  test('should test window draggability', async () => {
    console.log('Test 4: Testing window draggability');

    // Get initial window position
    const initialBounds = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      return win.getBounds();
    });

    console.log('Initial window position:', initialBounds);

    // Try to drag the window (simulate drag)
    const body = window.locator('body');
    const box = await body.boundingBox();

    if (box) {
      console.log('Attempting to drag window from center');

      // Simulate drag from center
      await window.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await window.mouse.down();
      await window.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
      await window.mouse.up();

      await window.waitForTimeout(500);

      // Get new window position
      const newBounds = await electronApp.evaluate(async ({ BrowserWindow }) => {
        const win = BrowserWindow.getAllWindows()[0];
        return win.getBounds();
      });

      console.log('New window position:', newBounds);

      const moved = (initialBounds.x !== newBounds.x || initialBounds.y !== newBounds.y);
      console.log('Window moved:', moved);

      if (moved) {
        console.log('WARNING: Window is draggable (should NOT be according to user)');
      } else {
        console.log('Window is NOT draggable (as expected)');
      }
    }
  });

  test('should inspect DOM structure', async () => {
    console.log('Test 5: Inspecting DOM structure');

    // Get all visible text
    const bodyText = await window.locator('body').textContent();
    console.log('All visible text:', bodyText);

    // Get all buttons
    const buttons = await window.locator('button').allTextContents();
    console.log('All buttons:', buttons);

    // Get all inputs
    const inputs = await window.locator('input').count();
    console.log('Number of input elements:', inputs);

    // Get input types
    const inputDetails = await window.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(input => ({
        type: input.type,
        id: input.id,
        className: input.className,
        value: input.value,
        disabled: input.disabled
      }));
    });
    console.log('Input details:', JSON.stringify(inputDetails, null, 2));

    // Get all divs with classes
    const divs = await window.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div[class]'));
      return divs.map(div => div.className).slice(0, 20); // First 20
    });
    console.log('Div classes:', divs);

    // Take final screenshot
    await window.screenshot({
      path: '/Users/bigballsinyourjaws/Projects/CopyPaste/screenshot-final.png',
      fullPage: true
    });
    console.log('Screenshot saved: screenshot-final.png');
  });
});
