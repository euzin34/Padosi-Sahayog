const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Ensure database file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, tasks: {} }, null, 2));
}

class LocalFirestore {
    constructor() {
        this.load();
    }

    load() {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            this.storage = JSON.parse(data);
        } catch (err) {
            this.storage = { users: {}, tasks: {} };
        }
    }

    save() {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.storage, null, 2));
    }

    collection(name) {
        if (!this.storage[name]) this.storage[name] = {};
        return new CollectionReference(this, name);
    }
}

class CollectionReference {
    constructor(db, name) {
        this.db = db;
        this.name = name;
    }

    doc(id) {
        return new DocumentReference(this.db, this.name, id);
    }

    async add(data) {
        const id = 'local_' + Date.now() + Math.random().toString(36).substr(2, 9);
        this.db.storage[this.name][id] = normalizeData(data);
        this.db.save();
        return { id, get: async () => ({ data: () => this.db.storage[this.name][id] }) }; // Mock doc ref
    }

    where(field, op, value) {
        return new Query(this.db, this.name).where(field, op, value);
    }
}

class DocumentReference {
    constructor(db, collectionName, id) {
        this.db = db;
        this.collectionName = collectionName;
        this.id = id;
    }

    async get() {
        const data = this.db.storage[this.collectionName][this.id];
        return {
            exists: !!data,
            data: () => data,
            id: this.id
        };
    }

    async set(data, options = {}) {
        if (options.merge && this.db.storage[this.collectionName][this.id]) {
            this.db.storage[this.collectionName][this.id] = {
                ...this.db.storage[this.collectionName][this.id],
                ...normalizeData(data)
            };
        } else {
            this.db.storage[this.collectionName][this.id] = normalizeData(data);
        }
        this.db.save();
    }

    async update(data) {
        if (!this.db.storage[this.collectionName][this.id]) {
            throw new Error('Document not found');
        }
        this.db.storage[this.collectionName][this.id] = {
            ...this.db.storage[this.collectionName][this.id],
            ...normalizeData(data)
        };
        this.db.save();
    }

    async delete() {
        delete this.db.storage[this.collectionName][this.id];
        this.db.save();
    }
}

class Query {
    constructor(db, collectionName) {
        this.db = db;
        this.collectionName = collectionName;
        this.filters = [];
    }

    where(field, op, value) {
        this.filters.push({ field, op, value });
        return this;
    }

    async get() {
        let results = Object.values(this.db.storage[this.collectionName] || {});
        
        for (const filter of this.filters) {
            results = results.filter(item => {
                const itemValue = getNestedValue(item, filter.field);
                if (filter.op === '==') return itemValue === filter.value;
                // Add more ops if needed
                return false;
            });
        }

        return {
            empty: results.length === 0,
            docs: results.map(data => ({
                id: data.uid || data.id || 'unknown', // Best guess ID
                data: () => data
            })),
            forEach: (cb) => results.forEach((data) => cb({
                id: data.uid || data.id,
                data: () => data
            })) 
        };
    }
}

// Helper to handle nested fields like 'location.latitude'
function getNestedValue(obj, path) {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : undefined, obj);
}

// Helper to handle simple data normalization (dates etc)
function normalizeData(data) {
    return JSON.parse(JSON.stringify(data));
}

module.exports = new LocalFirestore();
