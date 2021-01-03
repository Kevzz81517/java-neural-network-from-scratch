const dagre = require("dagre");

const sufixes = [ "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th" ];

const numberToRankConverter = (i) => {
  switch (i % 100) {
    case 11:
    case 12:
    case 13:
      return i + "th";
    default:
      return i + sufixes[i % 10];
  }
}

export {
  dagre,
  numberToRankConverter
}