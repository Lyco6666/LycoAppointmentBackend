const db = require("../config/db");

class User {
    constructor(uid, name, phone, email) {
        this.uid = uid;
        this.name = name;
        this.phone = phone;
        this.email = email;
    }

    save(callback) {
        const query = "INSERT INTO users (uid, name, phone, email) VALUES (?, ?, ?, ?)";
        db.query(query, [this.uid, this.name, this.phone, this.email], callback);
    }

    static findByEmail(email, callback) {
        const query = "SELECT * FROM users WHERE email = ?";
        db.query(query, [email], callback);
    }

    static findByUid(uid, callback) {
        const query = "SELECT * FROM users WHERE uid = ?";
        db.query(query, [uid], callback);
    }
}

module.exports = User;
