<template>
    <lightning-card title="Filtros Dinâmicos" icon-name="utility:filter">
        <div class="slds-m-around_medium">
            <div class="filter-container">
                <div class="filter-row">
                    <template for:each={filters} for:item="filter">
                        <div key={filter.fieldName} class="filter-field slds-form-element">
                            <label class="slds-form-element__label" for={filter.fieldName}>
                                {filter.label}
                                <template if:true={filter.required}>
                                    <abbr class="slds-required" title="obrigatório">*</abbr>
                                </template>
                            </label>
                            <div class="slds-form-element__control">
                                <template if:true={filter.isString}>
                                    <lightning-input 
                                        type="text" 
                                        name={filter.fieldName} 
                                        data-field={filter.fieldName} 
                                        placeholder={filter.placeholder}
                                        value={filter.value}
                                        onchange={handleInputChange}
                                        required={filter.required}>
                                    </lightning-input>
                                </template>
                                <template if:true={filter.isNumber}>
                                    <lightning-input 
                                        type="number" 
                                        name={filter.fieldName} 
                                        data-field={filter.fieldName} 
                                        placeholder={filter.placeholder}
                                        value={filter.value}
                                        min={filter.min}
                                        max={filter.max}
                                        step={filter.step}
                                        onchange={handleInputChange}
                                        required={filter.required}>
                                    </lightning-input>
                                </template>
                                <template if:true={filter.isOptions}>
                                    <lightning-combobox
                                        name={filter.fieldName}
                                        data-field={filter.fieldName}
                                        value={filter.value}
                                        placeholder={filter.placeholder}
                                        options={filter.options}
                                        onchange={handleInputChange}
                                        required={filter.required}>
                                    </lightning-combobox>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
                
                <div class="filter-actions slds-m-top_medium">
                    <lightning-button 
                        variant="neutral" 
                        label="Limpar Filtros" 
                        onclick={handleClearFilters}
                        class="clear-filters-btn">
                    </lightning-button>
                    <lightning-button 
                        variant="brand" 
                        label="Aplicar Filtros" 
                        onclick={handleApplyFilters}
                        class="apply-filters-btn">
                    </lightning-button>
                </div>
            </div>
        </div>
    </lightning-card>
</template>

