const httpStatus = require("http-status");
module.exports = {

	getMessageResult: function (response, msg, res) {

		// if (response?.length === 1) {
		// 	const data = Object.assign({}, ...response);
		// 	res.status(httpStatus.OK).json({ "status": true, result: data, message: msg });
		// }
		// else {
			res.status(httpStatus.OK).json({ "status": true, result: response, message: msg });
		//}

	},

	getFinalResponse: function (status, message, result, res) {
		res.status(httpStatus.OK).json({ status: status, message: message, result: result });
	},

	getFinalResponse_error: function (status, message, result, error_file_path,res) {
		res.status(httpStatus.OK).json({ status: status, message: message, result: result,error_file_path });
	},


	getErrorResult: function (errResp, res) {
		res.status(httpStatus.OK).json({ "status": false, result: '', error: errResp.message ? errResp.message : errResp });
	},

	serverError: function (errResp, res) {
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ "status": false, message: "Internal server error" });
	},

	getExistsResult: function (result, res) {
		res.status(httpStatus.OK).json({ "status": false, error: result });
	},
	getSuccessResult: function (result, res) {
		let jsonMsg = (result && result.msg) ? { "status": true, result: result, message: result.msg } : { "status": true, result: result };
		res.status(httpStatus.OK).json(jsonMsg);
	},

	getNotExistsResult: function (response, res) {
		res.status(httpStatus.OK).json({ "status": false, message: response });
	},

	getBadRequestResult: function (result, res) {
		res.status(httpStatus.BAD_REQUEST).json({ "status": false, message: 'Bad request found' });
	},

	getMessageResultPagination: function (response, msg, res) {
		res.status(httpStatus.OK).json({ "status": true, result: response.rows, count: response.count, pages: response.pages, message: msg, basePath: response.basePath });
	},

}
