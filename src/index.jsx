import 'newrelic';
import 'babel-polyfill';
import 'source-map-support/register';

import RenderServer from './RenderServer';

const renderServer = new RenderServer();
renderServer.startListening();
