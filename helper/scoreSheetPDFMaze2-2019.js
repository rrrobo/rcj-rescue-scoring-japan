const PDFDocument = require('pdfkit');
const pdf = require('./scoreSheetPDFUtil');
const qr = require('qr-image');
const logger = require('../config/logger').mainLogger;

/**
 * Defines some important numbers for the placement of different objects in the scoresheet.
 */
const globalConfig = {
  paperSize: {x:841.89 ,y:595.28},
};


function drawRun(doc, config, scoringRun) {
  //Set template image as a background
  pdf.drawImage(doc,0,0,"public/images/sheetM.jpg",841.89,595.28,"center");

  //Draw competition name & logo
  pdf.drawTextWithAlign(doc,90,15,scoringRun.competition.name + "  Scoresheet",20,"black",660,"center");
  pdf.drawImage(doc,730,5,"public/images/2019logo.png",100,30,"right");

  //Draw run QR code
  doc.image(qr.imageSync("M;" + scoringRun._id.toString(), {margin: 0}), 10, 10, {width: 65});

  //Draw team name
  pdf.drawTextWithAlign(doc,120,44,scoringRun.team.name,15,"black",300,"center");

  //Draw start time
  let dateTime = new Date(scoringRun.startTime);
  pdf.drawTextWithAlign(doc,120,61,("0" + dateTime.getHours()).slice(-2) + ":" + ("0" + dateTime.getMinutes()).slice(-2),15,"black",60,"center");

  //Draw round name
  pdf.drawTextWithAlign(doc,225,61,scoringRun.round.name,15,"black",95,"center");

  //Draw field name
  pdf.drawTextWithAlign(doc,355,61,scoringRun.field.name,15,"black",60,"center");

  //Draw map image
  pdf.drawImage(doc,15,87,"tmp/course/" + scoringRun.map._id + ".png",403,490,"center");

  //Draw dice
  pdf.drawImage(doc,423,450,"public/images/dice/" + scoringRun.diceNumber + ".png",25,25,"center");

  //Footer
  pdf.drawText(doc,15,580,"Rule: " + scoringRun.competition.rule,6,"black");

  //System version
  pdf.drawText(doc,760,580,"RCJ Scoring System v19.7",6,"black");
  return;
}

module.exports.generateScoreSheet = function (res, rounds) {
  let doc = new PDFDocument({autoFirstPage: false});

  doc.pipe(res);

  //doc.registerFont('Cardo', 'helper/NotoSans-Regular.ttf');
  //doc.font('Cardo');

  for (let i = 0; i < rounds.length; i++) {
    doc.addPage({
      margin: 0,
      size: [globalConfig.paperSize.x,globalConfig.paperSize.y]
    });
    drawRun(doc, globalConfig, rounds[i]);
  }

  doc.end();

  return;
};
