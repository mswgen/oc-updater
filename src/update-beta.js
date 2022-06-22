// read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
const plistParsed = plist.parse(fs.readFileSync(file, 'utf8'));
/*
Changes of OpenCore 0.8.2 Beta:
nothing now
*/
// finally, write it back
fs.writeFileSync(file, plist.build(plistParsed));