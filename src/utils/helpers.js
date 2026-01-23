const fs = require('fs');
const path = require('path');

const historyPath = path.join(__dirname, '../../data/history.json');

function isDuplicate(title) {
    // If the file doesn't exist yet, it's not a duplicate
    if (!fs.existsSync(historyPath)) return false;
    try {
        const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        return history.includes(title);
    } catch (e) {
        return false;
    }
}

function saveToHistory(title) {
    let history = [];
    const dataDir = path.join(__dirname, '../../data');
    
    // Create data folder if missing
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    if (fs.existsSync(historyPath)) {
        try {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        } catch (e) {
            history = [];
        }
    }
    
    history.push(title);
    // Keep only last 50
    if (history.length > 50) history.shift();
    
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

module.exports = { isDuplicate, saveToHistory };
