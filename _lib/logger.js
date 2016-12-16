"strict";

var winston = require("winston");

module.exports = function(label){
    if( label.match(/(\/[\w\.\-]+)+$/i) )
        this.label = RegExp.$1;
    this.label = this.label.replace(/\.js/,"").replace(/\//g,".");
    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                timestamp: function() {
                    return new Date().toISOString();
                },
                label: this.label,
                formatter: function(options) {
                    // Return string will be passed to logger.
                    return options.timestamp() +' ['+ options.level.toUpperCase() +'] ' +'['+ options.label +'] ' + (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
                }
            })
        ]
    });
};
