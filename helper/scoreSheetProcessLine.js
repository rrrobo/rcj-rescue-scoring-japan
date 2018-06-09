const cv = require('opencv4nodejs');
const proc = require('./scoreSheetProcessUtil');

module.exports.processScoreSheet = function (posData, scoreSheetFileName) {
  const processedPosMarkers = proc.processPosMarkers(cv.imread(scoreSheetFileName).bgrToGray(), proc.findPosdataByDescr(posData, 'posMarkers'));
  const normalizedSheet = processedPosMarkers.normalizedMat;

  let sheetData = {};
  sheetData.rawSheet = processedPosMarkers.img;
  sheetData.qr = proc.processPosdataQR(normalizedSheet, proc.findPosdataByDescr(posData, 'meta'));
  sheetData.enterManually = proc.processPosdataMatrixText(normalizedSheet, proc.findPosdataByDescr(posData, 'enterManually'));
  sheetData.evacuation = proc.processPosdataMatrixText(normalizedSheet, proc.findPosdataByDescr(posData, 'evacuation'));
  sheetData.checkpoints = [];
  for (let i = 0, posDataCB; (posDataCB = proc.findPosdataByDescr(posData, 'cb' + i)) !== null; i++) {
    if (posDataCB === null) {
      break;
    }
    sheetData.checkpoints.push(proc.processPosdataMatrixText(normalizedSheet, posDataCB))
  }
  sheetData.victimOrder = proc.processPosdataMatrixText(normalizedSheet, proc.findPosdataByDescr(posData, 'victims'));
  sheetData.time = proc.processPosdataMatrixText(normalizedSheet, proc.findPosdataByDescr(posData, 'time'));
  sheetData.signTeam = proc.processPosdataText(normalizedSheet, proc.findPosdataByDescr(posData, 'signTeam'));
  sheetData.signRef = proc.processPosdataText(normalizedSheet, proc.findPosdataByDescr(posData, 'signRef'));
  sheetData.exitBonus = proc.processPosdataMatrixText(normalizedSheet, proc.findPosdataByDescr(posData, 'exitBonus'));
  sheetData.tiles = proc.processFieldData(normalizedSheet, proc.findPosdataByDescr(posData, 'field'));

  return sheetData;
};