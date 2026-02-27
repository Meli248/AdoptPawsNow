const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/ASUS/Desktop/sem3/AdoptPawsNow';
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.vscode', 'public', 'assets'];
const ignoreExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.css.map'];

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (ignoreDirs.includes(file)) continue;

        let fullPath = path.join(dir, file);
        let stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            traverse(fullPath);
        } else {
            if (ignoreExtensions.includes(path.extname(file))) continue;

            let content;
            try {
                content = fs.readFileSync(fullPath, 'utf8');
            } catch (e) {
                continue; // skip unreadable files
            }

            if (typeof content === 'string' && content.match(/surrender/i)) {
                const newContent = content
                    .replace(/surrender_applications/g, 'post_applications')
                    .replace(/surrender_application/g, 'post_application')
                    .replace(/SurrenderApplications/g, 'PostApplications')
                    .replace(/SurrenderApplication/g, 'PostApplication')
                    .replace(/surrender_id/g, 'post_id');

                if (content !== newContent) {
                    console.log(`Updating content in: ${fullPath}`);
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                }
            }
        }
    }
}

console.log('Starting secondary refactor for applications...');
traverse(path.join(rootDir, 'frontend', 'src'));
traverse(path.join(rootDir, 'backend', 'src'));
console.log('Done!');
