const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('       P17 METERING — FINAL LMS SUBMISSION VERIFIER             ');
console.log('================================================================\n');

let checksPassed = 0;
let totalChecks = 0;

function checkFile(filePath, label) {
  totalChecks++;
  const fullPath = path.join(rootDir, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ [PASS] ${label} (${filePath})`);
    checksPassed++;
    return true;
  } else {
    console.log(`  ✗ [FAIL] ${label} NOT FOUND: (${filePath})`);
    return false;
  }
}

function checkPattern(dirPath, pattern, label) {
  totalChecks++;
  const fullDirPath = path.join(rootDir, dirPath);
  if (!fs.existsSync(fullDirPath)) {
    console.log(`  ✗ [FAIL] Directory not found: (${dirPath})`);
    return false;
  }
  const files = fs.readdirSync(fullDirPath);
  const match = files.find(f => pattern.test(f));
  if (match) {
    console.log(`  ✓ [PASS] ${label} (${path.join(dirPath, match)})`);
    checksPassed++;
    return true;
  } else {
    console.log(`  ✗ [FAIL] ${label} matching pattern '${pattern}' NOT FOUND in ${dirPath}`);
    return false;
  }
}

function checkValidJSON(filePath, label) {
  totalChecks++;
  const fullPath = path.join(rootDir, filePath);
  try {
    const data = fs.readFileSync(fullPath, 'utf8');
    JSON.parse(data);
    console.log(`  ✓ [PASS] ${label} is valid JSON (${filePath})`);
    checksPassed++;
    return true;
  } catch (err) {
    console.log(`  ✗ [FAIL] ${label} is invalid JSON: ${err.message}`);
    return false;
  }
}

// 1. Root & Documentation Checks
checkFile('README.md', 'Root README.md');
checkFile('docs/postman/P17_Metering_Complete.postman_collection.json', 'Postman Collection JSON');
checkValidJSON('docs/postman/P17_Metering_Complete.postman_collection.json', 'Postman Collection JSON Syntax');

// 2. Submission Artifacts
checkPattern('docs/report', /^P17_.*\.pdf$/i, 'LMS PDF Submission Report');
checkPattern('docs/presentation', /^P17_.*\.pdf$/i, 'Presentation Slides PDF');

// 3. Package & Docker Configurations
checkValidJSON('backend/package.json', 'Backend package.json');
checkValidJSON('frontend/package.json', 'Frontend package.json');
checkFile('docker-compose.yml', 'Docker Compose File');
checkFile('.gitignore', 'Root .gitignore');

console.log('\n----------------------------------------------------------------');
console.log(`Verification Summary: ${checksPassed} / ${totalChecks} Checks Passed.`);

if (checksPassed === totalChecks) {
  console.log('STATUS: 🎉 100% READY FOR LMS SUBMISSION & FACULTY DEMO!');
  console.log('================================================================');
  process.exit(0);
} else {
  console.log('STATUS: ⚠️ Action required for failed checks above.');
  console.log('================================================================');
  process.exit(1);
}
