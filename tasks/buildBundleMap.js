var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (opts) {

    var bundles = {
        "node_modules" : {
        },
        "bundles" : {
        },
        "tpls" : {

        },
        "views": {
        }
    }
    //var dir = "";
    for(var key in opts.views){
        bundles.node_modules[key] = key;
        bundles.views[key] = key;
    }

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }
        if (file.isStream()) {
            cb(new gutil.PluginError('custom', 'Streaming not supported'));
            return;
        }
        // if(!dir){
        //     var arr = file.base.split(/[\\/]/);
        //     dir = arr[arr.length-1] || arr[arr.length-2];
        // }
        var str = path.relative(file.base, file.path);
        var arr = str.split(/[\\/]/);
        var folder = arr[arr.length-2]||"";
        if(folder.indexOf('.')>-1){
            arr.pop();
        }
        var fileName = arr.pop();
        arr.push(fileName.substr(0,fileName.lastIndexOf(".")))
        if(arr[arr.length-1].endsWith('.html')){
            bundles.tpls[arr.join("/")] = arr.join("/");
        }else{
            bundles.bundles[arr.join("/")] = arr.join("/");
        }
        bundles.views[arr.join("/")] = arr.join("/");

        //  var str = path.relative(file.base, file.path);
        //  str = str.substr(0,str.lastIndexOf('.'));
        //  var arr = str.split(/[\\/]/);
        //  arr.pop();
        //  var arr2 = str.split(/[\\/]/);
        //  if(arr[0]=="node_modules"){
        //      modsMap[arr.slice(1).join('/')] = arr.join('/');
        //      pathMap.externals[arr.slice(1).join('/')] = arr.slice(1).join('/');
        //  }else{
        //      pathMap.externals['views'+'/'+arr.join('/')] = 'views'+'/'+arr.join('/');
        //  }
        //  arr2.unshift(opts.path);
         
        //  if(path.extname(file.path)==".ts"){
        //      if(/(\s|^)import [^\n;]+?['"](\.\/|\.\.\/).+?['"]/.test(String(file.contents))){
        //         pathMap.entry[arr.join('/')] = arr2.join('/');
        //      }
        //  }else{
        //      if(/(\s|^)define\s*\([^\{\)]+?['"](\.\/|\.\.\/).+?['"]/.test(String(file.contents))){
        //         pathMap.entry[arr.join('/')] = arr2.join('/');
        //     }
        //  }
        cb();
    }, function (cb) {
        var bundlesFile = new gutil.File({
            path: "bundles.json",
            contents: new Buffer(JSON.stringify(bundles, null, '  '))//.replace(/"node_modules/g,'nodeModules+"')
        });
        this.push(bundlesFile);
        cb();
    });
};
