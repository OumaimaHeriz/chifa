use axum::{
    extract::{Multipart, Path, State},
    http::StatusCode,
    routing::{get, post, put},
    Json, Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use rusqlite::params;
use tokio::fs;

use crate::db::{Db, Card, User};
use serde::{Deserialize, Serialize};

#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub storage_path: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

async fn login_handler(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<User>, StatusCode> {
    let conn = state.db.lock().await;
    let mut stmt = conn.prepare("SELECT id, username, role, is_active FROM users WHERE username = ?1 AND password = ?2 AND is_active = 1").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let user = stmt.query_row(params![payload.username.to_lowercase().trim(), payload.password], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            role: row.get(2)?,
            is_active: row.get(3)?,
        })
    });

    match user {
        Ok(u) => Ok(Json(u)),
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}

async fn get_cards_handler(State(state): State<AppState>) -> Result<Json<Vec<Card>>, StatusCode> {
    let conn = state.db.lock().await;
    let mut stmt = conn.prepare("SELECT * FROM cards_v2 ORDER BY id DESC").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let rows = stmt.query_map([], |row| {
        Ok(Card {
            id: row.get(0)?,
            numero_assurance: row.get(1)?,
            nom: row.get(2)?,
            prenom: row.get(3)?,
            date_naissance: row.get(4)?,
            ayant_droit: row.get(5)?,
            taux_remboursement: row.get(6)?,
            maladie_chronique: row.get(7)?,
            tier_payant: row.get(8)?,
            fin_droit: row.get(9)?,
            date_servie: row.get(10)?,
            client_type: row.get(11)?,
            remarque: row.get(12)?,
            tarif: row.get(13)?,
            vignette_remboursement: row.get(14)?,
            vignette_instance: row.get(15)?,
            ordonnance_image_path: row.get(16)?,
            status: row.get(17)?,
            date_added: row.get(18)?,
        })
    }).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut cards = Vec::new();
    for card in rows {
        if let Ok(c) = card {
            cards.push(c);
        }
    }

    Ok(Json(cards))
}

async fn add_card_handler(
    State(state): State<AppState>,
    Json(card): Json<Card>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.db.lock().await;
    conn.execute(
        "INSERT INTO cards_v2 (
            numero_assurance, nom, prenom, date_naissance, ayant_droit,
            taux_remboursement, maladie_chronique, tier_payant, fin_droit,
            date_servie, client_type, remarque, tarif, vignette_remboursement,
            vignette_instance, ordonnance_image_path, status, dateAdded
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)",
        params![
            card.numero_assurance, card.nom, card.prenom, card.date_naissance.unwrap_or_default(), 
            card.ayant_droit.unwrap_or_default(), card.taux_remboursement.unwrap_or_default(), 
            card.maladie_chronique, card.tier_payant.unwrap_or_default(), card.fin_droit.unwrap_or_default(), 
            card.date_servie.unwrap_or_default(), card.client_type.unwrap_or_else(|| "Normal".to_string()), 
            card.remarque.unwrap_or_default(), card.tarif.unwrap_or_default(), card.vignette_remboursement.unwrap_or_default(), 
            card.vignette_instance.unwrap_or_default(), card.ordonnance_image_path.unwrap_or_default(), 
            card.status.unwrap_or_else(|| "En attente".to_string()), card.date_added
        ],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::CREATED)
}

async fn update_card_handler(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(card): Json<Card>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.db.lock().await;
    conn.execute(
        "UPDATE cards_v2 SET 
            numero_assurance = ?1, nom = ?2, prenom = ?3, date_naissance = ?4,
            ayant_droit = ?5, taux_remboursement = ?6, maladie_chronique = ?7,
            tier_payant = ?8, fin_droit = ?9, date_servie = ?10, client_type = ?11,
            remarque = ?12, tarif = ?13, vignette_remboursement = ?14,
            vignette_instance = ?15, ordonnance_image_path = ?16, status = ?17
        WHERE id = ?18",
        params![
            card.numero_assurance, card.nom, card.prenom, card.date_naissance.unwrap_or_default(), 
            card.ayant_droit.unwrap_or_default(), card.taux_remboursement.unwrap_or_default(), 
            card.maladie_chronique, card.tier_payant.unwrap_or_default(), card.fin_droit.unwrap_or_default(), 
            card.date_servie.unwrap_or_default(), card.client_type.unwrap_or_else(|| "Normal".to_string()), 
            card.remarque.unwrap_or_default(), card.tarif.unwrap_or_default(), card.vignette_remboursement.unwrap_or_default(), 
            card.vignette_instance.unwrap_or_default(), card.ordonnance_image_path.unwrap_or_default(), 
            card.status.unwrap_or_else(|| "En attente".to_string()), id
        ],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}

async fn delete_card_handler(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.db.lock().await;
    conn.execute("DELETE FROM cards_v2 WHERE id = ?1", params![id])
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}

#[derive(Serialize)]
pub struct UploadResponse {
    pub filename: String,
}

async fn upload_image_handler(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<UploadResponse>, StatusCode> {
    let images_dir = format!("{}/ordonnances", state.storage_path);
    fs::create_dir_all(&images_dir).await.ok();

    if let Some(field) = multipart.next_field().await.map_err(|_| StatusCode::BAD_REQUEST)? {
        let file_name = field.file_name().unwrap_or("upload.jpg").to_string();
        let unique_name = format!("{}_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis(), file_name);
        
        let file_path = format!("{}/{}", images_dir, unique_name);
        let data = field.bytes().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        fs::write(&file_path, data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        return Ok(Json(UploadResponse { filename: unique_name }));
    }
    
    Err(StatusCode::BAD_REQUEST)
}

pub async fn start_server(storage_path: String) -> Result<(), std::io::Error> {
    let db_path = format!("{}/chifa.db", storage_path);
    let db = crate::db::init_db(&db_path).expect("Failed to init db");

    let images_dir = format!("{}/ordonnances", storage_path);
    fs::create_dir_all(&images_dir).await.ok();

    let state = AppState {
        db,
        storage_path,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/auth/login", post(login_handler))
        .route("/cards", get(get_cards_handler).post(add_card_handler))
        .route("/cards/:id", put(update_card_handler).delete(delete_card_handler))
        .route("/upload", post(upload_image_handler))
        .nest_service("/images", ServeDir::new(images_dir))
        .with_state(state)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await
}
