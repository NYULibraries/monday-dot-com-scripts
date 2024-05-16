# monday-dot-com-scripts

Scripts for working with monday.com API and website.
The code in this repo is proof-of-concept level.  It is not productionized.  Use at your own risk.

# Install

```shell
git clone git@github.com:NYULibraries/monday-dot-com-scripts.git
cd monday-dot-com-scripts/
npm install
# Might need an extra step or two if Playwright has never been installed on the machine.
```

# Quickstart: download info box (a.k.a. "collaboration box") data for a board

1) Make a read-only duplicate of the monday.com board and record the board ID
2) Launch an instance of Chrome with remote debugging enabled:

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

3) Log in to monday.com
4) Run the script:

```shell
API_KEY=[REDACTED] time node get-info-boxes-for-board.mjs [BOARD ID]
```

# References

* Chromium blog post: [Remote debugging with Chrome Developer Tools](https://blog.chromium.org/2011/05/remote-debugging-with-chrome-developer.html)
* monday.com: [How to duplicate a board](https://support.monday.com/hc/en-us/articles/360000304399-How-to-duplicate-a-board)
* Playwright: [connectOverCDP](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp): "This method attaches Playwright to an existing browser instance using the Chrome DevTools Protocol."

