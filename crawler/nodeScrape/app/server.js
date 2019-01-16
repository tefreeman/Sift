// We'll use Puppeteer is our browser automation framework.
const puppeteer = require('puppeteer');

import UserAgent from 'user-agents';

const userAgent = new UserAgent();

// Outputs: true

// This is where we'll put the code to get around the tests.
const preparePageForTests = async (page) => {

  // Pass the User-Agent Test.
  await page.setUserAgent(userAgent.toString());

  // Pass the Webdriver Test.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  // Pass the Chrome Test.
  await page.evaluateOnNewDocument(() => {
    // We can mock this in as much depth as we need for the test.
    window.navigator.chrome = {
      runtime: {},
      // etc.
    };
  });

  // Pass the Permissions Test.
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    return window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  // Pass the Plugins Length Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
      function MyPlugin () { }
      const plugin = new MyPlugin();
      Object.setPrototypeOf(plugin, Plugin.prototype);
    
  });

  // Pass the Languages Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });
}

(async () => {
  // Launch the browser in headless mode and set up a page.
  const browser = await puppeteer.launch({
    args: ['--no-sandbox',
    '--proxy-server=http://91.238.223.41:57420'
                        ],
    headless: false,
    defaultViewport: {
      width: userAgent.data.viewportWidth,
      height: userAgent.data.viewportHeight,
      isMobile: userAgent.data.deviceCategory === 'mobile' ? true : false,
      hasTouch: userAgent.data.deviceCategory === 'mobile' ? true : false,

    }
  });
  const page = await browser.newPage();

  // Prepare for the tests (not yet implemented).
  await preparePageForTests(page);

  // Navigate to the page that will perform the tests.
  const testUrl = 'https://yelp.com'
  await page.goto(testUrl);

  // Save a screenshot of the results.
  await page.screenshot({path: 'headless-test-result.png'});

  // Clean up.


})();