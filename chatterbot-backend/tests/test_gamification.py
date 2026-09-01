*** Begin Patch
*** Update File: chatterbot-backend/tests/test_gamification.py
@@
 def test_admin_award_points(client):
@@
     res = client.post('/api/gamification/award', json={'user_id': user.id, 'amount': 50, 'reason': 'test'}, headers={'Authorization': f'Bearer {admin_token}'})
     assert res.status_code == 200
     data = res.get_json()
     assert data['points'] == 50
+
+
+def test_opt_out_prevents_award(client):
+    u = create_user(client)
+    token = get_token(u)
+
+    # opt-out
+    res = client.post('/api/gamification/preferences', json={'gamification_enabled': False}, headers={'Authorization': f'Bearer {token}'})
+    assert res.status_code == 200
+
+    # attempt to claim
+    res2 = client.post('/api/gamification/award-login', headers={'Authorization': f'Bearer {token}'})
+    assert res2.status_code == 403
+    assert 'disabled' in res2.get_json().get('message', '')
*** End Patch
