import { LightningElement, api, track } from 'lwc';

export default class DynamicFilters extends LightningElement {
    @api 
    get filters() {
        return this._filters || [];
    }
    
    set filters(value) {
        this._filters = value;
        this.processFilters();
    }
    
    @track _filters = [];
    @track processedFilters = [];
    @track filterValues = {};

    connectedCallback() {
        this.processFilters();
    }

    processFilters() {
        if (!this._filters || this._filters.length === 0) return;
        
        this.processedFilters = this._filters.map(filter => {
            const processedFilter = {
                ...filter,
                isString: filter.type === 'string',
                isNumber: filter.type === 'number',
                isOptions: filter.type === 'options',
                placeholder: filter.placeholder || this.getDefaultPlaceholder(filter),
                required: filter.required || false,
                value: this.filterValues[filter.fieldName] || this.getDefaultValue(filter)
            };
            
            // Initialize filter values
            if (!this.filterValues[filter.fieldName]) {
                this.filterValues[filter.fieldName] = this.getDefaultValue(filter);
            }
            
            return processedFilter;
        });
    }

    getDefaultPlaceholder(filter) {
        switch (filter.type) {
            case 'string':
                return `Digite ${filter.label.toLowerCase()}...`;
            case 'number':
                return `Informe ${filter.label.toLowerCase()}...`;
            case 'options':
                return `Selecione ${filter.label.toLowerCase()}...`;
            default:
                return '';
        }
    }

    getDefaultValue(filter) {
        switch (filter.type) {
            case 'string':
            case 'number':
                return '';
            case 'options':
                return filter.defaultValue || '';
            default:
                return '';
        }
    }

    get filters() {
        return this.processedFilters;
    }

    handleInputChange(event) {
        const fieldName = event.target.dataset.field;
        const value = event.detail.value;
        
        this.filterValues[fieldName] = value;
        
        // Update the processed filter value for reactive display
        this.processedFilters = this.processedFilters.map(filter => {
            if (filter.fieldName === fieldName) {
                return { ...filter, value: value };
            }
            return filter;
        });
        
        // Dispatch a custom event to notify the parent component of the filter changes
        this.dispatchFilterChangeEvent();
    }

    handleClearFilters() {
        // Reset all filter values
        this.filterValues = {};
        this.processFilters();
        
        // Clear all input fields in the UI
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        inputs.forEach(input => {
            if (input.type === 'number' || input.type === 'text') {
                input.value = '';
            } else if (input.tagName.toLowerCase() === 'lightning-combobox') {
                input.value = '';
            }
        });
        
        // Dispatch clear event
        const clearEvent = new CustomEvent('filterclear', {
            detail: { message: 'Filtros limpos com sucesso' }
        });
        this.dispatchEvent(clearEvent);
    }

    handleApplyFilters() {
        // Validate required fields
        const requiredFields = this.processedFilters.filter(filter => filter.required);
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (!this.filterValues[field.fieldName] || this.filterValues[field.fieldName].trim() === '') {
                missingFields.push(field.label);
            }
        });
        
        if (missingFields.length > 0) {
            // Dispatch validation error event
            const errorEvent = new CustomEvent('filtererror', {
                detail: { 
                    message: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`,
                    missingFields: missingFields
                }
            });
            this.dispatchEvent(errorEvent);
            return;
        }
        
        // Dispatch apply event with all filter values
        const applyEvent = new CustomEvent('filterapply', {
            detail: {
                filters: this.filterValues,
                message: 'Filtros aplicados com sucesso'
            }
        });
        this.dispatchEvent(applyEvent);
    }

    dispatchFilterChangeEvent() {
        const filterChangeEvent = new CustomEvent('filterchange', {
            detail: {
                filters: this.filterValues,
                hasValues: Object.values(this.filterValues).some(value => value && value.toString().trim() !== '')
            }
        });
        this.dispatchEvent(filterChangeEvent);
    }

    // Public API methods for parent components
    @api
    getFilterValues() {
        return { ...this.filterValues };
    }

    @api
    setFilterValue(fieldName, value) {
        if (this.filterValues.hasOwnProperty(fieldName)) {
            this.filterValues[fieldName] = value;
            this.processFilters();
            this.dispatchFilterChangeEvent();
        }
    }

    @api
    clearAllFilters() {
        this.handleClearFilters();
    }

    @api
    validateFilters() {
        const requiredFields = this.processedFilters.filter(filter => filter.required);
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (!this.filterValues[field.fieldName] || this.filterValues[field.fieldName].trim() === '') {
                missingFields.push(field.label);
            }
        });
        
        return {
            isValid: missingFields.length === 0,
            missingFields: missingFields
        };
    }
}

