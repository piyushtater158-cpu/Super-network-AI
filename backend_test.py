import requests
import sys
from datetime import datetime
import json

class SuperNetworkAITester:
    def __init__(self, base_url="https://supernetwork-ai.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_json = response.json()
                    print(f"   Response: {json.dumps(response_json, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                self.failed_tests.append({
                    "name": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })

            return success, response.json() if response.text and response.text.strip() else {}

        except requests.exceptions.ConnectionError as e:
            print(f"❌ Failed - Connection Error: {str(e)}")
            self.failed_tests.append({
                "name": name,
                "error": "Connection Error", 
                "details": str(e)
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "name": name,
                "error": "General Error",
                "details": str(e)
            })
            return False, {}

    def test_basic_endpoints(self):
        """Test basic public endpoints"""
        print("\n=== TESTING BASIC ENDPOINTS ===")
        
        # Test root endpoint
        self.run_test("Root API", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)
        
        return True

    def test_public_endpoints(self):
        """Test public endpoints that don't require auth"""
        print("\n=== TESTING PUBLIC ENDPOINTS ===")
        
        # Test opportunities endpoint (should return empty array)
        success, response = self.run_test("List Opportunities", "GET", "opportunities", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} opportunities")
        
        # Test leaderboard endpoint
        success, response = self.run_test("Get Leaderboard", "GET", "users/leaderboard", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} users in leaderboard")
        
        return True

    def test_auth_endpoints(self):
        """Test auth-related endpoints"""
        print("\n=== TESTING AUTH ENDPOINTS ===")
        
        # Test /auth/me without token (should fail)
        self.run_test("Auth Me (No Token)", "GET", "auth/me", 401)
        
        # Test session creation (would require real session_id)
        print("   Note: Session creation requires real OAuth session_id")
        
        return True

    def test_authenticated_endpoints(self):
        """Test authenticated endpoints with valid session token"""
        print("\n=== TESTING AUTHENTICATED ENDPOINTS ===")
        
        # Use test session token
        test_token = "test_session_1772444369754"
        self.session_token = test_token
        
        # Test auth/me with valid token
        success, user_data = self.run_test("Auth Me (With Token)", "GET", "auth/me", 200)
        if success:
            self.test_user_id = user_data.get('user_id')
            print(f"   Authenticated as: {user_data.get('name')} (ID: {self.test_user_id})")
        
        # Test getting ikigai profile
        self.run_test("Get My Ikigai", "GET", "ikigai", 200)
        
        # Test creating/updating ikigai
        self.run_test("Update Ikigai", "POST", "ikigai", 200, {
            "what_i_love": ["Building AI products", "Solving problems"],
            "what_im_good_at": ["Python", "Machine Learning"],
            "what_i_can_be_paid_for": ["AI Development"],
            "what_the_world_needs": ["Ethical AI"]
        })
        
        # Test profile update
        self.run_test("Update Profile", "PUT", "users/profile", 200, {
            "role_labels": ["AI Engineer", "Testing"]
        })
        
        # Test opportunity creation
        success, opp_data = self.run_test("Create Opportunity", "POST", "opportunities", 201, {
            "type": "gig",
            "title": "Test AI Project",
            "description": "Need AI developer for testing project",
            "skills_required": ["Python", "AI"],
            "compensation_type": "Fixed",
            "compensation_amount": "$500",
            "timeline": "1 week"
        })
        
        # Test search people
        self.run_test("Search People", "POST", "search/people", 200, {
            "query": "AI engineer with Python skills"
        })
        
        # Test messaging endpoints
        if self.test_user_id:
            # Create a message (will create conversation automatically)
            self.run_test("Send Message", "POST", "messages", 200, {
                "receiver_id": self.test_user_id,  # Send to self for testing
                "content": "Test message for system validation"
            })
            
            # Get conversations
            self.run_test("Get Conversations", "GET", "messages/conversations", 200)
        
        # Test rating creation
        if self.test_user_id:
            # Try to rate self (should fail)
            self.run_test("Rate Self (Should Fail)", "POST", "ratings", 400, {
                "rated_user_id": self.test_user_id,
                "collaboration": 9,
                "reliability": 8,
                "skill_quality": 9,
                "culture_fit": 8,
                "professionalism": 9,
                "would_work_again": True,
                "comments": "Great developer!"
            })
        
        return True

    def test_protected_endpoints_without_auth(self):
        """Test that protected endpoints properly reject unauthenticated requests"""
        print("\n=== TESTING PROTECTED ENDPOINTS (No Auth) ===")
        
        # Test ikigai creation
        self.run_test("Create Ikigai (No Auth)", "POST", "ikigai", 401, {
            "what_i_love": ["test"],
            "what_im_good_at": ["test"],
            "what_i_can_be_paid_for": ["test"],
            "what_the_world_needs": ["test"]
        })
        
        # Test opportunity creation
        self.run_test("Create Opportunity (No Auth)", "POST", "opportunities", 401, {
            "type": "gig",
            "title": "Test Gig",
            "description": "Test description"
        })
        
        # Test search people
        self.run_test("Search People (No Auth)", "POST", "search/people", 401, {
            "query": "AI engineer"
        })
        
        return True

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*50}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "N/A")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                if 'error' in test:
                    print(f"   - {test['name']}: {test['error']}")
                else:
                    print(f"   - {test['name']}: Expected {test.get('expected')}, got {test.get('actual')}")

def main():
    """Main test execution"""
    print("🚀 Starting SuperNetworkAI Backend Tests")
    print(f"Testing against: https://supernetwork-ai.preview.emergentagent.com/api")
    
    tester = SuperNetworkAITester()
    
    # Run all test suites
    tester.test_basic_endpoints()
    tester.test_public_endpoints()
    tester.test_auth_endpoints()
    tester.test_authenticated_endpoints()
    tester.test_protected_endpoints_without_auth()
    
    # Print final summary
    tester.print_summary()
    
    # Return appropriate exit code
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())