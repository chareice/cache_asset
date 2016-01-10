var cache_asset = {};

cache_asset.queueHash = {};
/*
数据结构为
{
  type: [
    {key, version, content}
  ]
}
*/
cache_asset.findItemFromQueueHashByKey = function(key){
  var types = Object.keys(this.queueHash);
  for (var i = 0; i < types.length; i++) {
    for (var j = 0; j < this.queueHash[types[i]].length; j++) {
      var item = this.queueHash[types[i]][j];
      if(item.key == key){
        return item;
      }
    }
  }
  return null;
}

cache_asset.setQueueHashContent = function(key, content){
  //填充队列内容 当某种类型全部完成之后 写入Tag
  var type = this.fileType(key);
  var item = this.findItemFromQueueHashByKey(key);
  console.log(item);
  console.log(key);
  console.log(this.queueHash);
  item.content = content;

  //判断是否有某种类型全部加载完成
  var types = Object.keys(this.queueHash);
  for (var i = 0; i < types.length; i++) {
    var keys = Object.keys(types[i]);
    var typeContent = "";
    for (var j = 0; j < this.queueHash[types[i]].length; j++) {
      var item = this.queueHash[types[i]][j];
      if(!item.content){
        return;
      }
      typeContent += item.content;
    }//此循环若完成表明已经有类型全部完成了
    switch (types[i]) {
      case 'js':
        this.setScriptTag(typeContent);
        break;
      case 'css':
      this.setStyleTag(typeContent);
        break;
      default:
        console.error('unsupport file type' + types[i]);
    }
  }
}

cache_asset.setScriptTag = function(content){
  var script_tag = document.createElement('script');
  script_tag.type = 'text/javascript';
  script_tag.text = content;
  document.body.appendChild(script_tag);
}

cache_asset.setStyleTag = function(content){
  var style_tag = document.createElement('style');
  style_tag.type = 'text/css';
  var styleText = document.createTextNode(content);
  style_tag.appendChild(styleText);
  document.head.appendChild(style_tag);
}

cache_asset.fileType = function(filename){
  //根据文件名返回文件类型
  return filename.split('.').pop();
}

cache_asset.init = function(items){
  //items为数组
  //数组内容为
  //[
  //  {
  //    key(通常为文件名), version(版本标示), downloadUrl(下载地址)
  //  }
  //]
  //
  //

  //将任务加入到等待hash中
  for (var i = 0; i < items.length; i++) {
    var type = this.fileType(items[i].key);
    if(!this.queueHash[type]){
      this.queueHash[type] = [];
    }

    var obj = {
      content: null,
      version: items[i].version,
      key: items[i].key
    }
    console.log(this.queueHash[type]);
    this.queueHash[type].push(obj);
  }

  for (var i = 0; i < items.length; i++) {
    this.cache(items[i].key, items[i].version, items[i].downloadUrl);
  }
}

cache_asset.cache = function(key, version, downloadUrl){
  //LocalStorage中存储的对象结构为
  //{
  //  content: '文件內容'
  //  version: '版本號'
  //}

  //增加key前缀
  var cachedKey = "cache_asset_" + key;

  var existContent = window.localStorage.getItem(cachedKey);
  if(!existContent){
    //若不存在
    this.insertItem(key, version, downloadUrl);
  }else{
    //若存在 则匹配一次版本号
    var cachedItem = JSON.parse(existContent);
    if(cachedItem.version != version){
      //若已缓存的版本号和将要缓存的版本号不一致
      this.insertItem(key, version, downloadUrl);
    }else{
      //插入Tag
      this.setQueueHashContent(key, cachedItem.content);
    }
  }
}

cache_asset.insertItem = function(key, version, downloadUrl){
  var _this = this;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", downloadUrl, true);
  xhr.addEventListener("load", function (evt) {
    if (xhr.status === 200) {
      var content = evt.target.responseText;
      _this.setQueueHashContent(key, content);
      var obj = {
        content: content,
        version: version
      }
      //写入缓存
      localStorage.setItem("cache_asset_" + key, JSON.stringify(obj));
    }
  }, false);
  xhr.send();
}

try {
  module.exports = cache_asset;
} catch (e) {

}
