import requests
import sys
from datetime import datetime
import json

class InterviewIQAPITester:
    def __init__(self, base_url="https://nexus-builder-21.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.session_id = None
        self.user_id = None

    def log_result(self, name, success, status_code=None, message=""):
        """Log test result"""
        result = {
            "test": name,
            "success": success,
            "status_code": status_code,
            "message": message
        }
        self.test_results.append(result)
        
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - Status: {status_code}")
        else:
            print(f"❌ {name} - Status: {status_code} - {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if data and not files:
            headers['Content-Type'] = 'application/json'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            else:
                self.log_result(name, False, None, f"Unsupported method: {method}")
                return False, {}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text[:200]}
            
            self.log_result(name, success, response.status_code, 
                          "" if success else f"Expected {expected_status}, got {response.status_code}")
            
            return success, response_data

        except requests.exceptions.Timeout:
            self.log_result(name, False, None, "Request timeout (30s)")
            return False, {}
        except Exception as e:
            self.log_result(name, False, None, f"Error: {str(e)}")
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200,
            auth_required=False
        )
        return success

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        email = f"test_{timestamp}@interviewiq.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": f"Test User {timestamp}",
                "email": email,
                "password": "TestPass123!"
            },
            auth_required=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response and 'id' in response['user']:
                self.user_id = response['user']['id']
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "test@interviewiq.com",
                "password": "TestPass123!"
            },
            auth_required=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response and 'id' in response['user']:
                self.user_id = response['user']['id']
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_update_profile(self):
        """Test profile update"""
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            "auth/profile",
            200,
            data={"name": "Updated Test User"}
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard stats"""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        return success

    def test_dashboard_progress(self):
        """Test dashboard progress"""
        success, response = self.run_test(
            "Dashboard Progress",
            "GET",
            "dashboard/progress",
            200
        )
        return success

    def test_start_interview(self):
        """Test starting an interview session"""
        success, response = self.run_test(
            "Start Interview Session",
            "POST",
            "interviews/start",
            200,
            data={
                "company": "Google",
                "role": "Software Engineer",
                "experience_level": "mid",
                "mode": "TEXT",
                "persona": "RECRUITER",
                "round": "BEHAVIORAL"
            }
        )
        
        if success and 'session' in response and 'id' in response['session']:
            self.session_id = response['session']['id']
            print(f"   Session ID: {self.session_id}")
            return True
        return False

    def test_list_interviews(self):
        """Test listing interview sessions"""
        success, response = self.run_test(
            "List Interview Sessions",
            "GET",
            "interviews",
            200
        )
        return success

    def test_get_interview(self):
        """Test getting a specific interview session"""
        if not self.session_id:
            print("⚠️  Skipping Get Interview - No session ID available")
            return True
        
        success, response = self.run_test(
            "Get Interview Session",
            "GET",
            f"interviews/{self.session_id}",
            200
        )
        return success

    def test_submit_answer(self):
        """Test submitting an answer"""
        if not self.session_id:
            print("⚠️  Skipping Submit Answer - No session ID available")
            return True
        
        success, response = self.run_test(
            "Submit Answer",
            "POST",
            f"interviews/{self.session_id}/answer",
            200,
            data={
                "answer_text": "I have strong experience in software development with a focus on building scalable systems. In my previous role, I led a team of 5 engineers to deliver a microservices architecture that improved system performance by 40%."
            }
        )
        return success

    def test_next_question(self):
        """Test getting next question"""
        if not self.session_id:
            print("⚠️  Skipping Next Question - No session ID available")
            return True
        
        success, response = self.run_test(
            "Get Next Question",
            "POST",
            f"interviews/{self.session_id}/next-question",
            200
        )
        return success

    def test_complete_interview(self):
        """Test completing an interview"""
        if not self.session_id:
            print("⚠️  Skipping Complete Interview - No session ID available")
            return True
        
        success, response = self.run_test(
            "Complete Interview",
            "POST",
            f"interviews/{self.session_id}/complete",
            200
        )
        return success

    def test_company_prep(self):
        """Test company prep generation"""
        success, response = self.run_test(
            "Company Prep Generation",
            "POST",
            "company-prep",
            200,
            data={
                "company_name": "Google",
                "role": "Software Engineer",
                "experience_level": "mid"
            }
        )
        return success

    def test_plan_upgrade(self):
        """Test plan upgrade"""
        success, response = self.run_test(
            "Plan Upgrade",
            "POST",
            "plan/upgrade",
            200,
            data={"plan": "PRO"}
        )
        return success

    def test_stripe_checkout_pro(self):
        """Test Stripe checkout session creation for Pro plan"""
        success, response = self.run_test(
            "Stripe Checkout - Pro Plan",
            "POST",
            "payments/create-checkout",
            200,
            data={
                "plan": "PRO",
                "billing": "monthly",
                "origin_url": "https://nexus-builder-21.preview.emergentagent.com"
            }
        )
        
        if success and 'checkout_url' in response and 'session_id' in response:
            print(f"   Checkout URL: {response['checkout_url'][:60]}...")
            print(f"   Session ID: {response['session_id']}")
            return True
        return False

    def test_stripe_checkout_premium(self):
        """Test Stripe checkout session creation for Premium plan"""
        success, response = self.run_test(
            "Stripe Checkout - Premium Plan",
            "POST",
            "payments/create-checkout",
            200,
            data={
                "plan": "PREMIUM",
                "billing": "monthly",
                "origin_url": "https://nexus-builder-21.preview.emergentagent.com"
            }
        )
        
        if success and 'checkout_url' in response and 'session_id' in response:
            print(f"   Checkout URL: {response['checkout_url'][:60]}...")
            print(f"   Session ID: {response['session_id']}")
            return True
        return False

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print(f"📊 TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("="*60)
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🚀 Starting InterviewIQ API Tests")
    print("="*60)
    
    tester = InterviewIQAPITester()
    
    # Test sequence
    print("\n📋 BASIC HEALTH & AUTH TESTS")
    print("-"*60)
    tester.test_health()
    
    # Try to login with existing user first
    login_success = tester.test_login()
    
    # If login fails, register a new user
    if not login_success:
        print("   Login failed, trying registration...")
        tester.test_register()
    
    tester.test_get_me()
    tester.test_update_profile()
    
    print("\n📊 DASHBOARD TESTS")
    print("-"*60)
    tester.test_dashboard_stats()
    tester.test_dashboard_progress()
    
    print("\n🎤 INTERVIEW TESTS")
    print("-"*60)
    tester.test_start_interview()
    tester.test_list_interviews()
    tester.test_get_interview()
    tester.test_submit_answer()
    tester.test_next_question()
    tester.test_complete_interview()
    
    print("\n🏢 COMPANY PREP TESTS")
    print("-"*60)
    tester.test_company_prep()
    
    print("\n💳 PLAN & PAYMENT TESTS")
    print("-"*60)
    tester.test_plan_upgrade()
    tester.test_stripe_checkout_pro()
    tester.test_stripe_checkout_premium()
    
    # Print summary
    all_passed = tester.print_summary()
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
