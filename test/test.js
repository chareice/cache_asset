var assert = require('assert');
var CacheAsset = require('../lib/cache_asset');

describe('CacheAsset', function() {
  describe('#FileType()', function () {
    it('能够判断正确的文件类型', function () {
      jsFile1 = "heheda.js"
      styleFile1 = "main.css"

      assert.equal('js', CacheAsset.fileType(jsFile1));
      assert.equal('css', CacheAsset.fileType(styleFile1));
    });
  });

  describe('#findItemFromQueueHashByKey()', function () {
    it('从队列中寻找到正确的对象', function () {
      CacheAsset.queueHash = {
        'js': [
          {
            key: 'a.js',
            version: 'a',
            content: null
          },{
            key: 'b.js',
            version: 'a',
            content: null
          }
        ],
        'css':[
          {
            key: 'a.css',
            version: 'a',
            content: null
          },{
            key: 'b.css',
            version: 'a',
            content: null
          }
        ]
      }

      assert.equal('a.js', CacheAsset.findItemFromQueueHashByKey('a.js').key);
      assert.equal('b.js', CacheAsset.findItemFromQueueHashByKey('b.js').key);
      assert.equal('a.css', CacheAsset.findItemFromQueueHashByKey('a.css').key);
      assert.equal('b.css', CacheAsset.findItemFromQueueHashByKey('b.css').key);
    });
  });
});
