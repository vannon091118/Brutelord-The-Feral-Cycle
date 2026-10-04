const { execSync } = require('child_process');

// Fetch the base and head information since we are in a detached HEAD state.
// We will amend the latest commit by removing the last paragraph that causes generic trailer violations.
const commitMessage = execSync('git log -1 --format=%B', { encoding: 'utf8' });
const lines = commitMessage.split('\n');
const fixedLines = [];

for (let line of lines) {
    if (line.match(/^[A-Za-z][A-Za-z0-9-]*:\s+\S.*$/)) {
        continue; // Skip generic trailers
    }
    fixedLines.push(line);
}

// Write the fixed message to a temporary file
const fs = require('fs');
fs.writeFileSync('/tmp/fixed_commit_message.txt', fixedLines.join('\n'));
