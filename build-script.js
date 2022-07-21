/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
const fs = require('fs-extra');
const concat = require('concat');
(async function buid() {
  const bpath = './build/spotfire-wrapper-lib';
  const files = [
    bpath + '/runtime.js',
    bpath + '/polyfills.js',
    bpath + '/main.js'
  ]
  await fs.ensureDir('dist');
  await concat(files, 'dist/spotfire-wrapper.js');
  console.log('\nBuild is done : ./dist/spotfire-wrapper.js\n');
})()
