import fs from 'fs';
import path from 'path';

import _ from 'lodash';

// These files will only be read once at startup time.
// It is safe to read them synchronously.
console.log(path.join(path.resolve(__dirname, '..', '..'), path.join('static', 'c.css')));
const css = fs.readFileSync(path.join(path.resolve(__dirname, '..', '..'), path.join('static', 'c.css'))); // eslint-disable-line no-sync
const js = fs.readFileSync(path.join(path.resolve(__dirname, '..', '..'), path.join('static', 'c.js'))); // eslint-disable-line no-sync

// CSS and JS are injected inline.
// This might change in the future.
const tpl = _.template(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title><%- title %></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <style><%= css %></style>
  </head>
  <body>
  <div id='__App__'><%= appHtml %></div>
  <script><%= nexusPayload %></script>
  <script><%= js %></script>
  </body>
</html>
`);

/**
 * Returns the HTML to send to the client
 * @param  {Object} data Data to bind to the template
 * @param {String} options.title Title of the page
 * @param {String} options.appHtml Raw HTML to put inside the app div container
 * @param {String} options.nexusPayload Payload exported from preparing the app
 * @return {String} HTML to safely send directly to the client
 */
function template({ title, appHtml, nexusPayload }) {
  return tpl({
    title,
    appHtml,
    js,
    css,
    nexusPayload:

      // base64 encode to obfuscate URLs and prevent injection
      `window.__NEXUS_PAYLOAD__="${new Buffer(nexusPayload).toString('base64')}"`,
  });
}

export default template;
