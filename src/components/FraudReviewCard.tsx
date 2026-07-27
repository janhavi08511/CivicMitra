/**
 * Fraud Review Card Component
 * 
 * Individual card for displaying fraudulent submission details
 */

import React from "react";
import { AlertCircle, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { FraudReviewTask, FraudRiskLevel } from "../types";

interface FraudReviewCardProps {
  task: FraudReviewTask;
  isSelected?: boolean;
  onSelect?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const FraudReviewCard: React.FC<FraudReviewCardProps> = ({
  task,
  isSelected = false,
  onSelect,
  onApprove,
  onReject,
}) => {
  const getRiskColor = (level: FraudRiskLevel) => {
    switch (level) {
      case FraudRiskLevel.APPROVED:
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", badge: "bg-green-100 text-green-800" };
      case FraudRiskLevel.LOW:
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", badge: "bg-blue-100 text-blue-800" };
      case FraudRiskLevel.MEDIUM:
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800" };
      case FraudRiskLevel.HIGH:
        return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-100 text-orange-800" };
      case FraudRiskLevel.CRITICAL:
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", badge: "bg-red-100 text-red-800" };
    }
  };

  const colors = getRiskColor(task.fraudScore.riskLevel as FraudRiskLevel);

  const getStatusIcon = () => {
    switch (task.status) {
      case "pending":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "rejected":
        return <XCircle className="text-red-500" size={20} />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border-2 transition cursor-pointer ${
        isSelected
          ? `${colors.border} ${colors.bg} ring-2 ring-blue-500`
          : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-md`
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 flex-1">
              {task.challengeTitle}
            </h3>
            {getStatusIcon()}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${colors.badge}`}
            >
              {task.fraudScore.riskLevel}
            </span>
            <span className="text-xs font-bold text-gray-700">
              Risk: {task.fraudScore.overallScore}%
            </span>
          </div>

          <p className="text-sm text-gray-600">
            User: <span className="font-medium">{task.userId}</span> • Submission:{" "}
            <span className="font-medium">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>

      {/* Expandable Detail Section */}
      {isSelected && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Image Preview */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Submission Image
            </h4>
            <img
              src={task.imageUrl}
              alt="Submission"
              className="w-full rounded-lg max-h-64 object-cover"
            />
          </div>

          {/* Score Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Fraud Score Breakdown
            </h4>
            <div className="space-y-2">
              <ScoreBar
                label="Image Quality"
                score={task.fraudScore.breakdown.imageAnalysis}
              />
              <ScoreBar
                label="Metadata Analysis"
                score={task.fraudScore.breakdown.metadataAnalysis}
              />
              <ScoreBar
                label="Geolocation Analysis"
                score={task.fraudScore.breakdown.geolocationAnalysis}
              />
              <ScoreBar
                label="Pattern Analysis"
                score={task.fraudScore.breakdown.patternAnalysis}
              />
            </div>
          </div>

          {/* Fraud Indicators */}
          {(task.fraudScore.details.isDuplicate ||
            task.fraudScore.details.isAIGenerated ||
            task.fraudScore.details.metadataFlags.length > 0 ||
            task.fraudScore.details.locationFlags.length > 0 ||
            task.fraudScore.details.patternFlags.length > 0) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Fraud Indicators
              </h4>
              <div className="space-y-2">
                {task.fraudScore.details.isDuplicate && (
                  <IndicatorBadge
                    type="duplicate"
                    text="Duplicate image detected"
                    severity="high"
                  />
                )}
                {task.fraudScore.details.isAIGenerated && (
                  <IndicatorBadge
                    type="ai"
                    text={`AI-generated content (${(task.fraudScore.details.aiConfidence * 100).toFixed(0)}% confidence)`}
                    severity="critical"
                  />
                )}
                {task.fraudScore.details.metadataFlags.map((flag, idx) => (
                  <IndicatorBadge key={idx} type="metadata" text={flag} severity="medium" />
                ))}
                {task.fraudScore.details.locationFlags.map((flag, idx) => (
                  <IndicatorBadge key={idx} type="location" text={flag} severity="medium" />
                ))}
                {task.fraudScore.details.patternFlags.map((flag, idx) => (
                  <IndicatorBadge key={idx} type="pattern" text={flag} severity="medium" />
                ))}
              </div>
            </div>
          )}

          {/* Review History */}
          {task.status !== "pending" && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">
                <strong>Status:</strong> {task.status.toUpperCase()}
              </p>
              {task.reviewedAt && (
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Reviewed By:</strong> {task.reviewedBy || "System"}
                </p>
              )}
              {task.reviewedAt && (
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Reviewed:</strong>{" "}
                  {new Date(task.reviewedAt).toLocaleString()}
                </p>
              )}
              {task.reviewNotes && (
                <p className="text-xs text-gray-700 mt-2">
                  <strong>Notes:</strong> {task.reviewNotes}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {task.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove?.();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Score Bar Component
 */
const ScoreBar: React.FC<{ label: string; score: number }> = ({
  label,
  score,
}) => {
  const getColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 50) return "bg-yellow-500";
    if (score < 70) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${getColor(score)} h-2 rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Indicator Badge Component
 */
const IndicatorBadge: React.FC<{
  type: "duplicate" | "ai" | "metadata" | "location" | "pattern";
  text: string;
  severity: "low" | "medium" | "high" | "critical";
}> = ({ type, text, severity }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-50 text-red-800 border-red-200";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "duplicate":
        return "🔄";
      case "ai":
        return "🤖";
      case "metadata":
        return "📝";
      case "location":
        return "📍";
      case "pattern":
        return "📊";
    }
  };

  return (
    <div
      className={`px-3 py-2 rounded border ${getSeverityColor(severity)} text-xs flex items-start gap-2`}
    >
      <span>{getTypeIcon()}</span>
      <span>{text}</span>
    </div>
  );
};

export default FraudReviewCard;
