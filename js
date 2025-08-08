import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Teste extends LightningElement {
    // Public properties
    @api objectApiName = 'Account'; // Default object
    @api fieldsToDisplay = 'Name,Description,Owner.Name,LastModifiedDate,Type';
    @api recordsPerPage = 10;
    @api title = 'Modern Data List';
    @api iconName = 'standard:list';

    // Private tracked properties
    @track allData = []; // All available data
    @track filteredData = []; // Filtered data based on search/list view
    @track displayedData = []; // Currently displayed data (for infinite scroll)
    @track searchTerm = '';
    @track selectedListView = 'all';
    @track isLoading = false;
    @track isLoadingMore = false;
    @track totalRecords = 0;
    @track displayedRecords = 0;
    @track hasMoreRecords = false;

    // Advanced Filters properties
    @track showAdvancedFilters = false;
    @track selectedStatusFilters = [];
    @track selectedTypeFilters = [];
    @track selectedOwnerFilters = [];
    @track modifiedFromDate = '';
    @track modifiedToDate = '';
    @track ownerSearchTerm = '';
    @track showOwnerOptions = false;

    // Infinite scroll properties
    scrollThreshold = 100; // Pixels from bottom to trigger load
    isScrollListenerAdded = false;

    // Computed properties
    get hasData() {
        return this.displayedData && this.displayedData.length > 0;
    }

    get cardTitle() {
        return this.title || 'Modern Data List';
    }

    get cardIcon() {
        return this.iconName || 'standard:list';
    }

    get listViewOptions() {
        const baseOptions = [
            { label: `All ${this.objectApiName}s`, value: 'all' },
            { label: 'Recently Viewed', value: 'recent' },
            { label: 'My Records', value: 'mine' }
        ];

        // Add object-specific list views
        if (this.objectApiName === 'Account') {
            return [
                ...baseOptions,
                { label: 'Active Accounts', value: 'active' },
                { label: 'Customer Accounts', value: 'customers' },
                { label: 'Prospect Accounts', value: 'prospects' }
            ];
        } else if (this.objectApiName === 'Contact') {
            return [
                ...baseOptions,
                { label: 'Active Contacts', value: 'active' },
                { label: 'My Team Contacts', value: 'team' }
            ];
        } else if (this.objectApiName === 'Opportunity') {
            return [
                ...baseOptions,
                { label: 'Open Opportunities', value: 'open' },
                { label: 'Closing This Month', value: 'closing' },
                { label: 'Won Opportunities', value: 'won' }
            ];
        } else if (this.objectApiName === 'Case') {
            return [
                ...baseOptions,
                { label: 'Open Cases', value: 'open' },
                { label: 'High Priority Cases', value: 'high_priority' },
                { label: 'My Cases', value: 'mine' }
            ];
        } else if (this.objectApiName === 'Lead') {
            return [
                ...baseOptions,
                { label: 'Open Leads', value: 'open' },
                { label: 'Qualified Leads', value: 'qualified' },
                { label: 'Unqualified Leads', value: 'unqualified' }
            ];
        }

        return baseOptions;
    }

    get statusFilterOptions() {
        const allStatuses = new Set();
        this.allData.forEach(record => {
            if (record.Status) {
                allStatuses.add(record.Status);
            }
        });
        
        return Array.from(allStatuses).map(status => ({
            label: status,
            value: status
        }));
    }

    get typeFilterOptions() {
        const allTypes = new Set();
        this.allData.forEach(record => {
            if (record.Type) {
                allTypes.add(record.Type);
            }
        });
        
        return Array.from(allTypes).map(type => ({
            label: type,
            value: type
        }));
    }

    get ownerFilterOptions() {
        const allOwners = new Set();
        this.allData.forEach(record => {
            if (record.Owner) {
                allOwners.add(record.Owner);
            }
        });
        
        return Array.from(allOwners).map(owner => ({
            label: owner,
            value: owner
        }));
    }

    get filteredOwnerOptions() {
        if (!this.ownerSearchTerm) {
            return this.ownerFilterOptions.map(owner => ({
                ...owner,
                selected: this.selectedOwnerFilters.includes(owner.value) ? 'slds-show' : 'slds-hide'
            }));
        }
        
        const searchLower = this.ownerSearchTerm.toLowerCase();
        return this.ownerFilterOptions
            .filter(owner => owner.label.toLowerCase().includes(searchLower))
            .map(owner => ({
                ...owner,
                selected: this.selectedOwnerFilters.includes(owner.value) ? 'slds-show' : 'slds-hide'
            }));
    }

    get showTypeFilter() {
        return this.objectApiName === 'Account' || this.objectApiName === 'Contact' || this.objectApiName === 'Lead';
    }

    // Lifecycle hooks
    connectedCallback() {
        this.loadData();
    }

    renderedCallback() {
        if (!this.isScrollListenerAdded) {
            this.addScrollListener();
            this.isScrollListenerAdded = true;
        }
    }

    disconnectedCallback() {
        this.removeScrollListener();
    }

    // Scroll handling methods
    addScrollListener() {
        // Use a more reliable approach for scroll detection
        this.boundScrollHandler = this.handleScroll.bind(this);
        this.boundWindowScrollHandler = this.handleWindowScroll.bind(this);
        
        // Add scroll listener to the container
        setTimeout(() => {
            const container = this.template.querySelector('.modern-list-container');
            if (container) {
                container.addEventListener('scroll', this.boundScrollHandler, { passive: true });
            }
        }, 100);
        
        // Also listen to window scroll for cases where the component fills the viewport
        window.addEventListener('scroll', this.boundWindowScrollHandler, { passive: true });
    }

    removeScrollListener() {
        const container = this.template.querySelector('.modern-list-container');
        if (container && this.boundScrollHandler) {
            container.removeEventListener('scroll', this.boundScrollHandler);
        }
        if (this.boundWindowScrollHandler) {
            window.removeEventListener('scroll', this.boundWindowScrollHandler);
        }
    }

    handleScroll(event) {
        if (this.isLoadingMore || !this.hasMoreRecords || this.isLoading) {
            return;
        }

        const container = event.target;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // Check if we're near the bottom (within threshold)
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        if (distanceFromBottom <= this.scrollThreshold) {
            this.loadMoreRecords();
        }
    }

    handleWindowScroll() {
        if (this.isLoadingMore || !this.hasMoreRecords || this.isLoading) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        if (distanceFromBottom <= this.scrollThreshold) {
            this.loadMoreRecords();
        }
    }

    // Data loading methods
    loadData() {
        this.isLoading = true;
        
        // Simulate API call with sample data
        setTimeout(() => {
            this.allData = this.generateSampleData();
            this.applyFiltersAndSort();
            this.isLoading = false;
        }, 1000);
    }

    loadMoreRecords() {
        if (this.isLoadingMore || !this.hasMoreRecords || this.isLoading) {
            return;
        }

        this.isLoadingMore = true;

        // Simulate API call delay
        setTimeout(() => {
            const currentLength = this.displayedData.length;
            const nextBatch = this.filteredData.slice(currentLength, currentLength + this.recordsPerPage);
            
            if (nextBatch.length > 0) {
                this.displayedData = [...this.displayedData, ...nextBatch];
                this.displayedRecords = this.displayedData.length;
                this.hasMoreRecords = this.displayedData.length < this.filteredData.length;
            }

            this.isLoadingMore = false;
        }, 500);
    }

    generateSampleData() {
        // Mock data based on different object types
        const mockDataSets = {
            'Account': this.generateAccountData(),
            'Contact': this.generateContactData(),
            'Opportunity': this.generateOpportunityData(),
            'Case': this.generateCaseData(),
            'Lead': this.generateLeadData()
        };

        // Return data based on objectApiName or default to Account
        return mockDataSets[this.objectApiName] || mockDataSets['Account'];
    }

    generateAccountData() {
        const companies = [
            'Acme Corporation', 'Global Industries', 'Tech Solutions Inc', 'Innovative Systems',
            'Future Enterprises', 'Dynamic Solutions', 'Premier Services', 'Advanced Technologies',
            'Strategic Partners', 'Excellence Group', 'Visionary Corp', 'Progressive Solutions',
            'Elite Services', 'Pinnacle Systems', 'Optimal Solutions', 'Superior Technologies',
            'NextGen Corp', 'Digital Dynamics', 'Smart Systems', 'Innovation Labs',
            'TechForward Inc', 'Global Connect', 'Future Vision', 'Elite Technologies',
            'Premier Solutions', 'Advanced Systems', 'Strategic Tech', 'Excellence Corp',
            'Visionary Systems', 'Progressive Tech', 'Optimal Corp', 'Superior Solutions'
        ];
        
        const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education'];
        const types = ['Customer', 'Prospect', 'Partner', 'Competitor'];
        const statuses = ['Active', 'Inactive', 'Pending Review', 'Closed'];
        const statusClasses = ['slds-theme_success', 'slds-theme_error', 'slds-theme_warning', 'slds-theme_info'];
        const owners = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Pereira', 'Fernanda Costa'];

        const sampleData = [];
        for (let i = 0; i < companies.length; i++) {
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const ownerIndex = Math.floor(Math.random() * owners.length);
            const industryIndex = Math.floor(Math.random() * industries.length);
            const typeIndex = Math.floor(Math.random() * types.length);
            const lastModified = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
            
            sampleData.push({
                Id: `001${String(i).padStart(15, '0')}`,
                Name: companies[i],
                Description: `${industries[industryIndex]} company specializing in innovative solutions and services.`,
                SubDescription: `Annual Revenue: $${(Math.random() * 10 + 1).toFixed(1)}M | Employees: ${Math.floor(Math.random() * 1000 + 50)}`,
                Status: statuses[statusIndex],
                StatusClass: statusClasses[statusIndex],
                Owner: owners[ownerIndex],
                LastModified: this.formatDate(lastModified),
                AvatarUrl: null,
                Type: types[typeIndex],
                Industry: industries[industryIndex],
                Address: `${Math.floor(Math.random() * 1000)} Main St, City, State ${Math.floor(Math.random() * 90000) + 10000}`,
                Email: `${companies[i].toLowerCase().replace(/ /g, '')}@example.com`,
                Phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                Website: `https://www.${companies[i].toLowerCase().replace(/ /g, '')}.com`
            });
        }
        
        return sampleData;
    }

    generateContactData() {
        const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Pedro', 'Juliana', 'Ricardo', 'Camila', 'Bruno'];
        const lastNames = ['Silva', 'Santos', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo'];
        const titles = ['CEO', 'CTO', 'Manager', 'Director', 'Analyst', 'Coordinator', 'Specialist', 'Consultant'];
        const departments = ['Sales', 'Marketing', 'IT', 'Finance', 'Operations', 'HR'];
        const statuses = ['Active', 'Inactive', 'Prospect', 'Customer'];
        const statusClasses = ['slds-theme_success', 'slds-theme_error', 'slds-theme_warning', 'slds-theme_info'];

        const sampleData = [];
        for (let i = 0; i < 50; i++) { // Increased for better infinite scroll demo
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const department = departments[Math.floor(Math.random() * departments.length)];
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const lastModified = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
            
            sampleData.push({
                Id: `003${String(i).padStart(15, '0')}`,
                Name: `${firstName} ${lastName}`,
                Description: `${title} - ${department}`,
                SubDescription: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com | +55 11 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
                Status: statuses[statusIndex],
                StatusClass: statusClasses[statusIndex],
                Owner: `${firstName} ${lastName}`,
                LastModified: this.formatDate(lastModified),
                AvatarUrl: null,
                Type: 'Contact',
                Title: title,
                Email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                Phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                Address: `${Math.floor(Math.random() * 1000)} Oak Ave, Town, State ${Math.floor(Math.random() * 90000) + 10000}`
            });
        }
        
        return sampleData;
    }

    generateOpportunityData() {
        const opportunityNames = [
            'Sistema de CRM Empresarial', 'Implementação ERP', 'Consultoria Digital', 'Plataforma E-commerce',
            'Solução de BI', 'Migração para Cloud', 'Automação de Processos', 'Sistema de Gestão',
            'Aplicativo Mobile', 'Integração de Sistemas', 'Modernização IT', 'Projeto de Analytics',
            'Transformação Digital', 'Plataforma IoT', 'Sistema de Vendas', 'Portal do Cliente',
            'Dashboard Executivo', 'Integração API', 'Sistema de Estoque', 'Plataforma de Dados'
        ];
        
        const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
        const statusClasses = ['slds-theme_info', 'slds-theme_warning', 'slds-theme_warning', 'slds-theme_warning', 'slds-theme_success', 'slds-theme_error'];
        const owners = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Pereira', 'Fernanda Costa'];

        const sampleData = [];
        for (let i = 0; i < opportunityNames.length; i++) {
            const stageIndex = Math.floor(Math.random() * stages.length);
            const ownerIndex = Math.floor(Math.random() * owners.length);
            const amount = Math.floor(Math.random() * 500000 + 10000);
            const probability = stages[stageIndex] === 'Closed Won' ? 100 : 
                              stages[stageIndex] === 'Closed Lost' ? 0 : 
                              Math.floor(Math.random() * 80 + 10);
            const lastModified = new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000);
            
            sampleData.push({
                Id: `006${String(i).padStart(15, '0')}`,
                Name: opportunityNames[i],
                Description: `Valor: R$ ${amount.toLocaleString('pt-BR')} | Probabilidade: ${probability}%`,
                SubDescription: `Fechamento previsto: ${this.formatDate(new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000))}`,
                Status: stages[stageIndex],
                StatusClass: statusClasses[stageIndex],
                Owner: owners[ownerIndex],
                LastModified: this.formatDate(lastModified),
                AvatarUrl: null,
                Type: 'Opportunity',
                Amount: amount
            });
        }
        
        return sampleData;
    }

    generateCaseData() {
        const subjects = [
            'Sistema não carrega dados', 'Erro de login recorrente', 'Performance lenta na aplicação',
            'Falha na integração', 'Problema de sincronização', 'Bug no relatório mensal',
            'Usuário sem acesso', 'Erro 500 no servidor', 'Dados inconsistentes',
            'Falha no backup automático', 'Interface não responsiva', 'Timeout na API',
            'Erro de validação', 'Problema de conectividade', 'Falha no deploy',
            'Bug na interface', 'Erro de permissão', 'Problema de performance'
        ];
        
        const priorities = ['High', 'Medium', 'Low', 'Critical'];
        const statuses = ['New', 'In Progress', 'Pending', 'Resolved', 'Closed'];
        const statusClasses = ['slds-theme_info', 'slds-theme_warning', 'slds-theme_warning', 'slds-theme_success', 'slds-theme_success'];
        const owners = ['Suporte Técnico', 'Equipe de TI', 'Desenvolvimento', 'Infraestrutura', 'Segurança'];

        const sampleData = [];
        for (let i = 0; i < subjects.length; i++) {
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const priorityIndex = Math.floor(Math.random() * priorities.length);
            const ownerIndex = Math.floor(Math.random() * owners.length);
            const caseNumber = `CASE-${String(i + 1000).padStart(6, '0')}`;
            const lastModified = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            sampleData.push({
                Id: `500${String(i).padStart(15, '0')}`,
                Name: `${caseNumber}: ${subjects[i]}`,
                Description: `Prioridade: ${priorities[priorityIndex]} | Tempo de resolução: ${Math.floor(Math.random() * 48 + 1)}h`,
                SubDescription: `SLA: ${Math.floor(Math.random() * 72 + 24)}h`,
                Status: statuses[statusIndex],
                StatusClass: statusClasses[statusIndex],
                Owner: owners[ownerIndex],
                LastModified: this.formatDate(lastModified),
                AvatarUrl: null,
                Type: 'Case',
                Priority: priorities[priorityIndex]
            });
        }
        
        return sampleData;
    }

    generateLeadData() {
        const companies = [
            'StartupTech', 'InnovaCorp', 'TechStart', 'DigitalPro', 'CloudFirst',
            'DataDriven', 'SmartSolutions', 'NextGen', 'FutureTech', 'AgileWorks',
            'TechVision', 'DigitalEdge', 'CloudTech', 'DataSmart', 'InnovateLab',
            'TechPioneer', 'DigitalFlow', 'CloudSync', 'DataCore', 'SmartEdge'
        ];
        
        const sources = ['Website', 'LinkedIn', 'Trade Show', 'Referral', 'Cold Call', 'Email Campaign'];
        const statuses = ['New', 'Qualified', 'Nurturing', 'Converted', 'Unqualified'];
        const statusClasses = ['slds-theme_info', 'slds-theme_success', 'slds-theme_warning', 'slds-theme_success', 'slds-theme_error'];
        const owners = ['Vendas SP', 'Vendas RJ', 'Vendas BH', 'Vendas RS', 'Vendas PR'];

        const sampleData = [];
        for (let i = 0; i < companies.length; i++) {
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const sourceIndex = Math.floor(Math.random() * sources.length);
            const ownerIndex = Math.floor(Math.random() * owners.length);
            const score = Math.floor(Math.random() * 100);
            const lastModified = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000);
            
            sampleData.push({
                Id: `00Q${String(i).padStart(15, '0')}`,
                Name: `Lead - ${companies[i]}`,
                Description: `Fonte: ${sources[sourceIndex]} | Score: ${score}/100`,
                SubDescription: `Interesse em: Soluções de automação e integração de sistemas`,
                Status: statuses[statusIndex],
                StatusClass: statusClasses[statusIndex],
                Owner: owners[ownerIndex],
                LastModified: this.formatDate(lastModified),
                AvatarUrl: null,
                Type: 'Lead',
                Source: sources[sourceIndex]
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
        let filtered = [...this.allData];

        // Apply list view filter
        filtered = this.applyListViewFilter(filtered);

        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(record => 
                record.Name.toLowerCase().includes(searchLower) ||
                record.Description.toLowerCase().includes(searchLower) ||
                (record.Owner && record.Owner.toLowerCase().includes(searchLower)) ||
                (record.Status && record.Status.toLowerCase().includes(searchLower)) ||
                (record.Address && record.Address.toLowerCase().includes(searchLower)) ||
                (record.Email && record.Email.toLowerCase().includes(searchLower)) ||
                (record.Phone && record.Phone.toLowerCase().includes(searchLower)) ||
                (record.Website && record.Website.toLowerCase().includes(searchLower))
            );
        }

        // Apply advanced filters
        filtered = this.applyAdvancedFilters(filtered);

        this.filteredData = filtered;
        this.totalRecords = filtered.length;
        
        // Reset displayed data for infinite scroll
        const initialBatch = filtered.slice(0, this.recordsPerPage);
        this.displayedData = initialBatch;
        this.displayedRecords = initialBatch.length;
        this.hasMoreRecords = this.displayedData.length < this.filteredData.length;
    }

    applyAdvancedFilters(data) {
        let filtered = data;

        // Status filter
        if (this.selectedStatusFilters.length > 0) {
            filtered = filtered.filter(record => 
                this.selectedStatusFilters.includes(record.Status)
            );
        }

        // Type filter
        if (this.selectedTypeFilters.length > 0) {
            filtered = filtered.filter(record => 
                this.selectedTypeFilters.includes(record.Type)
            );
        }

        // Owner filter
        if (this.selectedOwnerFilters.length > 0) {
            filtered = filtered.filter(record => 
                this.selectedOwnerFilters.includes(record.Owner)
            );
        }

        // Date range filter
        if (this.modifiedFromDate || this.modifiedToDate) {
            filtered = filtered.filter(record => {
                const recordDate = new Date(record.LastModified);
                let includeRecord = true;

                if (this.modifiedFromDate) {
                    const fromDate = new Date(this.modifiedFromDate);
                    includeRecord = includeRecord && recordDate >= fromDate;
                }

                if (this.modifiedToDate) {
                    const toDate = new Date(this.modifiedToDate);
                    toDate.setHours(23, 59, 59, 999); // End of day
                    includeRecord = includeRecord && recordDate <= toDate;
                }

                return includeRecord;
            });
        }

        return filtered;
    }

    applyListViewFilter(data) {
        switch (this.selectedListView) {
            case 'all':
                return data;
            case 'recent':
                // Show records modified in last 7 days
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return data.filter(record => new Date(record.LastModified) > sevenDaysAgo);
            case 'mine':
                // Show records owned by current user (simulated)
                return data.filter(record => record.Owner && record.Owner.includes('Ana Silva'));
            case 'active':
                return data.filter(record => record.Status === 'Active');
            case 'customers':
                return data.filter(record => record.Type === 'Customer');
            case 'prospects':
                return data.filter(record => record.Type === 'Prospect');
            case 'open':
                return data.filter(record => 
                    record.Status && !['Closed', 'Closed Won', 'Closed Lost', 'Resolved'].includes(record.Status)
                );
            case 'closing':
                // For opportunities closing this month
                const thisMonth = new Date().getMonth();
                return data.filter(record => {
                    if (record.SubDescription && record.SubDescription.includes('Fechamento previsto:')) {
                        const dateStr = record.SubDescription.split('Fechamento previsto: ')[1];
                        const closeDate = new Date(dateStr);
                        return closeDate.getMonth() === thisMonth;
                    }
                    return false;
                });
            case 'won':
                return data.filter(record => record.Status === 'Closed Won');
            case 'high_priority':
                return data.filter(record => record.Priority === 'High' || record.Priority === 'Critical');
            case 'qualified':
                return data.filter(record => record.Status === 'Qualified');
            case 'unqualified':
                return data.filter(record => record.Status === 'Unqualified');
            default:
                return data;
        }
    }

    // Event handlers
    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.applyFiltersAndSort();
    }

    handleListViewChange(event) {
        this.selectedListView = event.detail.value;
        this.applyFiltersAndSort();
    }

    handleFilterClick() {
        this.showAdvancedFilters = true;
    }

    handleAdvancedFiltersClick() {
        this.showAdvancedFilters = true;
    }

    handleCloseAdvancedFilters() {
        this.showAdvancedFilters = false;
        this.showOwnerOptions = false;
    }

    handleStatusFilterChange(event) {
        this.selectedStatusFilters = event.detail.value;
    }

    handleTypeFilterChange(event) {
        this.selectedTypeFilters = event.detail.value;
    }

    handleOwnerSearch(event) {
        this.ownerSearchTerm = event.target.value;
        this.showOwnerOptions = this.ownerSearchTerm.length > 0;
    }

    handleOwnerSelect(event) {
        const selectedOwner = event.target.dataset.value;
        if (selectedOwner) {
            if (this.selectedOwnerFilters.includes(selectedOwner)) {
                // Remove if already selected
                this.selectedOwnerFilters = this.selectedOwnerFilters.filter(owner => owner !== selectedOwner);
            } else {
                // Add if not selected
                this.selectedOwnerFilters = [...this.selectedOwnerFilters, selectedOwner];
            }
        }
    }

    handleModifiedFromChange(event) {
        this.modifiedFromDate = event.target.value;
    }

    handleModifiedToChange(event) {
        this.modifiedToDate = event.target.value;
    }

    handleApplyFilters() {
        this.showAdvancedFilters = false;
        this.showOwnerOptions = false;
        this.applyFiltersAndSort();
        this.showToast('Success', 'Filters applied successfully', 'success');
    }

    handleClearAllFilters() {
        this.selectedStatusFilters = [];
        this.selectedTypeFilters = [];
        this.selectedOwnerFilters = [];
        this.modifiedFromDate = '';
        this.modifiedToDate = '';
        this.ownerSearchTerm = '';
        this.searchTerm = '';
        this.selectedListView = 'all';
        this.showOwnerOptions = false;
        this.applyFiltersAndSort();
        this.showToast('Success', 'All filters cleared', 'success');
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
        this.applyFiltersAndSort();
    }
}


