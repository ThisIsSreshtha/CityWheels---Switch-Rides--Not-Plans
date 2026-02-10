import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './OwnerPanel.css';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [expandedReport, setExpandedReport] = useState(null);

    const [formData, setFormData] = useState({
        reportType: 'vehicle_issue',
        subject: '',
        description: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get('/api/owner/reports');
            setReports(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Error fetching reports');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await axios.post('/api/owner/reports', formData);
            toast.success('Report submitted successfully');
            setReports([res.data.data, ...reports]);

            // Reset form
            setFormData({
                reportType: 'vehicle_issue',
                subject: '',
                description: '',
                priority: 'medium'
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting report');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'status-badge pending';
            case 'reviewing': return 'status-badge reviewing';
            case 'resolved': return 'status-badge resolved';
            case 'closed': return 'status-badge closed';
            default: return 'status-badge';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'low': return 'priority-badge low';
            case 'medium': return 'priority-badge medium';
            case 'high': return 'priority-badge high';
            default: return 'priority-badge';
        }
    };

    const getReportTypeLabel = (type) => {
        return type === 'vehicle_issue' ? '🚗 Vehicle Issue' : '⚠️ Customer Misbehavior';
    };

    if (loading) {
        return (
            <div className="owner-panel">
                <div className="owner-content">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="owner-panel">
            <div className="owner-content">
                <h1 className="page-title">📢 Reports</h1>
                <p className="page-subtitle">Submit reports about vehicle issues or customer misbehavior</p>

                {/* Submit Report Form */}
                <div className="owner-card">
                    <div className="card-header">
                        <h3>Submit New Report</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="report-form">
                        <div className="form-group">
                            <label>Report Type *</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="reportType"
                                        value="vehicle_issue"
                                        checked={formData.reportType === 'vehicle_issue'}
                                        onChange={handleInputChange}
                                    />
                                    <span>🚗 Vehicle Issue</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="reportType"
                                        value="customer_misbehavior"
                                        checked={formData.reportType === 'customer_misbehavior'}
                                        onChange={handleInputChange}
                                    />
                                    <span>⚠️ Customer Misbehavior</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Subject *</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief summary of the issue"
                                required
                                maxLength="200"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide detailed information about the issue..."
                                required
                                maxLength="2000"
                                rows="5"
                                className="form-textarea"
                            />
                            <small className="char-count">{formData.description.length}/2000 characters</small>
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : '📢 Submit Report'}
                        </button>
                    </form>
                </div>

                {/* Reports List */}
                <div className="owner-card">
                    <div className="card-header">
                        <h3>My Reports ({reports.length})</h3>
                    </div>

                    {reports.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No reports yet</h3>
                            <p>Submit your first report using the form above</p>
                        </div>
                    ) : (
                        <div className="reports-list">
                            {reports.map((report) => (
                                <div key={report._id} className="report-item">
                                    <div className="report-header">
                                        <div className="report-type">{getReportTypeLabel(report.reportType)}</div>
                                        <div className="report-badges">
                                            <span className={getPriorityBadgeClass(report.priority)}>
                                                {report.priority.toUpperCase()}
                                            </span>
                                            <span className={getStatusBadgeClass(report.status)}>
                                                {report.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="report-subject">{report.subject}</h4>

                                    <div className="report-meta">
                                        <span>📅 {new Date(report.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>

                                    <div className={`report-description ${expandedReport === report._id ? 'expanded' : ''}`}>
                                        <p>{report.description}</p>
                                    </div>

                                    <button
                                        className="btn-link"
                                        onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                                    >
                                        {expandedReport === report._id ? '▲ Show less' : '▼ Read more'}
                                    </button>

                                    {report.adminNotes && (
                                        <div className="admin-notes">
                                            <strong>📝 Admin Notes:</strong>
                                            <p>{report.adminNotes}</p>
                                        </div>
                                    )}

                                    {report.resolvedAt && (
                                        <div className="resolved-info">
                                            <small>✓ Resolved on {new Date(report.resolvedAt).toLocaleDateString('en-IN')}</small>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
