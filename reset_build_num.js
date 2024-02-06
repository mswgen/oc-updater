const fs = require('fs');
let file = JSON.parse(fs.readFileSync('electron-builder.json', 'utf8'));
file.buildNumber = "0";
fs.writeFileSync('electron-builder.json', JSON.stringify(file, null, 4));
