use rusqlite::{Connection, Result};
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub role: String,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Card {
    pub id: Option<i32>,
    pub numero_assurance: String,
    pub nom: String,
    pub prenom: String,
    pub date_naissance: Option<String>,
    pub ayant_droit: Option<String>,
    pub taux_remboursement: Option<String>,
    pub maladie_chronique: bool,
    pub tier_payant: Option<String>,
    pub fin_droit: Option<String>,
    pub date_servie: Option<String>,
    pub client_type: Option<String>,
    pub remarque: Option<String>,
    pub tarif: Option<String>,
    pub vignette_remboursement: Option<String>,
    pub vignette_instance: Option<String>,
    pub ordonnance_image_path: Option<String>,
    pub status: Option<String>,
    #[serde(rename = "dateAdded")]
    pub date_added: String,
}

pub type Db = Arc<Mutex<Connection>>;

pub fn init_db(db_path: &str) -> Result<Db> {
    let conn = Connection::open(db_path)?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS cards_v2 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_assurance TEXT NOT NULL,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            date_naissance TEXT,
            ayant_droit TEXT,
            taux_remboursement TEXT,
            maladie_chronique BOOLEAN,
            tier_payant TEXT,
            fin_droit TEXT,
            date_servie TEXT,
            client_type TEXT,
            remarque TEXT,
            tarif TEXT,
            vignette_remboursement TEXT,
            vignette_instance TEXT,
            ordonnance_image_path TEXT,
            status TEXT DEFAULT 'En attente',
            dateAdded TEXT NOT NULL
        )",
        [],
    )?;

    {
        let mut stmt = conn.prepare("SELECT count(*) FROM users WHERE username = 'admin'")?;
        let count: i32 = stmt.query_row([], |row| row.get(0))?;
        if count == 0 {
            conn.execute(
                "INSERT INTO users (username, password, role, is_active) VALUES ('admin', 'admin', 'Administrateur', 1)",
                [],
            )?;
        }
    }

    Ok(Arc::new(Mutex::new(conn)))
}
