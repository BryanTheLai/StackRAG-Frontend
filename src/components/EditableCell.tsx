import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Edit2 } from 'lucide-react';

interface EditableCellProps {
  value: string | number | null;
  onSave: (newValue: string | number | null) => Promise<void>;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  className?: string;
  validate?: (value: string | number | null) => boolean;
  emptyText?: string;
}

/**
 * EditableCell - Inline editable table cell component
 * Follows Stripe's design patterns for dashboard editing
 */
export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder = 'Click to edit',
  className = '',
  validate,
  emptyText = 'Not set',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string | number | null>(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    // Validation
    if (validate && !validate(tempValue)) {
      setError('Invalid value');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(tempValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = value ?? emptyText;

  if (!isEditing) {
    return (
      <div
        className={`group relative flex items-center gap-2 px-2 py-1 rounded hover:bg-base-200 cursor-pointer ${className}`}
        onClick={handleEdit}
      >
        <span className={value ? 'text-base-content' : 'text-base-content/50'}>
          {displayValue}
        </span>
        <Edit2
          size={14}
          className="opacity-0 group-hover:opacity-50 transition-opacity text-base-content/50"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={tempValue ?? ''}
          onChange={(e) => setTempValue(e.target.value || null)}
          onKeyDown={handleKeyDown}
          className="select select-sm select-bordered flex-1 min-w-0"
          disabled={isSaving}
        >
          <option value="">Not set</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={tempValue ?? ''}
          onChange={(e) => {
            const val = type === 'number' ? (e.target.value ? Number(e.target.value) : null) : e.target.value || null;
            setTempValue(val);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input input-sm input-bordered flex-1 min-w-0"
          disabled={isSaving}
        />
      )}
      
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-xs btn-success"
          title="Save"
        >
          {isSaving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Check size={14} />
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="btn btn-xs btn-ghost"
          title="Cancel"
        >
          <X size={14} />
        </button>
      </div>
      
      {error && (
        <div className="absolute -bottom-6 left-0 text-xs text-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default EditableCell;
