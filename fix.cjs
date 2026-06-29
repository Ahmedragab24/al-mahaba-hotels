const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/Projects/Hotels/src');
let changedCount = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    const regex = /([a-zA-Z0-9_]+)\.data\?\.map/g;
    if (regex.test(content)) {
        content = content.replace(regex, "(Array.isArray($1.data) ? $1.data : Array.isArray($1.data?.data) ? $1.data.data : [])?.map");
        fs.writeFileSync(f, content);
        changedCount++;
    }
});

console.log('Modified files:', changedCount);
