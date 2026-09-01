diff --git a/chatterbot-backend/app/models/user.py b/chatterbot-backend/app/models/user.py
index 82b1b78..0000000 100644
--- a/chatterbot-backend/app/models/user.py
+++ b/chatterbot-backend/app/models/user.py
@@
     # Gamification fields
     points = db.Column(db.Integer, default=0)
     level = db.Column(db.Integer, default=1)
     streak_count = db.Column(db.Integer, default=0)
     last_login_at = db.Column(db.DateTime, nullable=True)
+    gamification_enabled = db.Column(db.Boolean, default=True, nullable=False)
@@
     def to_dict(self):
         return {
@@
             "teen_count": self.teens.count(),
             "points": self.points or 0,
             "level": self.level or 1,
             "streak_count": self.streak_count or 0,
+            "gamification_enabled": bool(self.gamification_enabled),
         }
