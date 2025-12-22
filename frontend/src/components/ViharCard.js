import React, { memo } from 'react';

/**
 * Optimized Vihar Card Component
 * Memoized to prevent unnecessary re-renders
 */
const ViharCard = memo(({ vihar, onEdit, onDelete, onPreview, onAssign, t, language }) => {
  const handleEdit = () => onEdit(vihar);
  const handleDelete = () => onDelete(vihar);
  const handlePreview = () => onPreview(vihar.id);
  const handleAssign = () => onAssign(vihar.id);

  return (
    <div className="vihar-card">
      <div className="vihar-card-header">
        <h3>{t.routeNo}: {vihar.route_no}</h3>
        <div className="vihar-card-actions">
          <button onClick={handlePreview} className="btn-icon" title={t.preview}>
            👁️
          </button>
          <button onClick={handleEdit} className="btn-icon" title={t.edit}>
            ✏️
          </button>
          <button onClick={handleDelete} className="btn-icon" title={t.delete}>
            🗑️
          </button>
          <button onClick={handleAssign} className="btn-icon" title={t.assignUsers}>
            👥
          </button>
        </div>
      </div>
      <div className="vihar-card-body">
        <p><strong>{t.sahebjiName}:</strong> {vihar.sahebji_name}</p>
        <p><strong>{t.viharDate}:</strong> {vihar.vihar_date}</p>
        <p><strong>{t.viharTime}:</strong> {vihar.vihar_time}</p>
        <p><strong>{t.fromUpashray}:</strong> {vihar.from_upashray}</p>
        <p><strong>{t.toUpashray}:</strong> {vihar.to_upashray}</p>
        <p><strong>{t.approxKms}:</strong> {vihar.approx_kms}</p>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.vihar.id === nextProps.vihar.id &&
    prevProps.vihar.route_no === nextProps.vihar.route_no &&
    prevProps.vihar.sahebji_name === nextProps.vihar.sahebji_name &&
    prevProps.vihar.vihar_date === nextProps.vihar.vihar_date &&
    prevProps.language === nextProps.language
  );
});

ViharCard.displayName = 'ViharCard';

export default ViharCard;

