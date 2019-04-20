const memoryController = require('./memory-controller');

exports.register = async function(server) {

  server.route([
    {
      method: 'GET',
      path: '/api/memory/heap-dump',
      config: {
        auth: false,
        handler: memoryController.downloadHeapDump,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/memory/heap-profile',
      config: {
        auth: false,
        handler: memoryController.downloadHeapProfile,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/memory/gc',
      config: {
        auth: false,
        handler: memoryController.garbageHeap,
        tags: ['api'] }
    },
  ]);
};

exports.name = 'memory-api';
