# Project State 🌐

## Core Philosophy
This is the Project Constitution for the highly responsive, user-friendly Language Learning Web Application based on "Extensive Input". 

## Data Schemas (Pre-Approved Blueprint)

### Users Table
- `id`: UUID (Primary Key)
- `email`: String
- `target_language`: String (e.g., 'es', 'fr', 'ja')
- `level`: String (e.g., 'A1', 'B2')

### Vocabulary Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users.id)
- `word`: String
- `translation`: String
- `context`: Text (The sentence in which the word appeared)
- `source_type`: String (Enum: 'Reading', 'Video')
- `created_at`: Timestamp

### Stories Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users.id)
- `title`: String
- `content`: Text
- `difficulty_level`: String
- `generated_by_ai`: Boolean
