const logger = require('../config/logger').mainLogger;
const rule2021 = require('./scoreCalculator-2021');

module.exports.calculateLineScore = function (run) {
  const { rule } = run.competition;
  switch (rule) {
    case '2021':
    default:
      return rule2021.calculateLineScore(run);
  }
};

module.exports.calculateLineScoreManual = function (run) {
  const { rule } = run.competition;
  switch (rule) {
    case '2021':
    default:
      return rule2021.calculateLineScoreManual(run);
  }
};

module.exports.calculateMazeScore = function (run) {
  const { rule } = run.competition;
  switch (rule) {
    case '2021':
    default:
      return rule2021.calculateMazeScore(run);
  }
};

module.exports.calculateMazeScoreManual = function (run) {
  const { rule } = run.competition;
  switch (rule) {
    case '2021':
    default:
      return rule2021.calculateMazeScoreManual(run);
  }
};
