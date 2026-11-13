
const hookTripsCatalog = async () => {
    const listEl = document.getElementById('trips-list');
    const templateEl = document.getElementById('trip-card-template');
    const loadingEl = document.getElementById('trips-loading');
    const errorEl = document.getElementById('trips-error');
    const emptyEl = document.getElementById('trips-empty');
    const regionSelect = document.getElementById('region-filter');
    const seasonSelect = document.getElementById('season-filter');

    if (!listEl || !templateEl) {
        return;
    }

    let trips = [];

    const populateFilter = (selectEl, values, defaultText) => {
        if (!selectEl) return;

        selectEl.replaceChildren();

        const defaultOption = document.createElement('option');
        defaultOption.value = 'all';
        defaultOption.textContent = defaultText;
        selectEl.appendChild(defaultOption);

        values.forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
            selectEl.appendChild(option);
        });
    };

    const renderTrips = () => {
        const selectedRegion = regionSelect?.value || 'all';
        const selectedSeason = seasonSelect?.value || 'all';

        const filteredTrips = trips.filter((trip) => {
            const matchesRegion =
                selectedRegion === 'all' || trip.region === selectedRegion;

            const matchesSeason =
                selectedSeason === 'all' || trip.bestSeason === selectedSeason;

            return matchesRegion && matchesSeason;
        });

        const fragment = document.createDocumentFragment();

        filteredTrips.forEach((trip) => {
            const card = templateEl.content.cloneNode(true);
            const cardEl = card.querySelector('.route-card');

            cardEl.classList.add(trip.region);

            card.querySelector('[data-field="name"]').textContent = trip.name;
            card.querySelector('[data-field="region"]').textContent = trip.region;
            card.querySelector('[data-field="startStation"]').textContent = trip.startStation;
            card.querySelector('[data-field="endStation"]').textContent = trip.endStation;
            card.querySelector('[data-field="duration"]').textContent = trip.duration;
            card.querySelector('[data-field="distance"]').textContent = trip.distance;
            card.querySelector('[data-field="description"]').textContent = trip.description;

            const seasonEl = card.querySelector('[data-field="season"]');
            seasonEl.textContent = `Best in ${trip.bestSeason}`;
            seasonEl.classList.add(`season-${trip.bestSeason}`);

            const highlightsEl = card.querySelector('[data-field="highlights"]');

            (trip.highlights || []).forEach((highlight) => {
                const tag = document.createElement('span');
                tag.className = 'highlight-tag';
                tag.textContent = highlight;
                highlightsEl.appendChild(tag);
            });

            const detailsLink = card.querySelector('[data-field="details"]');
            detailsLink.href = `/trips/${encodeURIComponent(trip.id)}`;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);

        if (emptyEl) {
            emptyEl.hidden = filteredTrips.length > 0;
        }
    };

    try {
        const response = await fetch('/api/trips');

        if (!response.ok) {
            throw new Error(`Failed to load trips (${response.status})`);
        }

        const payload = await response.json();
        trips = payload.trips || [];

        const regions = [...new Set(trips.map((trip) => trip.region))].sort();
        const seasons = [...new Set(trips.map((trip) => trip.bestSeason))].sort();

        populateFilter(regionSelect, regions, 'All Regions');
        populateFilter(seasonSelect, seasons, 'Any Season');

        renderTrips();

        if (loadingEl) {
            loadingEl.hidden = true;
        }

        regionSelect?.addEventListener('change', renderTrips);
        seasonSelect?.addEventListener('change', renderTrips);
    } catch (error) {
        console.error('Error loading trips:', error);

        if (loadingEl) {
            loadingEl.hidden = true;
        }

        if (errorEl) {
            errorEl.hidden = false;
        }
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');

        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);

        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        console.error('Error loading trains:', error);

        if (loadingEl) {
            loadingEl.hidden = true;
        }

        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    hookTripsCatalog();
    hookTrainsCatalog();
});
