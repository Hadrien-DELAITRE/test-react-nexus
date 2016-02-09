import React from 'react';
import ReactDOM from 'react-dom';
import should from 'should/as-function';
import Nexus from 'react-nexus';

import App from './components/App';
import createFlux from './createFlux';

const __DEV__ = process.env.NODE_ENV === 'development';

const reflux = createFlux().loadState(JSON.parse(new Buffer(window.__NEXUS_PAYLOAD__, 'base64').toString('utf8')));
ReactDOM.render(<App flux={reflux} />, document.getElementById('__App__'));
