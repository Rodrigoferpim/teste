<template>
    <lightning-card title={cardTitle} icon-name={cardIcon}>
        <div slot="actions" class="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-wrap">
            <!-- List View and Filters -->
            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                <div class="slds-grid slds-gutters slds-wrap">
                    <!-- List View Selection -->
                    <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                        <lightning-combobox
                            name="listView"
                            label="List View"
                            value={selectedListView}
                            placeholder="Select a list view"
                            options={listViewOptions}
                            onchange={handleListViewChange}>
                        </lightning-combobox>
                    </div>
                    
                    <!-- Advanced Filters Button -->
                    <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                        <lightning-button
                            label="Advanced Filters"
                            icon-name="utility:filterList"
                            onclick={handleAdvancedFiltersClick}
                            class="slds-m-top_large">
                        </lightning-button>
                    </div>
                </div>
            </div>
            
            <!-- Search and Action Buttons -->
            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-text-align_right">
                <div class="slds-grid slds-grid_align-end slds-grid_vertical-align-center">
                    <div class="slds-col">
                        <lightning-input
                            type="search"
                            placeholder="Search this list..."
                            value={searchTerm}
                            onchange={handleSearch}
                            variant="label-hidden"
                            label="Search">
                        </lightning-input>
                    </div>
                    <div class="slds-col slds-no-flex">
                        <lightning-button-icon 
                            icon-name="utility:refresh"
                            alternative-text="Refresh"
                            title="Refresh"
                            onclick={handleRefresh}
                            class="slds-m-left_x-small">
                        </lightning-button-icon>
                        <lightning-button 
                            label="New"
                            icon-name="utility:add"
                            onclick={handleNew}
                            class="slds-m-left_x-small">
                        </lightning-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Advanced Filters Modal -->
        <template if:true={showAdvancedFilters}>
            <section role="dialog" tabindex="-1" class="slds-modal slds-fade-in-open">
                <div class="slds-modal__container">
                    <header class="slds-modal__header">
                        <lightning-button-icon
                            icon-name="utility:close"
                            onclick={handleCloseAdvancedFilters}
                            alternative-text="close"
                            variant="bare-inverse"
                            class="slds-modal__close">
                        </lightning-button-icon>
                        <h2 class="slds-text-heading_medium slds-hyphenate">Advanced Filters</h2>
                    </header>
                    <div class="slds-modal__content slds-p-around_medium">
                        <!-- Filter Options -->
                        <div class="slds-grid slds-gutters slds-wrap">
                            <!-- Status Filter -->
                            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                                <lightning-dual-listbox
                                    name="statusFilter"
                                    label="Status"
                                    source-label="Available Status"
                                    selected-label="Selected Status"
                                    options={statusFilterOptions}
                                    value={selectedStatusFilters}
                                    onchange={handleStatusFilterChange}
                                    min="0"
                                    max="10">
                                </lightning-dual-listbox>
                            </div>
                            
                            <!-- Owner Filter -->
                            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                                <div class="slds-form-element">
                                    <label class="slds-form-element__label" for="owner-search">Owner</label>
                                    <div class="slds-form-element__control">
                                        <lightning-input
                                            id="owner-search"
                                            type="search"
                                            placeholder="Search owners..."
                                            value={ownerSearchTerm}
                                            onchange={handleOwnerSearch}>
                                        </lightning-input>
                                        <template if:true={showOwnerOptions}>
                                            <div class="slds-dropdown slds-dropdown_length-5 slds-dropdown_fluid">
                                                <ul class="slds-dropdown__list" role="listbox">
                                                    <template for:each={filteredOwnerOptions} for:item="owner">
                                                        <li key={owner.value} class="slds-dropdown__item" role="option">
                                                            <span class="slds-truncate" onclick={handleOwnerSelect} data-value={owner.value}>
                                                                <lightning-icon icon-name="utility:check" size="x-small" 
                                                                    class={owner.selected}></lightning-icon>
                                                                {owner.label}
                                                            </span>
                                                        </li>
                                                    </template>
                                                </ul>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Type Filter (for Accounts) -->
                            <template if:true={showTypeFilter}>
                                <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                                    <lightning-dual-listbox
                                        name="typeFilter"
                                        label="Type"
                                        source-label="Available Types"
                                        selected-label="Selected Types"
                                        options={typeFilterOptions}
                                        value={selectedTypeFilters}
                                        onchange={handleTypeFilterChange}
                                        min="0"
                                        max="10">
                                    </lightning-dual-listbox>
                                </div>
                            </template>
                            
                            <!-- Date Range Filter -->
                            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                                <div class="slds-grid slds-gutters">
                                    <div class="slds-col slds-size_1-of-2">
                                        <lightning-input
                                            type="date"
                                            label="Modified From"
                                            value={modifiedFromDate}
                                            onchange={handleModifiedFromChange}>
                                        </lightning-input>
                                    </div>
                                    <div class="slds-col slds-size_1-of-2">
                                        <lightning-input
                                            type="date"
                                            label="Modified To"
                                            value={modifiedToDate}
                                            onchange={handleModifiedToChange}>
                                        </lightning-input>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer class="slds-modal__footer">
                        <lightning-button 
                            label="Clear All"
                            onclick={handleClearAllFilters}
                            class="slds-m-right_x-small">
                        </lightning-button>
                        <lightning-button 
                            variant="neutral" 
                            label="Cancel"
                            onclick={handleCloseAdvancedFilters}
                            class="slds-m-right_x-small">
                        </lightning-button>
                        <lightning-button 
                            variant="brand" 
                            label="Apply Filters"
                            onclick={handleApplyFilters}>
                        </lightning-button>
                    </footer>
                </div>
            </section>
            <div class="slds-backdrop slds-backdrop_open"></div>
        </template>

        <!-- Loading State -->
        <template if:true={isLoading}>
            <div class="slds-align_absolute-center slds-m-vertical_large">
                <lightning-spinner alternative-text="Loading..." size="medium"></lightning-spinner>
                <p class="slds-text-body_regular slds-text-color_weak slds-m-top_small">
                    Loading data...
                </p>
            </div>
        </template>

        <!-- Data List -->
        <template if:false={isLoading}>
            <template if:true={hasData}>
                <div class="modern-list-container">
                    <template for:each={displayedData} for:item="record">
                        <div key={record.Id} class="modern-list-item" onclick={handleItemClick} data-id={record.Id}>
                            <div class="slds-grid slds-gutters">
                                <!-- Avatar/Icon -->
                                <div class="slds-col slds-no-flex">
                                    <lightning-avatar 
                                        src={record.AvatarUrl}
                                        fallback-icon-name="standard:account"
                                        size="medium">
                                    </lightning-avatar>
                                </div>
                                
                                <!-- Main Content -->
                                <div class="slds-col slds-has-flexi-truncate">
                                    <div class="slds-grid slds-grid_align-spread">
                                        <div class="slds-col slds-has-flexi-truncate">
                                            <h3 class="slds-text-heading_small slds-truncate">
                                                <a href="#" onclick={handleItemClick} data-id={record.Id}>
                                                    {record.Name}
                                                </a>
                                            </h3>
                                            <p class="slds-text-body_regular slds-text-color_weak slds-truncate">
                                                {record.Description}
                                            </p>
                                            <template if:true={record.SubDescription}>
                                                <p class="slds-text-body_small slds-text-color_weak slds-truncate">
                                                    {record.SubDescription}
                                                </p>
                                            </template>
                                        </div>
                                        
                                        <!-- Status Badge -->
                                        <div class="slds-col slds-no-flex">
                                            <lightning-badge 
                                                label={record.Status}
                                                class={record.StatusClass}>
                                            </lightning-badge>
                                        </div>
                                    </div>
                                    
                                    <!-- Additional Fields Row -->
                                    <div class="slds-grid slds-gutters slds-m-top_small">
                                        <!-- Address -->
                                        <template if:true={record.Address}>
                                            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-4">
                                                <span class="slds-text-title">
                                                    <lightning-icon icon-name="utility:location" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                    Address:
                                                </span>
                                                <span class="slds-text-body_small slds-text-color_weak slds-truncate">
                                                    {record.Address}
                                                </span>
                                            </div>
                                        </template>
                                        
                                        <!-- Email -->
                                        <template if:true={record.Email}>
                                            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-4">
                                                <span class="slds-text-title">
                                                    <lightning-icon icon-name="utility:email" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                    Email:
                                                </span>
                                                <span class="slds-text-body_small slds-text-color_weak slds-truncate">
                                                    {record.Email}
                                                </span>
                                            </div>
                                        </template>
                                        
                                        <!-- Phone -->
                                        <template if:true={record.Phone}>
                                            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-4">
                                                <span class="slds-text-title">
                                                    <lightning-icon icon-name="utility:phone_portrait" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                    Phone:
                                                </span>
                                                <span class="slds-text-body_small slds-text-color_weak slds-truncate">
                                                    {record.Phone}
                                                </span>
                                            </div>
                                        </template>
                                        
                                        <!-- Website -->
                                        <template if:true={record.Website}>
                                            <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-4">
                                                <span class="slds-text-title">
                                                    <lightning-icon icon-name="utility:world" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                    Website:
                                                </span>
                                                <span class="slds-text-body_small slds-text-color_weak slds-truncate">
                                                    {record.Website}
                                                </span>
                                            </div>
                                        </template>
                                    </div>
                                    
                                    <!-- Metadata Row -->
                                    <div class="slds-grid slds-gutters slds-m-top_small">
                                        <div class="slds-col slds-size_1-of-2">
                                            <span class="slds-text-body_small slds-text-color_weak">
                                                <lightning-icon icon-name="utility:user" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                Owner: {record.Owner}
                                            </span>
                                        </div>
                                        <div class="slds-col slds-size_1-of-2 slds-text-align_right">
                                            <span class="slds-text-body_small slds-text-color_weak">
                                                <lightning-icon icon-name="utility:clock" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                Modified: {record.LastModified}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Action Menu -->
                                <div class="slds-col slds-no-flex">
                                    <lightning-button-menu 
                                        alternative-text="Show menu"
                                        icon-size="x-small"
                                        menu-alignment="right"
                                        onselect={handleMenuSelect}
                                        data-id={record.Id}>
                                        <lightning-menu-item value="edit" label="Edit"></lightning-menu-item>
                                        <lightning-menu-item value="clone" label="Clone"></lightning-menu-item>
                                        <lightning-menu-item value="delete" label="Delete"></lightning-menu-item>
                                    </lightning-button-menu>
                                </div>
                            </div>
                        </div>
                    </template>
                    
                    <!-- Infinite Scroll Loading Indicator -->
                    <template if:true={isLoadingMore}>
                        <div class="slds-align_absolute-center slds-m-vertical_medium">
                            <lightning-spinner alternative-text="Loading more..." size="small"></lightning-spinner>
                            <p class="slds-text-body_small slds-text-color_weak slds-m-top_small">
                                Loading more records...
                            </p>
                        </div>
                    </template>
                    
                    <!-- Records Count -->
                    <template if:true={hasData}>
                        <div class="slds-m-top_medium slds-text-align_center">
                            <span class="slds-text-body_small slds-text-color_weak">
                                Showing {displayedRecords} of {totalRecords} records
                                <template if:true={hasMoreRecords}>
                                    • Scroll down to load more
                                </template>
                            </span>
                        </div>
                    </template>
                </div>
            </template>
            
            <!-- No Data State -->
            <template if:false={hasData}>
                <div class="slds-text-align_center slds-m-vertical_large">
                    <lightning-icon icon-name="utility:search" size="large" class="slds-text-color_weak"></lightning-icon>
                    <h3 class="slds-text-heading_medium slds-m-top_medium">No records found</h3>
                    <p class="slds-text-body_regular slds-text-color_weak slds-m-top_small">
                        Try adjusting your search criteria or filters to find what you're looking for.
                    </p>
                    <lightning-button 
                        label="Clear Filters"
                        onclick={handleClearAllFilters}
                        class="slds-m-top_medium">
                    </lightning-button>
                </div>
            </template>
        </template>
    </lightning-card>
</template>

