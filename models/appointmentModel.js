const db = require("../config/db");

class Appointment {
    constructor(id, customer_uid, date, time, purpose, status) {
        this.id = id;
        this.customer_uid = customer_uid;
        this.date = date;
        this.time = time;
        this.purpose = purpose;
        this.status = status;
    }

    save(callback) {
        const query = "INSERT INTO appointments (customer_uid, date, time, purpose, status) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [this.customer_uid, this.date, this.time, this.purpose, this.status], callback);
    }

    static findByUid(uid, callback) {
        const query = "SELECT * FROM appointments WHERE customer_uid = ?";
        db.query(query, [uid], callback);
    }

    static findAll(callback) {
        const query = `
            SELECT a.id, a.date, a.time, a.purpose, a.status, u.name, u.email, u.phone
            FROM appointments a 
            JOIN users u ON a.customer_uid = u.uid`;
        db.query(query, callback);
    }

    static updateStatus(id, status, date, time, callback) {
        let query;
        let params;
        if (status === "scheduled") {
            query = "UPDATE appointments SET status = ?, date = ?, time = ? WHERE id = ?";
            params = [status, date, time, id];
        } else {
            query = "UPDATE appointments SET status = ? WHERE id = ?";
            params = [status, id];
        }

        db.query(query, params, (err, result) => {
            if (err) return callback(err, null);
            if (result.affectedRows === 0) return callback(new Error("Appointment not found"), null);

            db.query("SELECT * FROM appointments WHERE id = ?", [id], (fetchErr, fetchResult) => {
                if (fetchErr) return callback(fetchErr, null);
                if (fetchResult.length === 0) return callback(new Error("Appointment not found after update"), null);
                callback(null, fetchResult[0]);
            });
        });
    }

    static findById(id, callback) {

        const query = `
            SELECT a.id, a.date, a.time, a.purpose, a.status, u.name, u.email
            FROM appointments a
            JOIN users u ON a.customer_uid = u.uid
            WHERE a.id = ?`;

        db.query(query, [id], (err, result) => {
            if (err) return callback(err, null);
            if (result.length === 0) return callback(new Error("Appointment not found"), null);
            callback(null, result[0]);
        });
    }
}

module.exports = { Appointment };
