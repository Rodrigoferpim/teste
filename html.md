<aura:component implements="force:lightningQuickAction,force:hasRecordId" access="global">
    <aura:attribute name="recordId" type="Id" />

    <c:operationProperties recordId="{!v.recordId}" />
</aura:component>
html
<template>
    <template if:true={properties}>
        <table class="modern-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Endereço</th>
                    <th>Preço</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                <template for:each={properties} for:item="property">
                    <tr key={property.Id}>
                        <td>{property.Name}</td>
                        <td>{property.Addres__c}</td>
                        <td>R$ {property.Price__c}</td>
                        <td>
                            <button data-id={property.Id} onclick={handleSelect}>Selecionar</button>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </template>
    <template if:true={error}>
        <p class="error">Erro ao carregar imóveis.</p>
    </template>
</template>
css
.modern-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-family: 'Arial', sans-serif;
}

.modern-table th, .modern-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
}

.modern-table th {
    background-color: #f4f6f9;
    font-weight: 600;
}

.modern-table tr:hover {
    background-color: #f0f8ff;
}

button {
    background-color: #0070d2;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #005bb5;
}



