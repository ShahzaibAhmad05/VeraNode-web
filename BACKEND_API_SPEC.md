# VeraNode Backend API Documentation

**Port:** 3008  
**Base URL:** `http://localhost:3008/api`  
**Framework:** Flask  
**Frontend URL:** `http://localhost:3000`

## Database Schema

### Users Table
```python
{
    'id': 'UUID',
    'university_id': 'string (unique)',
    'password_hash': 'string',
    'secret_key': 'string (64-char hex)',
    'area': 'enum (SEECS, NBS, ASAB, SINES, SCME, S3H, General)',
    'points': 'integer (default: 100)',
    'is_blocked': 'boolean (default: False)',
    'created_at': 'timestamp'
}
```

### Rumors Table
```python
{
    'id': 'UUID',
    'content': 'text',
    'area_of_vote': 'enum',
    'posted_at': 'timestamp',
    'voting_ends_at': 'timestamp (default: posted_at + 48 hours)',
    'is_locked': 'boolean (default: False)',
    'is_final': 'boolean (default: False)',
    'final_decision': 'enum (FACT, LIE, null)',
    'nullifier': 'string (hash)',
    'previous_hash': 'string',
    'current_hash': 'string',
    'user_id': 'UUID (foreign key)'
}
```

### Votes Table
```python
{
    'id': 'UUID',
    'rumor_id': 'UUID (foreign key)',
    'user_id': 'UUID (foreign key)',
    'nullifier': 'string (hash, unique per rumor)',
    'vote_type': 'enum (FACT, LIE)',
    'weight': 'float',
    'is_within_area': 'boolean',
    'timestamp': 'timestamp'
}
```

## Authentication Endpoints

### POST /api/auth/register
**Request:**
```json
{
    "universityId": "21i-1234",
    "password": "securepassword",
    "area": "SEECS"
}
```
**Process:**
1. Validate universityId is unique
2. Hash password
3. Generate 64-char hex secret_key using `secrets.token_hex(32)`
4. Create user with 100 initial points
5. Generate JWT token

**Response:**
```json
{
    "user": {
        "id": "uuid",
        "universityId": "21i-1234",
        "area": "SEECS",
        "isBlocked": false,
        "createdAt": "ISO timestamp"
    },
    "token": "JWT token",
    "secretKey": "64-char hex string"
}
```

### POST /api/auth/login
**Request:**
```json
{
    "universityId": "21i-1234",
    "password": "securepassword"
}
```
**Response:** Same as register

### GET /api/auth/verify
**Headers:** `Authorization: Bearer <token>`  
**Response:** User object

## Rumor Endpoints

### POST /api/rumors/validate
**Request:**
```json
{
    "content": "Rumor text here"
}
```
**AI Validation Logic:**
1. Call OpenAI/Anthropic API with prompt:
   ```
   Analyze if this is a rumor (unverified claim) or a fact.
   Return: {isValid: bool, isRumor: bool, reason: str, suggestedArea: str}
   Reject if: already a known fact, nonsense, too short, etc.
   ```

**Response:**
```json
{
    "isValid": true,
    "isRumor": true,
    "reason": "This appears to be an unverified claim",
    "suggestedArea": "SEECS"
}
```

### POST /api/rumors
**Request:**
```json
{
    "content": "Rumor text",
    "areaOfVote": "SEECS"
}
```
**Process:**
1. Validate with AI (reject if invalid)
2. Generate nullifier: `hashlib.sha256((user.secret_key + rumor_id).encode()).hexdigest()`
3. Calculate hashes for blockchain:
   - `previous_hash` = hash of last finalized rumor
   - `current_hash` = hash(rumor_id + content + voting_data + previous_hash)
4. Set voting_ends_at = now + 48 hours

**Response:**
```json
{
    "rumor": {...},
    "validation": {...}
}
```

### GET /api/rumors
**Query Params:** `?area=SEECS&status=active`  
**Response:** Array of rumors

### GET /api/rumors/:id
**Response:** Single rumor with all fields

### GET /api/rumors/:id/stats
**Response:**
```json
{
    "totalVotes": 150,
    "factVotes": 90,
    "lieVotes": 60,
    "factWeight": 2500.5,
    "lieWeight": 1200.0,
    "withinAreaVotes": 80,
    "progress": 53
}
```

## Voting Endpoints

### POST /api/rumors/:id/vote
**Request:**
```json
{
    "voteType": "FACT"
}
```
**Process:**
1. Check if user already voted (nullifier exists for this rumor)
2. Check if voting is still open (!is_locked && voting_ends_at > now)
3. Calculate vote weight:
   ```python
   proximity_multiplier = 1.5 if user.area == rumor.area_of_vote else 0.5
   weight = user.points * proximity_multiplier + 1.0
   ```
