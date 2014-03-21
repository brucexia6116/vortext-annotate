/* -*- tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; js2-basic-offset: 2; -*- */

'use strict';
require.config({
  urlArgs: "ts="+new Date().getTime(), // disable caching - remove in production
  baseUrl: '/static/scripts',
  paths: {
    'jQuery': ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min', 'vendor/jquery'],
    'underscore': ['https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min', 'vendor/underscore'],
    'Q': ['https://cdnjs.cloudflare.com/ajax/libs/q.js/1.0.0/q.min', 'vendor/q'],
    'react': ['https://cdnjs.cloudflare.com/ajax/libs/react/0.9.0/react.min', 'vendor/react'],
    'JSXTransformer': 'vendor/JSXTransformer',
    'text': "vendor/text",
    'jsx': "vendor/jsx",
    'cortex': 'vendor/cortex',
    'PDFJS': 'vendor/pdf'
  },
  shim: {
    'cortex': { exports: 'Cortex' },
    'jQuery': { exports : 'jQuery' },
    'PDFJS': { 'exports': 'PDFJS', deps: ['vendor/pdf.worker', 'vendor/ui_utils', 'helpers/text_layer_builder'] }
  }
});

require(['react', 'cortex', 'jsx!components/app'], function (React, Cortex, App) {
  var appComponent,
      appData = { status: "ready",
                  document: { annotations: [] }};
  var appCortex = new Cortex(appData, function(updatedApp) {
    appComponent.setProps({appState: appCortex});
  });

  appComponent = React.renderComponent(
    App({appState: appCortex}),
    document.getElementById('app')
  );
});