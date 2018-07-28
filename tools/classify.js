const path =  require('path');
const fs = require('fs');
const fse = require('fs-extra');

const basename = path.join(__dirname,'workspace');
const result = path.join(__dirname,'result');

fse.ensureDirSync(path.join(result,'image'));
fse.ensureDirSync(path.join(result,'table'));
fse.ensureDirSync(path.join(result,'both'));
fse.ensureDirSync(path.join(result,'other'))

const checkType = (dir) => {
  const names = fs.readdirSync(dir);
  let hasTable = false;
  let hasImage = false;
  for(const name of names) {
    // console.debug(path.extname(name));
    if(/^\.xls[x]?$/i.test(path.extname(name))) {
      hasTable = true;
    }
    if(/^\.(BMP|JPG|JPEG|PNG|GIF)$/i.test(path.extname(name))) {
      hasImage = true;
    }
  }
  if(hasImage&&hasTable) {
    return 'both';
  }
  else if(hasImage) {
    return 'image';
  }
  else if(hasTable) {
    return 'table';
  } else {
    return 'other';
  }
}

for(const item of fs.readdirSync(basename)) {
  const target = path.join(basename,item);
  if(fs.statSync(target).isDirectory()) {
    const type = checkType(target);
    fse.moveSync(target,path.join(result,`${type}`,item));
  }
}