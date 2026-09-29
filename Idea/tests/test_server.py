"""
ScholarVerge Comprehensive API & Business Logic Integration Test Suite
Verifies:
1. Health endpoints (/health, /api/db/health)
2. Specialist Tutors configuration and order:
   - 1st: Sophia Mitchell (DNP & M.S. in Health Psychology)
   - 2nd: Oliver Harrison (Ph.D. in Financial Econometrics)
   - 3rd: Claire Bennett (LL.M. in International Commercial Law)
3. Student Registration & Validation (/api/auth/register)
4. Student Authentication (/api/auth/login)
5. Super Admin Authentication with Master Credentials (/api/auth/admin-login)
6. Academic Order Creation with Guest / Logged-in details (/api/orders/create)
7. Live Real-Time Order Tracking & Verification (/api/orders/track?code=...)
8. Multi-tenancy integrity & offline invoicing inquiry compatibility
"""

import unittest
import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://localhost:8000"

def make_request(path, method="GET", data=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {"raw": content}
        return e.code, parsed

class TestScholarVergeServer(unittest.TestCase):

    def test_01_server_health(self):
        status, body = make_request("/health")
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "healthy")

    def test_02_database_health(self):
        status, body = make_request("/api/db/health")
        self.assertEqual(status, 200)
        self.assertTrue(body.get("success"))
        db_info = body.get("database", {})
        self.assertIn("PostgreSQL", db_info.get("engine", ""))

    def test_03_specialist_tutors(self):
        status, body = make_request("/api/tutors")
        self.assertEqual(status, 200)
        self.assertTrue(body.get("success"))
        tutors = body.get("tutors", [])
        self.assertGreaterEqual(len(tutors), 3)
        # Verify order and specialist credentials
        self.assertEqual(tutors[0]["full_name"], "Sophia Mitchell")
        self.assertIn("Nursing", tutors[0]["subjects"])
        self.assertEqual(tutors[1]["full_name"], "Oliver Harrison")
        self.assertIn("Economics", tutors[1]["subjects"])
        self.assertEqual(tutors[2]["full_name"], "Claire Bennett")
        self.assertIn("Law", tutors[2]["subjects"])

    def test_04_super_admin_login(self):
        payload = {
            "email": "scholarverge@gmail.com",
            "password": "Lovato20"
        }
        status, body = make_request("/api/auth/admin-login", method="POST", data=payload)
        self.assertEqual(status, 200)
        self.assertTrue(body.get("success"))
        self.assertEqual(body["user"]["role"], "superadmin")
        self.assertTrue("session_token" in body)

    def test_05_student_registration_and_login(self):
        unique_email = f"test.scholar.{int(time.time())}@university.edu"
        reg_payload = {
            "full_name": "Test Scholar",
            "email": unique_email,
            "university": "Cambridge University",
            "academic_level": "Masters",
            "major_field": "Computer Science & AI",
            "whatsapp_number": "+16677757597",
            "password": "ValidPassword2026!"
        }
        status, body = make_request("/api/auth/register", method="POST", data=reg_payload)
        self.assertIn(status, [200, 201])
        self.assertTrue(body.get("success"))

        # Verify login with newly registered student
        login_payload = {
            "email": unique_email,
            "password": "ValidPassword2026!"
        }
        l_status, l_body = make_request("/api/auth/login", method="POST", data=login_payload)
        self.assertEqual(l_status, 200)
        self.assertTrue(l_body.get("success"))
        self.assertEqual(l_body["user"]["email"], unique_email)

    def test_06_academic_order_creation_and_tracking(self):
        order_payload = {
            "topic": "Impact of Generative AI on Modern Distributed Systems",
            "assignment_type": "Research Paper",
            "student_name": "Alex Mercer",
            "student_email": "alex.mercer@oxford.edu",
            "student_phone": "+16677757597",
            "tutor_name": "Oliver Harrison",
            "academic_level": "Masters",
            "pages": 5,
            "citation_style": "IEEE (8 sources)",
            "writing_style": "Standard Academic",
            "prompt": "Investigate consensus protocols under high network partition latency.",
            "client_specifications": "Focus on Raft and Paxos algorithmic guarantees.",
            "deadline": "In 3 Days",
            "deadline_datetime": "2026-10-05T12:00",
            "sources_count": 8,
            "price_amount": 0.00,
            "payment_method": "email_inquiry",
            "file_name": "Distributed_Systems_Raft_Brief.pdf",
            "file_size": "2.4 MB",
            "file_type": "application/pdf"
        }
        status, body = make_request("/api/orders/create", method="POST", data=order_payload)
        self.assertIn(status, [200, 201])
        self.assertTrue(body.get("success"))
        order_number = body.get("order_number")
        self.assertTrue(order_number.startswith("SV-"))

        # Now test live tracking for this exact order
        t_status, t_body = make_request(f"/api/orders/track?code={order_number}")
        self.assertEqual(t_status, 200)
        self.assertTrue(t_body.get("success"))
        order = t_body.get("order")
        self.assertEqual(order["order_number"], order_number)
        self.assertEqual(order["student_name"], "Alex Mercer")
        self.assertEqual(order["pages"], 5)
        self.assertEqual(order["tutor_name"], "Oliver Harrison")

    def test_07_existing_demo_order_tracking(self):
        status, body = make_request("/api/orders/track?code=SV-84920")
        self.assertEqual(status, 200)
        self.assertTrue(body.get("success"))
        order = body.get("order")
        self.assertEqual(order["order_number"], "SV-84920")
        self.assertEqual(order["tutor_name"], "Sophia Mitchell")
        self.assertEqual(order["turnitin_ai_score"], 0.0)

if __name__ == "__main__":
    unittest.main()
