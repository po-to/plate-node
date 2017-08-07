var path = require('path');
var through = require('through2');

module.exports = function (opts) {
    var staticDir = "";
    function embString (template, data) {
        var re = /`\$\$([^`\n]+?)`/g;
        if (re.test(template)) {
            template = template.replace(re, function (substring) {
                var arr = arguments[1].split("@");
                var value = data[arr.shift()];
                return (value !== undefined) ? (arr.length?data[value+"@"].apply(data,arr):value) : substring;
            });
        }
        return template;
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
        if(!staticDir){
            var arr = file.base.split(/[\\/]/);
            staticDir = arr[arr.length-2];
        }
        var relativePath = path.relative(file.base, file.path);
        var arr = [];
        if(relativePath.indexOf("mod_")==0){
            arr = ["",relativePath.replace("mod_","")]
        }else{
            var arr = relativePath.split(path.sep+"mod_");
        }
        if(arr.length==2){
            var modName = arr[1].substr(0,arr[1].indexOf(path.sep));
            var modDir = arr[0];
            if(modDir){
                arr = modDir.split(path.sep);
            }else{
                arr = [];
            }
            arr.push(modName);
            opts['MODID'] = arr.join("_");
            arr.pop();
            arr.push("mod_"+modName);
            opts['MODURL'] = opts['STATICURL']+"/"+arr.join("/");
        }       
        var str = String(file.contents);
        str = embString(str, opts);
        file.contents = new Buffer(str);
        cb(null, file);
    });
};
