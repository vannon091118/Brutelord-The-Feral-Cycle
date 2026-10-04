const { execSync } = require('child_process');
const fs = require('fs');

const commitMessage = execSync('git log -1 --format=%B', { encoding: 'utf8' });
const lines = commitMessage.split('\n');
const fixedLines = [];

for (let line of lines) {
    if (line.match(/^[A-Za-z][A-Za-z0-9-]*:\s+\S.*$/)) {
        continue;
    }
    fixedLines.push(line);
}

fs.writeFileSync('/tmp/fixed_commit_message.txt', fixedLines.join('\n'));
