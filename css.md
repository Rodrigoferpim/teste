/* Modern List View Component Styles */

/* Header Actions Styling */
.slds-card__header .slds-grid {
    align-items: center;
    gap: 12px;
}

.slds-card__header lightning-input {
    max-width: 300px;
    min-width: 200px;
}

.slds-card__header lightning-combobox {
    min-width: 200px;
    max-width: 250px;
}

.slds-card__header lightning-button-icon {
    --slds-c-button-radius: 4px;
    border: 1px solid var(--lwc-colorBorder, #e5e5e5);
    background-color: var(--lwc-colorBackgroundAlt, #fafaf9);
}

.slds-card__header lightning-button-icon:hover {
    background-color: var(--lwc-colorBackgroundRowHover, #f3f3f3);
    border-color: var(--lwc-colorBorderBrandPrimary, #0176d3);
}

/* Advanced Filters Modal Styling */
.slds-modal {
    z-index: 9000;
}

.slds-modal__container {
    max-width: 80rem;
    width: 90%;
}

.slds-dropdown {
    position: absolute;
    z-index: 9999;
    background: white;
    border: 1px solid #d8dde6;
    border-radius: 0.25rem;
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.16);
    margin-top: 0.125rem;
}

.slds-dropdown__item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid #f3f3f3;
}

.slds-dropdown__item:hover {
    background-color: #f4f6f9;
}

.slds-dropdown__item:last-child {
    border-bottom: none;
}

.slds-dropdown__item lightning-icon {
    margin-right: 0.5rem;
}

/* Container Styles - Enhanced for Infinite Scroll */
.modern-list-container {
    background: var(--lwc-colorBackgroundAlt, #fafaf9);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-height: 70vh;
    overflow-y: auto;
    scroll-behavior: smooth;
}

/* Custom Scrollbar for Infinite Scroll */
.modern-list-container::-webkit-scrollbar {
    width: 8px;
}

.modern-list-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.modern-list-container::-webkit-scrollbar-thumb {
    background: #c1c7d0;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.modern-list-container::-webkit-scrollbar-thumb:hover {
    background: #a8b0bd;
}

/* List Item Styles */
.modern-list-item {
    background: white;
    border: 1px solid var(--lwc-colorBorder, #e5e5e5);
    border-radius: 8px;
    margin-bottom: 12px;
    padding: 16px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.modern-list-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: var(--lwc-colorBorderBrandPrimary, #0176d3);
}

.modern-list-item:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Hover Effect Overlay */
.modern-list-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(1, 118, 211, 0.02) 0%, rgba(1, 118, 211, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    pointer-events: none;
}

.modern-list-item:hover::before {
    opacity: 1;
}

/* Avatar Enhancements */
.modern-list-item lightning-avatar {
    border: 2px solid var(--lwc-colorBorderBrandPrimary, #0176d3);
    border-radius: 50%;
    transition: all 0.2s ease-in-out;
}

.modern-list-item:hover lightning-avatar {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(1, 118, 211, 0.3);
}

/* Typography Enhancements */
.modern-list-item h3 a {
    color: var(--lwc-colorTextDefault, #181818);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease-in-out;
}

.modern-list-item h3 a:hover {
    color: var(--lwc-colorTextBrandPrimary, #0176d3);
    text-decoration: underline;
}

.modern-list-item p {
    line-height: 1.5;
    margin: 0;
}

/* Badge Styling */
.modern-list-item lightning-badge {
    font-weight: 500;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Status-specific badge colors */
.slds-theme_success {
    background-color: #04844b !important;
    color: white !important;
}

.slds-theme_error {
    background-color: #ea001e !important;
    color: white !important;
}

.slds-theme_warning {
    background-color: #fe9339 !important;
    color: white !important;
}

.slds-theme_info {
    background-color: #0176d3 !important;
    color: white !important;
}

/* Metadata Row Styling */
.modern-list-item .slds-grid.slds-gutters.slds-m-top_small {
    border-top: 1px solid var(--lwc-colorBorder, #e5e5e5);
    padding-top: 8px;
    margin-top: 12px !important;
}

.modern-list-item .slds-grid.slds-gutters.slds-m-top_small span {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: var(--lwc-colorTextWeak, #706e6b);
}

/* Action Menu Styling */
.modern-list-item lightning-button-menu {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.modern-list-item:hover lightning-button-menu {
    opacity: 1;
}

/* Loading State */
.slds-align_absolute-center {
    padding: 40px 0;
}

.slds-align_absolute-center lightning-spinner {
    --slds-c-spinner-color-foreground: var(--lwc-colorBrandPrimary, #0176d3);
}

/* Infinite Scroll Loading More Indicator */
.loading-more-indicator {
    padding: 1rem;
    text-align: center;
    background-color: #f8f9fa;
    border-top: 1px solid #e5e5e5;
    margin-top: 8px;
    border-radius: 0 0 8px 8px;
}

.loading-more-indicator lightning-spinner {
    --slds-c-spinner-color-foreground: var(--lwc-colorBrandPrimary, #0176d3);
}

.loading-more-indicator p {
    margin-top: 8px;
    color: var(--lwc-colorTextWeak, #706e6b);
    font-size: 0.875rem;
}

/* Records Count Styling */
.slds-m-top_medium.slds-text-align_center {
    background: var(--lwc-colorBackgroundAlt, #fafaf9);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--lwc-colorBorder, #e5e5e5);
    margin-top: 16px;
}

.slds-m-top_medium.slds-text-align_center span {
    color: var(--lwc-colorTextWeak, #706e6b);
    font-size: 0.875rem;
}

/* No Data State */
.slds-text-align_center {
    padding: 40px 20px;
}

.slds-text-align_center lightning-icon {
    color: var(--lwc-colorTextWeak, #706e6b);
    margin-bottom: 16px;
}

.slds-text-align_center h3 {
    color: var(--lwc-colorTextDefault, #181818);
    margin-bottom: 8px;
}

.slds-text-align_center p {
    color: var(--lwc-colorTextWeak, #706e6b);
    max-width: 400px;
    margin: 0 auto 20px;
}

/* Card Header Enhancements */
lightning-card {
    --slds-c-card-radius: 12px;
    --slds-c-card-header-padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--lwc-colorBorder, #e5e5e5);
}

/* Button Enhancements */
lightning-button {
    --slds-c-button-radius: 6px;
    transition: all 0.2s ease-in-out;
}

lightning-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
    .modern-list-container {
        max-height: 60vh;
    }
    
    .slds-card__header .slds-grid {
        display: block;
    }
    
    .slds-card__header .slds-col {
        margin-bottom: 12px;
        width: 100%;
    }
    
    .slds-card__header lightning-input,
    .slds-card__header lightning-combobox {
        width: 100%;
        max-width: none;
    }
    
    .slds-card__header .slds-text-align_right {
        text-align: left !important;
    }
    
    .modern-list-item {
        padding: 12px;
        margin-bottom: 8px;
    }
    
    .modern-list-item .slds-grid {
        display: block;
    }
    
    .modern-list-item .slds-col {
        margin-bottom: 8px;
    }
    
    .modern-list-item .slds-col.slds-no-flex {
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
    }
    
    .slds-modal__container {
        width: 95%;
        max-width: none;
    }
}

@media (max-width: 480px) {
    .modern-list-container {
        max-height: 50vh;
    }
    
    .modern-list-item h3 {
        font-size: 1rem;
    }
    
    .modern-list-item p {
        font-size: 0.875rem;
    }
    
    .modern-list-item .slds-grid.slds-gutters.slds-m-top_small span {
        font-size: 0.75rem;
    }
    
    lightning-card {
        --slds-c-card-header-padding: 16px;
    }
    
    .slds-card__header lightning-button-icon {
        margin: 4px 2px;
    }
}

/* Animation for list items appearing */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modern-list-item {
    animation: fadeInUp 0.3s ease-out;
}

/* Staggered animation for multiple items */
.modern-list-item:nth-child(1) { animation-delay: 0.1s; }
.modern-list-item:nth-child(2) { animation-delay: 0.2s; }
.modern-list-item:nth-child(3) { animation-delay: 0.3s; }
.modern-list-item:nth-child(4) { animation-delay: 0.4s; }
.modern-list-item:nth-child(5) { animation-delay: 0.5s; }

/* Focus states for accessibility */
.modern-list-item:focus {
    outline: 2px solid var(--lwc-colorBorderBrandPrimary, #0176d3);
    outline-offset: 2px;
}

.modern-list-item h3 a:focus {
    outline: 2px solid var(--lwc-colorBorderBrandPrimary, #0176d3);
    outline-offset: 2px;
    border-radius: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .modern-list-item {
        border-width: 2px;
    }
    
    .modern-list-item:hover {
        border-width: 3px;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .modern-list-item,
    .modern-list-item lightning-avatar,
    lightning-button,
    .modern-list-item::before {
        transition: none;
    }
    
    .modern-list-item:hover {
        transform: none;
    }
    
    .modern-list-item {
        animation: none;
    }
    
    .modern-list-container {
        scroll-behavior: auto;
    }
}

