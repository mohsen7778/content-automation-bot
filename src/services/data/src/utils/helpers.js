const fs = require('fs');
const path = require('path');

const historyPath = path.join(__dirname, '../../data/history.json');

function isDuplicate(title) {
    if (!fs.existsSync(historyPath)) return false;
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    return history.includes(title);
}

function saveToHistory(title) {
    let history = [];
    if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }
    history.push(title);
    if (history.length > 50) history.shift(); 
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

module.exports = { isDuplicate, saveToHistory };
