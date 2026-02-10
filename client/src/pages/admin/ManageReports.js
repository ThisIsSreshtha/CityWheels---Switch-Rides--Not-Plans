import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminSidebar } from './Home';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import './AdminPanel.css';

const ManageReports = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filter, setFilter] = useState({ status: 'all', reportType: 'all' });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('adminSidebarCollapsed') === 'true';
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filter, reports]);

    const fetchReports = async () => {
        try {
            const res = await axios.get('/api/admin/owner-reports');
            setReports(res.data.data);
            setFilteredReports(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Error fetching reports');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];

        if (filter.status !== 'all') {
            filtered = filtered.filter(r => r.status === filter.status);
        }

        if (filter.reportType !== 'all') {
            filtered = filtered.filter(r => r.reportType === filter.reportType);
        }

        setFilteredReports(filtered);
    };

    const handleUpdateReport = async (reportId, updates) => {
        setUpdating(true);
        try {
            const res = await axios.patch(`/api/admin/owner-reports/${reportId}`, updates);

            // Update reports list
            setReports(reports.map(r => r._id === reportId ? res.data.data : r));

            // Update selected report if it's the one being updated
            if (selectedReport && selectedReport._id === reportId) {
                setSelectedReport(res.data.data);
            }

            toast.success('Report updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating report');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const toggleSidebar = () => {
        const next = !sidebarCollapsed;
        setSidebarCollapsed(next);
        localStorage.setItem('adminSidebarCollapsed', String(next));
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'admin-status-badge pending';
            case 'reviewing': return 'admin-status-badge active';
            case 'resolved': return 'admin-status-badge verified';
            case 'closed': return 'admin-status-badge none';
            default: return 'admin-status-badge';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#dc2626';
            case 'medium': return '#f59e0b';
            case 'low': return '#6366f1';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
                <div className="admin-content">
                    <div className="admin-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    const statusCounts = {
        all: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        reviewing: reports.filter(r => r.status === 'reviewing').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        closed: reports.filter(r => r.status === 'closed').length
    };

    return (
        <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div className="admin-content">
                <div className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">📢 Manage Reports</h1>
                        <p className="admin-page-subtitle">Review and manage owner reports</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="admin-filter-tabs">
                    <button
                        className={`admin-filter-tab ${filter.status === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, status: 'all' })}
                    >
                        All ({statusCounts.all})
                    </button>
                    <button
                        className={`admin-filter-tab ${filter.status === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, status: 'pending' })}
                    >
                        Pending ({statusCounts.pending})
                    </button>
                    <button
                        className={`admin-filter-tab ${filter.status === 'reviewing' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, status: 'reviewing' })}
                    >
                        Reviewing ({statusCounts.reviewing})
                    </button>
                    <button
                        className={`admin-filter-tab ${filter.status === 'resolved' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, status: 'resolved' })}
                    >
                        Resolved ({statusCounts.resolved})
                    </button>
                    <button
                        className={`admin-filter-tab ${filter.status === 'closed' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, status: 'closed' })}
                    >
                        Closed ({statusCounts.closed})
                    </button>
                </div>

                {/* Report Type Filter */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 600, marginRight: '10px', fontSize: '14px' }}>Type:</label>
                    <select
                        value={filter.reportType}
                        onChange={(e) => setFilter({ ...filter, reportType: e.target.value })}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e8dfc4',
                            fontSize: '13px',
                            background: '#faf4e4'
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="vehicle_issue">Vehicle Issue</option>
                        <option value="customer_misbehavior">Customer Misbehavior</option>
                    </select>
                </div>

                {/* Reports Table */}
                <div className="admin-card">
                    {filteredReports.length === 0 ? (
                        <div className="admin-empty-state">
                            <div className="admin-empty-icon">📢</div>
                            <h3>No reports found</h3>
                            <p>No reports match your current filters</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Owner</th>
                                    <th>Type</th>
                                    <th>Subject</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map(report => (
                                    <tr key={report._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{report.owner?.name || 'N/A'}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{report.owner?.email}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '12px' }}>
                                                {report.reportType === 'vehicle_issue' ? '🚗 Vehicle' : '⚠️ Customer'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {report.subject}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                background: `${getPriorityColor(report.priority)}20`,
                                                color: getPriorityColor(report.priority)
                                            }}>
                                                {report.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(report.status)}>
                                                {report.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px' }}>
                                            {new Date(report.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <button
                                                className="admin-btn-outline small"
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                📝 View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Report Details Modal */}
                {selectedReport && (
                    <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 5px' }}>Report Details</h2>
                                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                                        By {selectedReport.owner?.name} • {new Date(selectedReport.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</div>
                                <div style={{ fontWeight: 600 }}>
                                    {selectedReport.reportType === 'vehicle_issue' ? '🚗 Vehicle Issue' : '⚠️ Customer Misbehavior'}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Subject</div>
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>{selectedReport.subject}</div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description</div>
                                <div style={{ padding: '12px', background: '#faf4e4', borderRadius: '6px', lineHeight: '1.6' }}>
                                    {selectedReport.description}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Status</label>
                                    <select
                                        value={selectedReport.status}
                                        onChange={(e) => handleUpdateReport(selectedReport._id, { status: e.target.value })}
                                        disabled={updating}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e8dfc4', background: '#faf4e4' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewing">Reviewing</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Priority</label>
                                    <select
                                        value={selectedReport.priority}
                                        onChange={(e) => handleUpdateReport(selectedReport._id, { priority: e.target.value })}
                                        disabled={updating}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e8dfc4', background: '#faf4e4' }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Admin Notes</label>
                                <textarea
                                    value={selectedReport.adminNotes || ''}
                                    onChange={(e) => {
                                        setSelectedReport({ ...selectedReport, adminNotes: e.target.value });
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value !== (reports.find(r => r._id === selectedReport._id)?.adminNotes || '')) {
                                            handleUpdateReport(selectedReport._id, { adminNotes: e.target.value });
                                        }
                                    }}
                                    placeholder="Add notes about this report..."
                                    rows="4"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e8dfc4', background: '#faf4e4', resize: 'vertical' }}
                                />
                            </div>

                            {selectedReport.resolvedAt && (
                                <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '6px', fontSize: '13px', color: '#166534' }}>
                                    ✓ Resolved on {new Date(selectedReport.resolvedAt).toLocaleDateString()} by {selectedReport.resolvedBy?.name || 'Admin'}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReports;
