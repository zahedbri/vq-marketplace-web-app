
import { stripHtml } from './util';

const CENT_CURRENCIES = [ 'PLN', 'EUR', 'USD' ];
const NOCENT_CURRENCIES = [ 'HUF' ];

const CURRENCY_LABELS = {
    PLN: 'PLN',
    EUR: 'EUR',
    USD: 'USD',
    HUF: 'Ft',
};

export const displayListingDesc = desc => {
    if (desc) {
        return stripHtml(desc)
            .substring(0, 75) + '..';
    }

    return 'No description';
};

export const displayLocation = location => {
    if (location) {
        return `${location.street}, ${location.postalCode} ${location.city}`
    }

    return '';
};

export const displayPrice = (amount, currencyCode, pricingModel) => {
    if (pricingModel === 1) {
        if (CENT_CURRENCIES.indexOf(currencyCode) !== -1) {
            return `${(amount / 100).toFixed(2)} ${currencyCode}/h`;
        }
    
        if (NOCENT_CURRENCIES.indexOf(currencyCode) !== -1) {
            return `${amount} ${CURRENCY_LABELS[currencyCode]}/h`;
        }
    }

    if (CENT_CURRENCIES.indexOf(currencyCode) !== -1) {
        return `${(amount / 100).toFixed(2)} ${currencyCode}`;
    }

    if (NOCENT_CURRENCIES.indexOf(currencyCode) !== -1) {
        return `${amount} ${CURRENCY_LABELS[currencyCode]}`;
    }
};
