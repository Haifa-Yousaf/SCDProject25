require('dotenv').config();
const mongoose = require('mongoose');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

const db = require('./db');             // MongoDB DB module
const vaultEvents = require('./events'); // Existing event logger

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// ---------------------
// Backup function
// ---------------------
function createBackup(vault) {
    const dateTime = new Date().toISOString().replace(/:/g, '-');
    const backupDir = path.join(__dirname, 'backups');

    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const backupFile = path.join(backupDir, "backup_" + dateTime + ".json");
    fs.writeFileSync(backupFile, JSON.stringify(vault, null, 2));
    console.log("Backup created: " + backupFile);
}


// ---------------------
// Export vault data
// ---------------------
function exportData(vault) {
const dateTime = new Date().toISOString();
let data = `Export Date: ${dateTime}\nTotal Records: ${vault.length}\n\n`;
vault.forEach(item => {
data += `ID: ${item._id} | Name: ${item.name} | Created: ${item.createdAt}\n`;
});


fs.writeFileSync('export.txt', data);
console.log("Data exported successfully to export.txt.");

}

// ---------------------
// Search records
// ---------------------
function searchRecords(vault) {
    const keyword = readlineSync.question('Enter search keyword (ID or Name): ').toLowerCase();
    const results = vault.filter(item => 
        item.name.toLowerCase().includes(keyword) || item.id.toString() === keyword
    );

    if (results.length === 0) {
        console.log("No records found.");
    } else {
        console.log("Found " + results.length + " matching record(s):");
        results.forEach(function(item, index) {
            console.log((index + 1) + ". ID: " + item.id + " | Name: " + item.name + " | Created: " + item.createdAt);
        });
    }
}


