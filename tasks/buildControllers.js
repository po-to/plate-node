var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (opts) {

    var modsMap = {};
    var dir = "";
    
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }
        if (file.isStream()) {
            cb(new gutil.PluginError('custom', 'Streaming not supported'));
            return;
        }
        if(!dir){
            var arr = file.base.split(/[\\/]/);
            dir = arr[arr.length-1] || arr[arr.length-2];
        }
         var str = path.relative(file.base, file.path);
         str = dir+'/'+str.substr(0,str.lastIndexOf('.con.')).replace(/\\/g,'/');
         modsMap[str.substr(str.indexOf('/')+1)] = str+'.con';
         cb();
    }, function (cb) {
        var modFile = new gutil.File({
            path: "controllers.json",
            contents: new Buffer(JSON.stringify(modsMap, null, '  '))
        });
        this.push(modFile);
        cb();
    });
};