4. Generate nullifier: `sha256(user.secret_key + rumor.id)`
5. Store vote with weight and is_within_area flag

**Response:**
```json
{
    "success": true,
    "nullifier": "hash"
}
```

### GET /api/rumors/:id/vote-status
**Response:**
```json
{
    "hasVoted": true,
    "voteType": "FACT"
}
```

## User Endpoints

### GET /api/user/stats
**Response:**
```json
{
    "rumorsPosted": 5,
    "rumorsVoted": 20,
    "correctVotes": 15,
    "incorrectVotes": 5,
    "accountStatus": "ACTIVE"
}
```

### GET /api/user/rumors
**Response:** Array of user's posted rumors

### GET /api/votes/my-votes
**Response:** Array of user's votes

## Background Jobs (Cron/Scheduler)

### Lock Voting Timer
**Run:** Every 5 minutes
```python
for rumor in Rumor.query.filter(is_locked=False, voting_ends_at < now):
    if rumor.within_area_votes / rumor.total_votes >= 0.3:
        rumor.is_locked = True
```

### Finalize Decisions
**Run:** Every 10 minutes
```python
for rumor in Rumor.query.filter(is_locked=True, is_final=False):
    fact_weight = sum(vote.weight for vote in rumor.votes if vote.type == FACT)
    lie_weight = sum(vote.weight for vote in rumor.votes if vote.type == LIE)
    
    # AI moderation check
    ai_decision = call_ai_moderator({
        'total_votes': rumor.total_votes,
        'fact_weight': fact_weight,
        'lie_weight': lie_weight,
        'within_area_votes': rumor.within_area_votes,
        'content': rumor.content
    })
    
    # Final decision
    if ai_decision.is_ambiguous:
        extend_voting_by_24_hours()
    else:
        rumor.final_decision = 'FACT' if fact_weight > lie_weight else 'LIE'
        rumor.is_final = True
        
        # Update blockchain hash
        rumor.current_hash = hash(rumor_id + content + final_decision + voting_data + previous_hash)
        
        # Update points
        for vote in rumor.votes:
            if vote.vote_type == rumor.final_decision:
                vote.user.points += 10
            else:
                vote.user.points -= 5
        
        # Deduct points from rumor poster if LIE
        if rumor.final_decision == 'LIE':
            rumor.user.points -= 50
```

## AI Integration Points

### Rumor Validation AI
**Purpose:** Validate if content is a rumor vs fact  
**Model:** GPT-4/Claude  
**System Prompt:**
```
You are a rumor validator. Analyze if the given text is:
1. An unverified claim (rumor) - ACCEPT
2. A known fact - REJECT
3. Nonsense/spam - REJECT
Return JSON with isValid, isRumor, reason, suggestedArea
```

### Decision Moderator AI
**Purpose:** Detect statistical anomalies  
**Model:** GPT-4/Claude  
**Check for:**
- Tied votes (extend voting)
- Suspicious voting patterns (all votes same weight)
- Low within-area participation (extend voting)
- Rapid voting spikes (potential manipulation)

## Vote Weight Formula

```python
def calculate_vote_weight(user_points: int, is_within_area: bool) -> float:
    proximity_multiplier = 1.5 if is_within_area else 0.5
    base_weight = 1.0
    return user_points * proximity_multiplier + base_weight
```

## Nullifier Generation

```python
import hashlib

def generate_nullifier(secret_key: str, rumor_id: str) -> str:
    combined = secret_key + rumor_id
    return hashlib.sha256(combined.encode()).hexdigest()
```

## Blockchain Hash Chain

```python
def calculate_rumor_hash(rumor_id, content, final_decision, voting_data, previous_hash):
    data = f"{rumor_id}{content}{final_decision}{voting_data}{previous_hash}"
    return hashlib.sha256(data.encode()).hexdigest()
```

## Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:3000
PORT=3008
```

## CORS Configuration

```python
from flask_cors import CORS
CORS(app, origins=['http://localhost:3000'])
```

## Error Responses

All errors should follow this format:
```json
{
    "message": "Error description",
    "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_CREDENTIALS` - Login failed
- `ALREADY_VOTED` - User already voted on rumor
- `VOTING_CLOSED` - Rumor voting is locked
- `INVALID_RUMOR` - AI rejected rumor
- `INSUFFICIENT_POINTS` - User blocked (points < -100)
