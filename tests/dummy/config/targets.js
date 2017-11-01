/* eslint-env node */
const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions'
];

if (!!process.env.CI || process.env.EMBER_ENV === 'production') {
  browsers.push('ie 9');
}

module.exports = {
  browsers
};
