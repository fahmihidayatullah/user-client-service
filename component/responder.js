const sendResponse = async (res, success, code, message, data, meta) => {
	res.status(code).json({
		success,
		code,
		message,
		data,
		meta
	});
	res.end();
};

module.exports = {
	sendResponse
};
