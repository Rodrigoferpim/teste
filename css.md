.filter-container {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: end;
}

.filter-field {
    flex: 1;
    min-width: 200px;
}

.filter-field label {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
    display: block;
}

.filter-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.clear-filters-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.clear-filters-btn:hover {
    background: #5a6268;
}

.apply-filters-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.apply-filters-btn:hover {
    background: #0056b3;
}

/* Responsive design */
@media (max-width: 768px) {
    .filter-row {
        flex-direction: column;
    }
    
    .filter-field {
        min-width: 100%;
    }
    
    .filter-actions {
        flex-direction: column;
    }
    
    .clear-filters-btn,
    .apply-filters-btn {
        width: 100%;
    }
}

/* Lightning Design System overrides for better styling */
.slds-form-element__label {
    font-weight: 600 !important;
    color: #333 !important;
}

.slds-input,
.slds-combobox__input {
    border-radius: 4px !important;
    border: 1px solid #d1d5db !important;
    transition: border-color 0.2s, box-shadow 0.2s !important;
}

.slds-input:focus,
.slds-combobox__input:focus {
    border-color: #007bff !important;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
}

.slds-card {
    border-radius: 8px !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
}

