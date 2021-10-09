const engLetterRegExp = /[a-zA-Z]/;

const ruVocab = {
  а: '⠁',
  б: '⠃',
  в: '⠺',
  г: '⠛',
  д: '⠙',
  е: '⠑',
  ё: '⠡',
  ж: '⠚',
  з: '⠵',
  и: '⠊',
  й: '⠯',
  к: '⠅',
  л: '⠇',
  м: '⠍',
  н: '⠝',
  о: '⠕',
  п: '⠏',
  р: '⠗',
  с: '⠎',
  т: '⠞',
  у: '⠥',
  ф: '⠋',
  х: '⠓',
  ц: '⠉',
  ч: '⠟',
  ш: '⠱',
  щ: '⠭',
  ъ: '⠷',
  ы: '⠮',
  ь: '⠾',
  э: '⠪',
  ю: '⠳',
  я: '⠫',
};

const engVocab = {
  a: '⠁',
  b: '⠃',
  c: '⠉',
  d: '⠙',
  e: '⠑',
  f: '⠋',
  g: '⠛',
  h: '⠓',
  i: '⠊',
  j: '⠚',
  k: '⠅',
  l: '⠇',
  m: '⠍',
  n: '⠝',
  o: '⠕',
  p: '⠏',
  q: '⠟',
  r: '⠗',
  s: '⠎',
  t: '⠞',
  u: '⠥',
  v: '⠧',
  w: '⠺',
  x: '⠭',
  y: '⠽',
  z: '⠵',
};

const chartVocab = {
  ',': '⠂',
  ';': '⠆',
  ':': '⠒',
  '.': '⠲',
  '?': '⠢',
  '!': '⠖',
  '(': '⠐⠣',
  ')': '⠐⠜',
  '-': '⠤',
  '—': '⠠⠤',
  '"': '⠄',
  ' ': ' ',
  '\n': '\n',
}

const ruVocabWithCharts = { ...ruVocab, ...chartVocab };
const engVocabWithCharts = { ...engVocab, ...chartVocab };

const getVocab = (text) => {
  return text.search(engLetterRegExp) !== -1 ? engVocabWithCharts : ruVocabWithCharts;
}

const translateToBraille = (text) => {
  let res = '';
  let formattedText = text.toLowerCase();
  const vocab = getVocab(formattedText);
  for (let letter of formattedText) {
    res += vocab[letter] || letter;
  }

  return res;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const decodeFromBraille = (text) => {
  let res = '';
  let formattedText = text.toLowerCase();
  for (let letter of formattedText) {
    res += getKeyByValue(ruVocabWithCharts, letter) || letter;
  }

  return res;
}

module.exports = {
  translateToBraille,
}
