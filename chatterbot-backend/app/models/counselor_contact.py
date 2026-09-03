"""School counselor contact model for crisis CC alerts."""
from app import db
from app.utils.time import utc_now


class CounselorContact(db.Model):
    __tablename__ = "counselor_contacts"

    id = db.Column(db.Integer, primary_key=True)
    guardian_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    counselor_name = db.Column(db.String(200), nullable=False)
    counselor_email = db.Column(db.String(200), nullable=False)
    school_name = db.Column(db.String(200), nullable=True)
    cc_on_crisis = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "guardian_id": self.guardian_id,
            "counselor_name": self.counselor_name,
            "counselor_email": self.counselor_email,
            "school_name": self.school_name,
            "cc_on_crisis": self.cc_on_crisis,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
