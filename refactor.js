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

            // Check if folder itself needs renaming
            if (file.toLowerCase().includes('surrender')) {
                const newName = file.replace(/surrender/g, 'post').replace(/Surrender/g, 'Post');
                const newPath = path.join(dir, newName);
                console.log(`Renaming folder: ${fullPath} -> ${newPath}`);
                fs.renameSync(fullPath, newPath);
            }
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
                    .replace(/surrender_requests/g, 'post_requests')
                    .replace(/surrender_request/g, 'post_request')
                    .replace(/SurrenderRequests/g, 'PostRequests')
                    .replace(/SurrenderRequest/g, 'PostRequest')
                    .replace(/surrenders/g, 'posts')
                    .replace(/surrender/g, 'post')
                    .replace(/Surrenders/g, 'Posts')
                    .replace(/Surrender/g, 'Post')
                    .replace(/SURRENDER/g, 'POST');

                if (content !== newContent) {
                    console.log(`Updating content in: ${fullPath}`);
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                }
            }

            if (file.toLowerCase().includes('surrender')) {
                const newName = file.replace(/surrender/g, 'post').replace(/Surrender/g, 'Post');
                const newPath = path.join(dir, newName);
                console.log(`Renaming file: ${fullPath} -> ${newPath}`);
                fs.renameSync(fullPath, newPath);
            }
        }
    }
}

console.log('Starting refactor...');
traverse(path.join(rootDir, 'frontend', 'src'));
traverse(path.join(rootDir, 'backend', 'src'));
console.log('Done!');
