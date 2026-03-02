# Auth Testing Playbook for SuperNetworkAI

## Step 1: Create Test User & Session

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  role_labels: ['AI Engineer', 'Founder'],
  location: 'San Francisco, CA',
  primary_intent: 'Freelance/Gigs',
  secondary_intents: [],
  availability: 'Available now',
  onboarding_completed: true,
  peer_score: 8.5,
  recruiter_score: 7.2,
  total_gigs: 5,
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
db.ikigai_profiles.insertOne({
  ikigai_id: 'ikigai_' + Date.now(),
  user_id: userId,
  what_i_love: ['Building AI products', 'Solving complex problems'],
  what_im_good_at: ['Python', 'Machine Learning', 'System Design'],
  what_i_can_be_paid_for: ['AI Development', 'Technical Consulting'],
  what_the_world_needs: ['Ethical AI', 'Accessible Technology'],
  ikigai_statement: 'I help build ethical AI products that make technology accessible to everyone.',
  created_at: new Date(),
  updated_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API

```bash
# Test auth endpoint
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -X GET "$API_URL/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test protected endpoints
curl -X GET "$API_URL/api/opportunities" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

curl -X POST "$API_URL/api/search/people" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"query": "AI engineer"}'
```

## Step 3: Browser Testing

```javascript
// Set cookie and navigate
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.preview.emergentagent.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://your-app.preview.emergentagent.com/dashboard");
```

## Quick Debug

```bash
# Check data format
mongosh --eval "
use('test_database');
db.users.find().limit(2).pretty();
db.user_sessions.find().limit(2).pretty();
db.ikigai_profiles.find().limit(2).pretty();
"

# Clean test data
mongosh --eval "
use('test_database');
db.users.deleteMany({email: /test\.user\./});
db.user_sessions.deleteMany({session_token: /test_session/});
"
```

## Checklist
- [ ] User document has user_id field (custom UUID, MongoDB's _id is separate)
- [ ] Session user_id matches user's user_id exactly
- [ ] All queries use `{"_id": 0}` projection to exclude MongoDB's _id
- [ ] Backend queries use user_id (not _id or id)
- [ ] API returns user data with user_id field (not 401/404)
- [ ] Browser loads dashboard (not login page)

## Success Indicators
✅ /api/auth/me returns user data
✅ Dashboard loads without redirect
✅ CRUD operations work

## Failure Indicators
❌ "User not found" errors
❌ 401 Unauthorized responses
❌ Redirect to login page
