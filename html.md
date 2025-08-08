<template>
    <lightning-card title={cardTitle} icon-name={cardIcon}>
        <div slot="actions" class="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
            <!-- List View Selector -->
            <div class="slds-col slds-size_1-of-2 slds-medium-size_1-of-4">
                <lightning-combobox
                    name="listView"
                    value={selectedListView}
                    options={listViewOptions}
                    onchange={handleListViewChange}
                    variant="label-hidden"
                    label="List View Selection">
                </lightning-combobox>
            </div>

            <!-- Search and Action Buttons -->
            <div class="slds-col slds-size_1-of-2 slds-medium-size_3-of-4 slds-text-align_right">
                <lightning-input
                    type="search"
                    placeholder="Search this list..."
                    value={searchTerm}
                    onchange={handleSearch}
                    variant="label-hidden"
                    label="Search">
                </lightning-input>
                <lightning-button-icon 
                    icon-name="utility:filterList"
                    alternative-text="Filter List"
                    title="Filter List"
                    onclick={handleFilterClick}
                    class="slds-m-left_x-small">
                </lightning-button-icon>
                <lightning-button-icon 
                    icon-name="utility:refresh"
                    alternative-text="Refresh"
                    title="Refresh"
                    onclick={handleRefresh}
                    class="slds-m-left_x-small">
                </lightning-button-icon>
                <lightning-button 
                    variant="brand" 
                    label="New" 
                    icon-name="utility:add"
                    onclick={handleNew}
                    class="slds-m-left_x-small">
                </lightning-button>
            </div>
        </div>

        <div class="slds-card__body slds-card__body_inner">
            <!-- Loading Spinner -->
            <template if:true={isLoading}>
                <div class="slds-align_absolute-center slds-m-vertical_large">
                    <lightning-spinner alternative-text="Loading..." size="medium"></lightning-spinner>
                </div>
            </template>

            <!-- Data List -->
            <template if:false={isLoading}>
                <template if:true={hasData}>
                    <div class="modern-list-container">
                        <template for:each={filteredData} for:item="record">
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
                                    <div class="slds-col slds-grow">
                                        <div class="slds-grid slds-grid_align-spread">
                                            <div class="slds-col">
                                                <h3 class="slds-text-heading_small slds-m-bottom_xx-small">
                                                    <a href="#" onclick={handleItemClick} data-id={record.Id}>
                                                        {record.Name}
                                                    </a>
                                                </h3>
                                                <p class="slds-text-body_small slds-text-color_weak">
                                                    {record.Description}
                                                </p>
                                                <template if:true={record.SubDescription}>
                                                    <p class="slds-text-body_small slds-text-color_weak slds-m-top_xx-small">
                                                        {record.SubDescription}
                                                    </p>
                                                </template>
                                            </div>
                                            
                                            <!-- Status/Badge -->
                                            <div class="slds-col slds-no-flex">
                                                <template if:true={record.Status}>
                                                    <lightning-badge 
                                                        label={record.Status} 
                                                        class={record.StatusClass}>
                                                    </lightning-badge>
                                                </template>
                                            </div>
                                        </div>
                                        
                                        <!-- Metadata Row -->
                                        <div class="slds-grid slds-gutters slds-m-top_small">
                                            <div class="slds-col">
                                                <span class="slds-text-body_small slds-text-color_weak">
                                                    <lightning-icon icon-name="utility:date_time" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                    {record.LastModified}
                                                </span>
                                            </div>
                                            <template if:true={record.Owner}>
                                                <div class="slds-col">
                                                    <span class="slds-text-body_small slds-text-color_weak">
                                                        <lightning-icon icon-name="utility:user" size="xx-small" class="slds-m-right_xx-small"></lightning-icon>
                                                        {record.Owner}
                                                    </span>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                    
                                    <!-- Actions -->
                                    <div class="slds-col slds-no-flex">
                                        <lightning-button-menu 
                                            alternative-text="Show menu" 
                                            icon-size="x-small"
                                            menu-alignment="right"
                                            onselect={handleMenuSelect}
                                            data-id={record.Id}>
                                            <lightning-menu-item value="edit" label="Edit"></lightning-menu-item>
                                            <lightning-menu-item value="delete" label="Delete"></lightning-menu-item>
                                            <lightning-menu-item value="clone" label="Clone"></lightning-menu-item>
                                        </lightning-button-menu>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    
                    <!-- Pagination -->
                    <template if:true={showPagination}>
                        <div class="slds-m-top_medium">
                            <div class="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
                                <div class="slds-col">
                                    <span class="slds-text-body_small slds-text-color_weak">
                                        Showing {startRecord} to {endRecord} of {totalRecords} records
                                    </span>
                                </div>
                                <div class="slds-col slds-no-flex">
                                    <lightning-button-group>
                                        <lightning-button 
                                            label="Previous" 
                                            icon-name="utility:chevronleft"
                                            disabled={isFirstPage}
                                            onclick={handlePrevious}>
                                        </lightning-button>
                                        <lightning-button 
                                            label="Next" 
                                            icon-name="utility:chevronright"
                                            icon-position="right"
                                            disabled={isLastPage}
                                            onclick={handleNext}>
                                        </lightning-button>
                                    </lightning-button-group>
                                </div>
                            </div>
                        </div>
                    </template>
                </template>
                
                <!-- No Data State -->
                <template if:false={hasData}>
                    <div class="slds-align_absolute-center slds-m-vertical_large">
                        <div class="slds-text-align_center">
                            <lightning-icon icon-name="utility:search" size="large" class="slds-m-bottom_small"></lightning-icon>
                            <h3 class="slds-text-heading_medium">No records found</h3>
                            <p class="slds-text-body_regular slds-text-color_weak">
                                Try adjusting your search criteria or create a new record.
                            </p>
                            <lightning-button 
                                variant="brand" 
                                label="Create New Record" 
                                class="slds-m-top_medium"
                                onclick={handleNew}>
                            </lightning-button>
                        </div>
                    </div>
                </template>
            </template>
        </div>
    </lightning-card>
</template>

