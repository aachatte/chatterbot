*** Begin Patch
*** Update File: chatterbot-backend/app/routes/gamification.py
@@
 @gam_bp.route('/transactions', methods=['GET'])
 @jwt_required()
 def list_transactions():
@@
     return jsonify([{'id': t.id, 'amount': t.amount, 'reason': t.reason, 'metadata': t.metadata, 'created_at': t.created_at.isoformat()} for t in txs])
+
+
+@gam_bp.route('/preferences', methods=['GET', 'POST'])
+@jwt_required()
+def gamification_preferences():
+    """Get or set user-level gamification preference (opt-out/opt-in).
+
+    GET: returns { gamification_enabled: bool }
+    POST: payload { gamification_enabled: true|false }
+    """
+    user_id = get_jwt_identity()
+    user = User.query.get(user_id)
+    if not user:
+        return jsonify({'error': 'Not found'}), 404
+
+    if request.method == 'GET':
+        return jsonify({'gamification_enabled': bool(getattr(user, 'gamification_enabled', True))})
+
+    payload = request.get_json() or {}
+    val = payload.get('gamification_enabled')
+    if val is None:
+        return jsonify({'error': 'gamification_enabled required'}), 400
+
+    user.gamification_enabled = bool(val)
+    db.session.commit()
+    return jsonify({'message': 'Preference updated', 'gamification_enabled': user.gamification_enabled})
*** End Patch
