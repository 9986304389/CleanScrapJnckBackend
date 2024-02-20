const _ = require('lodash');

module.exports = {
   
    getReqValues(req) {
        // Handle req.files to check if a file has been sent
        const files = req.files || {};

        return _.pickBy(_.extend(req.body, req.params, req.query,req.files), _.identity,files);
    },
   
};



