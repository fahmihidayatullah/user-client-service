const sanitizeHtml=require('sanitize-html');
const striptags=require('striptags');
const stripmoji=(string)=>{
	string=string.toString();
	string=string.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
	string=string.replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?|[\u20E3]|[\u26A0-\u3000]|\uD83E[\udd00-\uddff]|[\u00A0-\u269F]/g, '');
	string=string.replace(/[^\x20-\x7E]/g, '');
	return string;
};

module.exports=()=>{
	return (req, _res, next)=>{
		Object.keys(req.body).forEach(key=>{ if ( typeof req.body[ key ] !== "object" ){req.body[ key ]=striptags(sanitizeHtml(stripmoji(req.body[ key ])))}});
		Object.keys(req.body).forEach(key=>{ if ( typeof req.body[ key ] !== "object" ){req.body[ key ]=req.body[ key ].replace(/&amp;/g, '&')}});
		Object.keys(req.params).forEach(key=>{ if (req.params[ key ]){req.params[ key ]=striptags(sanitizeHtml(stripmoji(req.params[ key ])))}});
		if (req.hostname){req.hostname=striptags(sanitizeHtml(stripmoji(req.hostname)))}
		if (req.originalUrl){req.originalUrl=striptags(sanitizeHtml(stripmoji(req.originalUrl)))}
		if (req.method){req.method=striptags(sanitizeHtml(stripmoji(req.method)))}
		next();
	};
};
