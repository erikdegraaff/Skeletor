var pdf = require('pdfkit');
var fs = require('fs');

var doc = new pdf;

doc.pipe(fs.createWriteStream('pdfs/test-pages.pdf'));

doc.font('Helvetica');
doc.fontSize(48);

var pages = ['Accoris', 'Agrovision', 'Bwaste', 'Iedereen'];
for(var i = 0; i < pages.length; i++) {
	doc.text(pages[i], 100, 100);
	if(i < pages.length-1) {
		doc.addPage();
	}
}

doc.end();