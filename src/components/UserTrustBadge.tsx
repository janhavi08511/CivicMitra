/**
 * User Trust Badge Component
 * 
 * Displays user's trust level and fraud history
 */

import React, { useState } from "react";
import { Shield, AlertCircle, TrendingUp } from "lucide-react";
import { UserTrustScore } from "../types";

interface UserTrustBadgeProps {
  trustScore: UserTrustScore;
  compact?: boolean;
  showDetails?: boolean;
}

const UserTrustBadge: React.FC<UserTrustBadgeProps> = ({
  trustScore,
  compact = false,
  showDetails = true,
}) => {
  const [showModal, setShowModal] = useState(false);

  const getTrustConfig = (level: string) => {
    switch (level) {
      case "trusted":
        return {
          color: "bg-green-100 text-green-800",
          borderColor: "border-green-300",
          icon: "🟢",
          label: "Trusted",
          description: "Consistent, verified submissions",
        };
      case "normal":
        return {
          color: "bg-blue-100 text-blue-800",
          borderColor: "border-blue-300",
          icon: "🟡",
          label: "Normal",
          description: "Regular community member",
        };
      case "suspicious":
        return {
          color: "bg-orange-100 text-orange-800",
          borderColor: "border-orange-300",
          icon: "🟠",
          label: "Suspicious",
          description: "Multiple fraud flags detected",
        };
      case "blocked":
        return {
          color: "bg-red-100 text-red-800",
          borderColor: "border-red-300",
          icon: "🔴",
          label: "Blocked",
          description: "Submissions under review",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          borderColor: "border-gray-300",
          icon: "⚪",
          label: "Unknown",
          description: "Trust level unknown",
        };
    }
  };

  const config = getTrustConfig(trustScore.suspicionLevel);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xl">{config.icon}</span>
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
      </div>
    );
  }

  const approvalRate = trustScore.submissionsTotal > 0 
    ? ((trustScore.submissionsApproved / trustScore.submissionsTotal) * 100).toFixed(1)
    : "N/A";

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${config.color} ${config.borderColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} />
              <h3 className="font-semibold">{config.label}</h3>
            </div>
            <p className="text-sm opacity-80">{config.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="opacity-70">Trust Score</span>
                <div className="font-bold text-lg">{trustScore.trustScore}%</div>
              </div>
              <div>
                <span className="opacity-70">Approval Rate</span>
                <div className="font-bold text-lg">{approvalRate}%</div>
              </div>
            </div>
          </div>
          <div className="text-2xl">{config.icon}</div>
        </div>

        {/* Warning if suspicious */}
        {trustScore.suspicionLevel === "suspicious" ||
        trustScore.suspicionLevel === "blocked" ? (
          <div className="mt-3 p-2 bg-white bg-opacity-50 rounded flex items-start gap-2 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              {trustScore.fraudFlags} fraud flag{trustScore.fraudFlags !== 1 ? "s" : ""} detected
            </span>
          </div>
        ) : null}
      </div>

      {/* Modal */}
      {showModal && (
        <TrustDetailsModal
          trustScore={trustScore}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

/**
 * Trust Details Modal
 */
const TrustDetailsModal: React.FC<{
  trustScore: UserTrustScore;
  onClose: () => void;
}> = ({ trustScore, onClose }) => {
  const getTrustInfo = (level: string) => {
    switch (level) {
      case "trusted":
        return "This user has a strong track record of verified submissions with minimal fraud flags.";
      case "normal":
        return "This user has a standard approval rate typical of the community.";
      case "suspicious":
        return "This user has been flagged multiple times for potential fraud. Submissions may require additional review.";
      case "blocked":
        return "This user is temporarily blocked while their account is under investigation for potential fraud.";
      default:
        return "Trust level is unknown.";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Trust Score Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Trust Status</h3>
            <p className="text-sm text-gray-700">
              {getTrustInfo(trustScore.suspicionLevel)}
            </p>
          </div>

          {/* Score Breakdown */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Score Breakdown</h3>
            <div className="space-y-3">
              <MetricRow
                label="Overall Trust Score"
                value={`${trustScore.trustScore}%`}
                color="bg-blue-500"
                percentage={trustScore.trustScore}
              />
              <MetricRow
                label="Total Submissions"
                value={trustScore.submissionsTotal.toString()}
              />
              <MetricRow
                label="Approved"
                value={trustScore.submissionsApproved.toString()}
                color="bg-green-500"
              />
              <MetricRow
                label="Rejected"
                value={trustScore.submissionsRejected.toString()}
                color="bg-red-500"
              />
              <MetricRow
                label="Fraud Flags"
                value={trustScore.fraudFlags.toString()}
                color={trustScore.fraudFlags > 0 ? "bg-orange-500" : "bg-green-500"}
              />
            </div>
          </div>

          {/* Approval Rate */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Approval Rate</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{
                    width: `${
                      trustScore.submissionsTotal > 0
                        ? (trustScore.submissionsApproved /
                            trustScore.submissionsTotal) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="font-bold text-sm text-gray-900 w-12">
                {trustScore.submissionsTotal > 0
                  ? (
                      (trustScore.submissionsApproved /
                        trustScore.submissionsTotal) *
                      100
                    ).toFixed(1)
                  : "N/A"}
                %
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          {trustScore.lastUpdated && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Last Updated</h3>
              <p className="text-sm text-gray-600">
                {new Date(trustScore.lastUpdated).toLocaleString()}
              </p>
            </div>
          )}

          {/* Appeal Button */}
          {(trustScore.suspicionLevel === "suspicious" ||
            trustScore.suspicionLevel === "blocked") && (
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">
              Appeal Decision
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Metric Row Component
 */
const MetricRow: React.FC<{
  label: string;
  value: string;
  color?: string;
  percentage?: number;
}> = ({ label, value, color = "bg-gray-500", percentage }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      {percentage !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`${color} h-2 transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default UserTrustBadge;
