"""
JAL-RAKSHAK — Alert & Incident Management Service
Handles real-time alerts, investigation lifecycles, crew dispatch status,
multi-sensor corroboration links, statistics, and audit history.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class AlertRecord:
    def __init__(
        self,
        id: str,
        title: str,
        severity: str,  # critical, high, medium, low
        location: str,
        zone_id: str,
        details: str,
        pipeline_ref: Optional[str] = None,
        suspicion_id: Optional[str] = None,
        suspicion_score: Optional[float] = None,
        investigation_status: str = "unassigned",  # unassigned, under_investigation, crew_dispatched, verified_leak, false_positive, resolved
        physical_verification: str = "AI Suspicion (Unverified)",
        acknowledged: bool = False,
        timestamp: Optional[str] = None,
        assigned_crew: Optional[str] = None,
        timeline: Optional[List[Dict[str, str]]] = None,
    ):
        self.id = id
        self.title = title
        self.severity = severity.lower()
        self.location = location
        self.zone_id = zone_id
        self.details = details
        self.pipeline_ref = pipeline_ref
        self.suspicion_id = suspicion_id
        self.suspicion_score = suspicion_score
        self.investigation_status = investigation_status
        self.physical_verification = physical_verification
        self.acknowledged = acknowledged
        self.timestamp = timestamp or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        self.assigned_crew = assigned_crew
        self.timeline = timeline or [
            {
                "time": self.timestamp,
                "actor": "Sensor Fusion AI",
                "action": "Alert triggered by multi-modal telemetry divergence",
            }
        ]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "severity": self.severity,
            "location": self.location,
            "zone_id": self.zone_id,
            "details": self.details,
            "pipeline_ref": self.pipeline_ref,
            "suspicion_id": self.suspicion_id,
            "suspicion_score": self.suspicion_score,
            "investigation_status": self.investigation_status,
            "physical_verification": self.physical_verification,
            "acknowledged": self.acknowledged,
            "timestamp": self.timestamp,
            "assigned_crew": self.assigned_crew,
            "timeline": self.timeline,
        }

class AlertManager:
    def __init__(self):
        self.alerts: Dict[str, AlertRecord] = {}
        self._initialize_seed_alerts()

    def _initialize_seed_alerts(self):
        seed_data = [
            AlertRecord(
                id="alt-101",
                title="Critical Pipeline Leakage Suspicion Corroborated",
                severity="critical",
                location="Sector 9 South Industrial Conduit 9-B",
                zone_id="zone-south",
                pipeline_ref="e-p2-pn102",
                suspicion_id="LS-2026-081",
                suspicion_score=0.892,
                details="Sensor fusion identified concurrent +35.8% flow surge and -28.8% pressure collapse. Water loss estimated at 18.5 m³/h.",
                investigation_status="under_investigation",
                physical_verification="AI Suspicion (Unverified)",
                acknowledged=False,
                timestamp="10 mins ago",
                assigned_crew="Team Gamma (Acoustic Correlator Unit 2)",
                timeline=[
                    {"time": "12 mins ago", "actor": "Sensor Fusion AI", "action": "Anomaly detected from PRESS-Z3-001 & FLOW-Z3-001"},
                    {"time": "10 mins ago", "actor": "System Dispatch", "action": "High suspicion alert generated"},
                    {"time": "6 mins ago", "actor": "Chief Engineer", "action": "Assigned Team Gamma for acoustic cross-correlation"},
                ]
            ),
            AlertRecord(
                id="alt-102",
                title="Nodal Pressure Gradient Anomaly",
                severity="high",
                location="Zone 11 South Distribution Ring Valve 4",
                zone_id="zone-south",
                pipeline_ref="e-p2-ind1",
                suspicion_id=None,
                suspicion_score=0.72,
                details="Pressure reached 3.45 Bar (target minimum 4.0 Bar). Sub-network pump cavitation safeguard active.",
                investigation_status="unassigned",
                physical_verification="AI Suspicion (Unverified)",
                acknowledged=False,
                timestamp="24 mins ago",
            ),
            AlertRecord(
                id="alt-103",
                title="Moderate Seepage Suspicion in Transmission Trunk",
                severity="medium",
                location="East High-Storage Delivery Trunk 4-A near Commercial Gateway",
                zone_id="zone-east",
                pipeline_ref="e-tank1-res1",
                suspicion_id="LS-2026-082",
                suspicion_score=0.645,
                details="Multi-sensor divergence: Inflow rate +9.3% above expected curve while nodal pressure is down by -9.8%. Downstream meters normal.",
                investigation_status="unassigned",
                physical_verification="AI Suspicion (Unverified)",
                acknowledged=True,
                timestamp="48 mins ago",
                timeline=[
                    {"time": "48 mins ago", "actor": "Sensor Fusion AI", "action": "Subterranean seepage signature identified"},
                    {"time": "35 mins ago", "actor": "Duty Operator", "action": "Acknowledged and scheduled for non-peak inspection"},
                ]
            ),
            AlertRecord(
                id="alt-104",
                title="Elevated Non-Revenue Water (NRW) Balance",
                severity="low",
                location="Zone 15 West Suburbs Distribution Sub-grid",
                zone_id="zone-west",
                pipeline_ref=None,
                suspicion_id=None,
                suspicion_score=0.42,
                details="Monthly water balance calculation shows 20.6% distribution loss vs 15.0% target benchmark.",
                investigation_status="resolved",
                physical_verification="Physically Verified (Field Acoustic Crew)",
                acknowledged=True,
                timestamp="2 hours ago",
                assigned_crew="Audit Team 1",
                timeline=[
                    {"time": "2 hours ago", "actor": "Water Balance Model", "action": "NRW audit anomaly flagged"},
                    {"time": "1 hour ago", "actor": "Audit Team 1", "action": "Physical check confirmed service connection meter drift"},
                    {"time": "30 mins ago", "actor": "Operator", "action": "Meter recalibrated. Marked resolved."},
                ]
            ),
            AlertRecord(
                id="alt-105",
                title="Raw Water Intake Screen Turbidity Advisory",
                severity="low",
                location="Northern Canal Intake Intake Flume",
                zone_id="zone-north",
                pipeline_ref="e-res-wtp",
                suspicion_id=None,
                suspicion_score=0.31,
                details="Turbidity elevated slightly to 1.8 NTU following upstream rainfall. Coagulant dosing automated.",
                investigation_status="resolved",
                physical_verification="Physically Verified (Field Acoustic Crew)",
                acknowledged=True,
                timestamp="4 hours ago",
            ),
        ]
        for a in seed_data:
            self.alerts[a.id] = a

    def get_alerts(
        self,
        severity: Optional[str] = None,
        zone_id: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        results = list(self.alerts.values())

        if severity and severity.lower() != "all":
            results = [a for a in results if a.severity == severity.lower()]

        if zone_id and zone_id.lower() != "all":
            results = [a for a in results if a.zone_id.lower() == zone_id.lower()]

        if status and status.lower() != "all":
            if status.lower() == "unacknowledged":
                results = [a for a in results if not a.acknowledged]
            elif status.lower() == "acknowledged":
                results = [a for a in results if a.acknowledged]
            elif status.lower() == "active":
                results = [a for a in results if a.investigation_status not in ["resolved", "false_positive"]]
            elif status.lower() == "resolved":
                results = [a for a in results if a.investigation_status in ["resolved", "false_positive"]]
            else:
                results = [a for a in results if a.investigation_status.lower() == status.lower()]

        if search:
            q = search.lower()
            results = [
                a for a in results
                if q in a.title.lower() or q in a.location.lower() or q in a.details.lower() or (a.pipeline_ref and q in a.pipeline_ref.lower())
            ]

        # Sort by unacknowledged first, then severity priority
        severity_rank = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        results.sort(key=lambda a: (a.acknowledged, severity_rank.get(a.severity, 4)))

        return [a.to_dict() for a in results]

    def get_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        alert = self.alerts.get(alert_id)
        return alert.to_dict() if alert else None

    def acknowledge_alert(self, alert_id: str, actor: str = "Operator") -> Optional[Dict[str, Any]]:
        alert = self.alerts.get(alert_id)
        if not alert:
            return None
        alert.acknowledged = True
        alert.timeline.append({
            "time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "actor": actor,
            "action": "Alert acknowledged",
        })
        return alert.to_dict()

    def update_alert_investigation(
        self,
        alert_id: str,
        investigation_status: str,
        physical_verification: Optional[str] = None,
        assigned_crew: Optional[str] = None,
        note: Optional[str] = None,
        actor: str = "Operator",
    ) -> Optional[Dict[str, Any]]:
        alert = self.alerts.get(alert_id)
        if not alert:
            return None

        alert.investigation_status = investigation_status
        if physical_verification:
            alert.physical_verification = physical_verification
        elif investigation_status == "verified_leak":
            alert.physical_verification = "Physically Verified (Field Acoustic Crew)"
        elif investigation_status == "false_positive":
            alert.physical_verification = "False Positive (Meter Recalibration Required)"

        if assigned_crew:
            alert.assigned_crew = assigned_crew

        action_desc = f"Status updated to '{investigation_status}'"
        if note:
            action_desc += f": {note}"

        alert.timeline.append({
            "time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "actor": actor,
            "action": action_desc,
        })
        return alert.to_dict()

    def add_alert_from_suspicion(self, suspicion: Any) -> Dict[str, Any]:
        """Creates an alert whenever a high or critical leakage suspicion is corroborated."""
        alert_id = f"alt-{len(self.alerts) + 101}"
        title = f"AI Leakage Suspicion Corroborated ({int(suspicion.suspicion_score * 100)}%)"
        new_alert = AlertRecord(
            id=alert_id,
            title=title,
            severity=suspicion.severity,
            location=suspicion.potential_location,
            zone_id=suspicion.zone_id,
            pipeline_ref=suspicion.pipeline_ref,
            suspicion_id=suspicion.id,
            suspicion_score=suspicion.suspicion_score,
            details=suspicion.explanation,
            investigation_status="under_investigation" if suspicion.severity in ["critical", "high"] else "unassigned",
            physical_verification=suspicion.physical_verification,
            acknowledged=False,
            timestamp=suspicion.timestamp,
        )
        self.alerts[alert_id] = new_alert
        return new_alert.to_dict()

    def get_statistics(self) -> Dict[str, Any]:
        total = len(self.alerts)
        critical = sum(1 for a in self.alerts.values() if a.severity == "critical" and a.investigation_status != "resolved")
        high = sum(1 for a in self.alerts.values() if a.severity == "high" and a.investigation_status != "resolved")
        ack_count = sum(1 for a in self.alerts.values() if a.acknowledged)
        resolved_count = sum(1 for a in self.alerts.values() if a.investigation_status in ["resolved", "false_positive"])
        verified_leaks = sum(1 for a in self.alerts.values() if a.investigation_status == "verified_leak")
        false_positives = sum(1 for a in self.alerts.values() if a.investigation_status == "false_positive")
        unverified_suspicions = sum(1 for a in self.alerts.values() if "AI Suspicion" in a.physical_verification)

        return {
            "total_alerts": total,
            "active_critical": critical,
            "active_high": high,
            "acknowledged_count": ack_count,
            "acknowledged_pct": round((ack_count / max(total, 1)) * 100, 1),
            "resolved_count": resolved_count,
            "verified_leaks": verified_leaks,
            "false_positives": false_positives,
            "unverified_suspicions": unverified_suspicions,
            "false_positive_rate_pct": round((false_positives / max(resolved_count, 1)) * 100, 1),
            "average_response_mins": 38.5,
        }

alert_manager = AlertManager()
