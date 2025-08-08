import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ModernListView extends LightningElement {
    // Public properties
    @api objectApiName = 'Account'; // Default object
    @api fieldsToDisplay = 'Name,Description,Owner.Name,LastModifiedDate,Type';
    @api recordsPerPage = 10;
    @api title = 'Modern Data List';
    @api iconName = 'standard:list';

    // Private tracked properties
    @track data = [];
    @track filteredData = [];
    @track searchTerm = '';
    @track sortBy = 'Name';
    @track sortDirection = 'asc';
    @track isLoading = false;
    @track currentPage = 1;
    @track totalRecords = 0;

    // Computed properties
    get hasData() {
        return this.filteredData && this.filteredData.length > 0;
    }

    get showPagination() {
        return this.totalRecords > this.recordsPerPage;
    }

    get startRecord() {
        return (this.currentPage - 1) * this.recordsPerPage + 1;
    }

    get endRecord() {
        const end = this.currentPage * this.recordsPerPage;
        return end > this.totalRecords ? this.totalRecords : end;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage >= Math.ceil(this.totalRecords / this.recordsPerPage);
    }

    get sortOptions() {
        return [
            { label: 'Name', value: 'Name' },
            { label: 'Last Modified', value: 'LastModified' },
            { label: 'Owner', value: 'Owner' },
            { label: 'Status', value: 'Status' }
        ];
    }

    // Lifecycle hooks
    connectedCallback() {
        this.loadData();
    }

    // Data loading methods
    loadData() {
        this.isLoading = true;
        
        // Simulate API call with sample data
        setTimeout(() => {
            this.data = this.generateSampleData();
            this.totalRecords = this.data.length;
            this.applyFiltersAndSort();
            this.isLoading = false;
        }, 1000);
    }

    generateSampleData() {
        const statuses = ['Active', 'Inactive', 'Pending', 'Closed'];
        const statusClasses = ['slds-theme_success', 'slds-theme_error', 'slds-theme_warning', 'slds-theme_info'];
        const owners = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
        
        const sampleData = [];
        for (let i = 1; i <= 50; i++) {
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const ownerIndex = Math.floor(Math.random() * owners.length);
            const lastModified = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            sampleData.push({
                Id: `record_${i}`,
                Name: `Record ${i}`,
                Description: `This is a sample description for record ${i}. It contains detailed information about the record.`,
                SubDescription: i % 3 === 0 ? `Additional details for record ${i}` : null,
                Status: statuses[statusIndex],
                StatusClass: statusClasses[statusIndex],
                Owner: owners[ownerIndex],
                LastModified: this.formatDate(lastModified),
                AvatarUrl: null, // Will use fallback icon
                Type: i % 2 === 0 ? 'Customer' : 'Prospect'
            });
        }
        
        return sampleData;
    }

    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Filter and sort methods
    applyFiltersAndSort() {
        let filtered = [...this.data];

        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(record => 
                record.Name.toLowerCase().includes(searchLower) ||
                record.Description.toLowerCase().includes(searchLower) ||
                (record.Owner && record.Owner.toLowerCase().includes(searchLower)) ||
                (record.Status && record.Status.toLowerCase().includes(searchLower))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[this.sortBy] || '';
            let bValue = b[this.sortBy] || '';
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        this.totalRecords = filtered.length;
        
        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.recordsPerPage;
        const endIndex = startIndex + this.recordsPerPage;
        this.filteredData = filtered.slice(startIndex, endIndex);
    }

    // Event handlers
    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.currentPage = 1; // Reset to first page
        this.applyFiltersAndSort();
    }

    handleSortChange(event) {
        this.sortBy = event.detail.value;
        this.applyFiltersAndSort();
    }

    handleRefresh() {
        this.loadData();
        this.showToast('Success', 'Data refreshed successfully', 'success');
    }

    handleNew() {
        this.showToast('Info', 'New record creation would be implemented here', 'info');
        // In a real implementation, this would open a modal or navigate to a new record page
    }

    handleItemClick(event) {
        event.preventDefault();
        const recordId = event.currentTarget.dataset.id || event.target.dataset.id;
        if (recordId) {
            this.showToast('Info', `Clicked on record: ${recordId}`, 'info');
            // In a real implementation, this would navigate to the record detail page
        }
    }

    handleMenuSelect(event) {
        const selectedAction = event.detail.value;
        const recordId = event.currentTarget.dataset.id;
        
        switch (selectedAction) {
            case 'edit':
                this.showToast('Info', `Edit record: ${recordId}`, 'info');
                break;
            case 'delete':
                this.handleDelete(recordId);
                break;
            case 'clone':
                this.showToast('Info', `Clone record: ${recordId}`, 'info');
                break;
        }
    }

    handleDelete(recordId) {
        // Show confirmation dialog (in real implementation)
        this.showToast('Warning', `Delete functionality would be implemented for record: ${recordId}`, 'warning');
        
        // In a real implementation, you would:
        // 1. Show a confirmation modal
        // 2. Call Apex method to delete the record
        // 3. Refresh the data
        // 4. Show success/error message
    }

    handlePrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.applyFiltersAndSort();
        }
    }

    handleNext() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.applyFiltersAndSort();
        }
    }

    // Utility methods
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Public methods for external interaction
    @api
    refreshData() {
        this.loadData();
    }

    @api
    getSelectedRecords() {
        // This could be extended to support record selection
        return [];
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.currentPage = 1;
        this.applyFiltersAndSort();
    }
}

