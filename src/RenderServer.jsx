import Promise from 'bluebird';
import createApp from 'koa';
import koaLocale from 'koa-locale';
import ReactDOMServer from 'react-dom/server';
import should from 'should/as-function';
import React from 'react';
import Nexus from 'react-nexus';

import App from './components/App';
import createFlux from './createFlux';
import pageTemplate from './pageTemplate';

const __DEV__ = process.env.NODE_ENV === 'development';

// These symbols enumerate the possible states of a Server instance
const [NOT_STARTED, STARTED, STOPPED] = [Symbol('NOT_STARTED'), Symbol('STARTED'), Symbol('STOPPED')];

class RenderServer {
  /**
   * koa app
   * @type {Object}
   */
  app = null;

  /**
   * server status
   * @type {Symbol}
   */
  _status = null;

  /**
   * server instance
   * @type {Object}
   */
  server = null;

  constructor(config) {
    this._status = NOT_STARTED;
    this.app = createApp();

    this.app.use(function *(){
      const flux = createFlux();
      const app = <App flux={flux} />;
      yield Nexus.prepare(app);
      console.log(flux.dumpState());
      this.body = pageTemplate({
        appHtml: ReactDOMServer.renderToString(app),
        nexusPayload: JSON.stringify(flux.dumpState()),
      })
    });

    koaLocale(this.app);
  }

  getApp() {
    return this.app;
  }

  /**
   * Start listening for incoming requests
   * @return {Promise} Resolves when/if the server successfully starts
   */
  startListening() {
    return new Promise((resolve, reject) => {
      if(__DEV__) {
        should(this._status).be.exactly(NOT_STARTED);
      }

      // Grab a reference to the HTTPServer instance so we can close it later
      this.server = this.app.listen(5555, (err) => {
        if(err) {
          return reject(err);
        }
        return resolve(this.server.address());
      });
    })
    .then((addr) => {
      this._status = STARTED;
    });
  }

  /**
   * Stop listning for incoming requests
   * @return {Promise} Resolves when/if the server successfully stops
   */
  stopListening() {
    return Promise.try(() => {
      if(__DEV__) {
        should(this._status).be.exactly(STARTED);
      }
      return Promise.promisify(this.server.close, { context: this.server })();
    })
    .then(() =>
      this._status = STOPPED
    );
  }

  /**
   * Returns a supertest instance wrapping the express app for testing
   * @param {Function} supertest A supertest function
   * @return {Object} supertest instance
   */
  test(supertest) {
    return supertest(this.app);
  }
}

export default RenderServer;
