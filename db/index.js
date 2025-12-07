const Record = require('./recordModel'); // Mongoose model
const vaultEvents = require('../events');

// Add a new record
async function addRecord({ name }) {
    // Find the highest current numeric ID
    const lastRecord = await Record.findOne().sort({ id: -1 });
    const newId = lastRecord ? lastRecord.id + 1 : 1;

    const newRecord = new Record({ id: newId, name });
    await newRecord.save();
    vaultEvents.emit('recordAdded', newRecord);
    return newRecord;
}

// List all records
async function listRecords() {
	return await Record.find().sort({ id: 1 });
}

// Update a record by ID
async function updateRecord(id, newName) {
    const record = await Record.findOne({ id: Number(id) });
    if (!record) return null;

    record.name = newName;
    await record.save();
    vaultEvents.emit('recordUpdated', record);
    return record;
}

// Delete a record by ID
async function deleteRecord(id) {
    const deletedRecord = await Record.findOneAndDelete({ id: Number(id) });
    if (deletedRecord) vaultEvents.emit('recordDeleted', deletedRecord);
    return deletedRecord;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };


/*const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { id: recordUtils.generateId(), name, value };
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  vaultEvents.emit('recordDeleted', record);
  return record;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord }; */
