const fs = require('fs-extra');
const concat = require('concat');
(async function buid() {

  const files = [
    './dist/runtime.js',
    './dist/polyfills.js',
    './dist/main.js'
  ]
  await fs.ensureDir('elements');
  await concat(files, 'elements/spotfire-wrapper.js');
  console.log('\nBuild is done. Now put the ./elements/spotfire-wrapper.js file in https://s3-us-west-2.amazonaws.com/cec-library/\n');
})()