// ---------------------
// Sort records
// ---------------------
function sortRecords(vault) {
const field = readlineSync.question('Sort by (name/date): ').toLowerCase();
const order = readlineSync.question('Order (asc/desc): ').toLowerCase();

let sorted = [...vault];

if (field === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
else if (field === 'date') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
else{ console.log('Invalid field hence sorting automatically by asc date.');}

if (order === 'desc') sorted.reverse();

console.log("Sorted Records:");

sorted.forEach((item, index) => {
    console.log(`${index + 1}. ID: ${item._id} | Name: ${item.name} | Created: ${item.createdAt}`);
});

}

// ---------------------
// Vault statistics
// ---------------------
function displayStatistics(vault) {
if (vault.length === 0) {
console.log("Vault is empty.");
return;
}

const totalRecords = vault.length;
const lastModified = new Date(Math.max(...vault.map(r => new Date(r.updatedAt || r.createdAt)))).toISOString();
const longestName = vault.reduce((a, b) => a.name.length > b.name.length ? a : b);
const earliestRecord = new Date(Math.min(...vault.map(r => new Date(r.createdAt)))).toISOString().split('T')[0];
const latestRecord = new Date(Math.max(...vault.map(r => new Date(r.createdAt)))).toISOString().split('T')[0];

console.log("Vault Statistics:");
console.log("--------------------------");
console.log(`Total Records: ${totalRecords}`);
console.log(`Last Modified: ${lastModified}`);
console.log(`Longest Name: ${longestName.name} (${longestName.name.length} characters)`);
console.log(`Earliest Record: ${earliestRecord}`);
console.log(`Latest Record: ${latestRecord}`);

}

// ---------------------
// Main menu
// ---------------------
async function menu() {
console.log(`
===== NodeVault =====

1. Add Record
2. Delete Record
3. View Records
4. Search Records
5. Sort Records
6. Export Data
7. Vault Statistics
8. Exit
   =====================
   `);

   const choice = readlineSync.question('Choose an option: ').trim();
   const vault = await db.listRecords(); // Fetch latest data from MongoDB

   switch(choice) {
   case '1': // Add
   	const name = readlineSync.question('Enter name: ');
   	await db.addRecord({ name });
   	console.log('✅ Record added successfully!');
   	createBackup(vault);
   break;

    case '2': // Delete
        const delId = readlineSync.question('Enter record ID to delete: ');
        const deleted = await db.deleteRecord(delId);
        console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
        createBackup(vault);
        break;

    case '3': // View
        if (vault.length === 0) console.log('No records found.');
        else vault.forEach(r => console.log(`ID: ${r._id} | Name: ${r.name} | Created: ${r.createdAt.toISOString()}`));
        break;

    case '4': // Search
        searchRecords(vault);
        break;

    case '5': // Sort
        sortRecords(vault);
        break;

    case '6': // Export
        exportData(vault);
        break;

    case '7': // Statistics
        displayStatistics(vault);
        break;

    case '8':
        console.log('👋 Exiting NodeVault...');
        process.exit(0);

    default:
        console.log('❌ Invalid option.');

   }

   menu(); // loop
   }

// Start the application
if (process.env.NODE_ENV !== "production") {
    showMenu();
}
else {
   console.log("Running in Docker — no interactive menu allowed.");
}



/*{"id": "91283", "variant": "standard"}
const readline = require('readline-sync');
const fs = require('fs');
const path = require('path');
require('./events/logger'); // Initialize event logger
const db = require('./db');

function searchRecords(vault) {
    const keyword = readline.question('Enter search keyword (ID or Name): ').toLowerCase();

    const results = vault.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        item.id.toString() === keyword
    );

    if (results.length === 0) {
        console.log("No records found.");
    } else {
        console.log(`Found ${results.length} matching record(s):`);
        results.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id} | Name: ${item.name} | Created: ${item.createdAt}`);
        });
    }
}

function sortRecords(vault) {
    const readline = require('readline-sync');
    const field = readline.question('Choose field to sort by (Name/Date): ').toLowerCase();
    const order = readline.question('Choose order (Ascending/Descending): ').toLowerCase();

    let sorted = [...vault];

    if (field === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (field === 'date') {
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    if (order === 'descending') sorted.reverse();

    console.log("Sorted Records:");
    sorted.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id} | Name: ${item.name} | Created: ${item.createdAt}`);
    });
}

function exportData(vault) {
    const dateTime = new Date().toISOString();
    let data = `Export Date: ${dateTime}\nTotal Records: ${vault.length}\nFile: export.txt\n\n`;
    vault.forEach(item => {
        data += `ID: ${item.id} | Name: ${item.name} | Created: ${item.createdAt}\n`;
    });

    fs.writeFileSync('export.txt', data);
    console.log("Data exported successfully to export.txt.");
}

function createBackup(vault) {
    const fs = require('fs');
    const path = require('path');
    const dateTime = new Date().toISOString().replace(/:/g, '-');
    const backupDir = path.join(__dirname, 'backups');

    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const backupFile = path.join(backupDir, `backup_${dateTime}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(vault, null, 2));
    console.log(`Backup created: ${backupFile}`);
}

function displayStatistics(vault) {
    if (vault.length === 0) { console.log("Vault is empty."); return; }

    const totalRecords = vault.length;
    const lastModified = new Date(Math.max(...vault.map(r => new Date(r.updatedAt || r.createdAt)))).toISOString();
    const longestName = vault.reduce((a,b) => a.name.length > b.name.length ? a : b);
    const earliestRecord = new Date(Math.min(...vault.map(r => new Date(r.createdAt)))).toISOString().split('T')[0];
    const latestRecord = new Date(Math.max(...vault.map(r => new Date(r.createdAt)))).toISOString().split('T')[0];

    console.log("Vault Statistics:");
    console.log("--------------------------");
    console.log(`Total Records: ${totalRecords}`);
    console.log(`Last Modified: ${lastModified}`);
    console.log(`Longest Name: ${longestName.name} (${longestName.name.length} characters)`);
    console.log(`Earliest Record: ${earliestRecord}`);
    console.log(`Latest Record: ${latestRecord}`);
}


// Main Menu
function menu() {
    console.log(`
===== NodeVault =====
1. Add Record
2. Delete Record
3. View Records
4. Search Records
5. Sort Records
6. Export Data
7. View Vault Statistics
8. Exit
=====================
    `);

    const choice = readline.question('Choose an option: ');
    const vault = db.listRecords(); // Get current vault state

    switch(choice.trim()) {
        case '1': // Add Record
            const name = readline.question('Enter name: ');
            const value = readline.question('Enter value: ');
            db.addRecord({ name, value });
            createBackup(db.listRecords());
            console.log('✅ Record added successfully!');
            break;

        case '2': // Delete Record
            const delId = readline.question('Enter ID to delete: ');
            const deleted = db.deleteRecord(Number(delId));
            if (deleted) { 
            	createBackup(db.listRecords());
            	console.log('🗑️ Record deleted!');
            }
            else console.log('❌ Record not found.');
            break;

        case '3': // View Records
            if (vault.length === 0) console.log('No records found.');
            else vault.forEach((r,index) => console.log(`${index+1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.createdAt}`));
            break;

        case '4':
        	searchRecords(vault);
        	break;
        case '5':
        	sortRecords(vault);
        	break;
        case '6':
        	exportData(vault);
        	break;
        case '7': 
        	displayStatistics(vault);
        	break;

        case '8': 
        	console.log('👋 Exiting NodeVault...'); 
        	process.exit(0);
        	break;
        default: 
        	console.log('❌ Invalid option.');
    }

    menu(); // Loop back to menu
}

// Start Application
menu(); */
