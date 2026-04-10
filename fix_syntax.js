const fs = require('fs');

function fixFile(filePath) {
    let f = fs.readFileSync(filePath, 'utf8');
    f = f.replace(/\\\`/g, '`');
    f = f.replace(/\\\$/g, '$');
    fs.writeFileSync(filePath, f);
    console.log('Fixed', filePath);
}

fixFile('app/(protected)/studio/career/page.tsx');
fixFile('components/cv-templates/CVTemplateProfessional.tsx');
