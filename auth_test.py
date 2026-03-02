import requests
import sys

def test_auth_endpoints():
    """Test authenticated endpoints with test session"""
    base_url = "https://supernetwork-ai.preview.emergentagent.com/api"
    session_token = "test_session_1772443281068"
    
    headers = {
        'Authorization': f'Bearer {session_token}',
        'Content-Type': 'application/json'
    }
    
    print("🔍 Testing authenticated endpoints...")
    
    # Test /auth/me
    print("\n1. Testing /auth/me...")
    response = requests.get(f"{base_url}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ User authenticated: {user_data.get('name')}")
        print(f"   Email: {user_data.get('email')}")
        print(f"   Onboarding completed: {user_data.get('onboarding_completed')}")
    else:
        print(f"❌ Auth failed: {response.text}")
    
    # Test ikigai endpoint
    print("\n2. Testing /ikigai...")
    response = requests.get(f"{base_url}/ikigai", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        ikigai = response.json()
        print(f"✅ Ikigai retrieved")
        print(f"   Statement: {ikigai.get('ikigai_statement', 'None')[:100]}...")
    else:
        print(f"❌ Ikigai fetch failed: {response.text}")
    
    # Test search people
    print("\n3. Testing /search/people...")
    search_data = {"query": "AI engineer"}
    response = requests.post(f"{base_url}/search/people", json=search_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        results = response.json()
        print(f"✅ Search completed, found {len(results)} results")
    else:
        print(f"❌ Search failed: {response.text}")
    
    # Test opportunity creation
    print("\n4. Testing opportunity creation...")
    opp_data = {
        "type": "gig",
        "title": "Test AI Development Gig",
        "description": "Looking for an AI engineer to help with a machine learning project",
        "skills_required": ["Python", "Machine Learning"],
        "compensation_type": "Fixed",
        "compensation_amount": "$2000",
        "timeline": "2 weeks"
    }
    response = requests.post(f"{base_url}/opportunities", json=opp_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        opportunity = response.json()
        print(f"✅ Opportunity created: {opportunity.get('title')}")
        print(f"   ID: {opportunity.get('opportunity_id')}")
    else:
        print(f"❌ Opportunity creation failed: {response.text}")

if __name__ == "__main__":
    test_auth_endpoints()