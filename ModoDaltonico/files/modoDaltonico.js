(function() {
	'use strict';

	var config = window.ModoDaltonicoConfig || {};
	var serverActive = config.initialActive || false;
	var serverType = config.contrastType || 'protanopia';
	var activeLabel = config.activeLabel || 'Modo activo';
	var inactiveLabel = config.inactiveLabel || 'Modo inactivo';
	var strings = config.strings || {};

	var STORAGE_KEY_ACTIVE = 'md_active';
	var STORAGE_KEY_TYPE = 'md_contrast_type';
	var STORAGE_KEY_SERVER_TYPE = 'md_server_contrast_type';
	var VALID_TYPES = ['protanopia', 'deuteranopia', 'tritanopia'];

	function storageGet(key) {
		try {
			return localStorage.getItem(key);
		} catch (e) {
			return null;
		}
	}

	function storageSet(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			// localStorage not available
		}
	}

	function getInitialActive() {
		var stored = storageGet(STORAGE_KEY_ACTIVE);
		if (stored === null) {
			storageSet(STORAGE_KEY_ACTIVE, serverActive ? '1' : '0');
			return serverActive;
		}
		return stored === '1';
	}

	function getInitialType() {
		var previousServerType = storageGet(STORAGE_KEY_SERVER_TYPE);
		var storedType = storageGet(STORAGE_KEY_TYPE);

		if (previousServerType !== serverType) {
			storageSet(STORAGE_KEY_SERVER_TYPE, serverType);
			storageSet(STORAGE_KEY_TYPE, serverType);
			return serverType;
		}

		if (storedType && VALID_TYPES.indexOf(storedType) !== -1) {
			return storedType;
		}

		storageSet(STORAGE_KEY_TYPE, serverType);
		return serverType;
	}

	function isActive() {
		return storageGet(STORAGE_KEY_ACTIVE) === '1';
	}

	function injectSvgFilters() {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'md-svg-filters');
		svg.setAttribute('aria-hidden', 'true');
		svg.innerHTML =
			'<defs>' +
			'<filter id="md-protanopia-filter" color-interpolation-filters="linearRGB">' +
				'<feColorMatrix type="matrix" values="' +
					'0.567, 0.433, 0,     0, 0 ' +
					'0.558, 0.442, 0,     0, 0 ' +
					'0,     0.242, 0.758, 0, 0 ' +
					'0,     0,     0,     1, 0" />' +
			'</filter>' +
			'<filter id="md-deuteranopia-filter" color-interpolation-filters="linearRGB">' +
				'<feColorMatrix type="matrix" values="' +
					'0.625, 0.375, 0,   0, 0 ' +
					'0.7,   0.3,   0,   0, 0 ' +
					'0,     0.3,   0.7, 0, 0 ' +
					'0,     0,     0,   1, 0" />' +
			'</filter>' +
			'<filter id="md-tritanopia-filter" color-interpolation-filters="linearRGB">' +
				'<feColorMatrix type="matrix" values="' +
					'0.95, 0.05,  0,     0, 0 ' +
					'0,    0.433, 0.567, 0, 0 ' +
					'0,    0.475, 0.525, 0, 0 ' +
					'0,    0,     0,     1, 0" />' +
			'</filter>' +
			'</defs>';
		document.body.appendChild(svg);
	}

	function applyFilter(type) {
		document.body.classList.remove('md-protanopia', 'md-deuteranopia', 'md-tritanopia');
		document.body.classList.add('md-' + type);
	}

	function removeFilter() {
		document.body.classList.remove('md-protanopia', 'md-deuteranopia', 'md-tritanopia');
	}

	function createUI(currentType) {
		var container = document.createElement('div');
		container.className = 'md-toggle';

		var badge = document.createElement('div');
		badge.className = 'md-badge';
		badge.id = 'md-badge';
		container.appendChild(badge);

		var controls = document.createElement('div');
		controls.className = 'md-controls';

		var select = document.createElement('select');
		select.className = 'md-type-select';
		select.id = 'md-type-select';
		select.setAttribute('aria-label', strings.indicador_activo || 'Contrast type');

		for (var i = 0; i < VALID_TYPES.length; i++) {
			var option = document.createElement('option');
			option.value = VALID_TYPES[i];
			option.textContent = strings[VALID_TYPES[i]] || VALID_TYPES[i];
			if (VALID_TYPES[i] === currentType) {
				option.selected = true;
			}
			select.appendChild(option);
		}
		controls.appendChild(select);

		var toggleBtn = document.createElement('button');
		toggleBtn.type = 'button';
		toggleBtn.className = 'md-toggle-btn';
		toggleBtn.id = 'md-toggle-btn';
		toggleBtn.setAttribute('aria-label', inactiveLabel);
		toggleBtn.setAttribute('aria-pressed', 'false');
		toggleBtn.setAttribute('title', inactiveLabel);
		toggleBtn.innerHTML = '&#9737;';
		controls.appendChild(toggleBtn);

		container.appendChild(controls);
		document.body.appendChild(container);

		return { toggleBtn: toggleBtn, badge: badge, select: select };
	}

	function updateUI(ui, active, type) {
		ui.toggleBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
		ui.toggleBtn.setAttribute('aria-label', active ? activeLabel : inactiveLabel);
		ui.toggleBtn.setAttribute('title', active ? activeLabel : inactiveLabel);

		if (ui.select.value !== type) {
			ui.select.value = type;
		}

		if (active) {
			ui.badge.textContent = (strings.indicador_activo || 'Active') + ': ' + (strings[type] || type);
			ui.badge.classList.add('md-visible');
		} else {
			ui.badge.classList.remove('md-visible');
		}
	}

	function toggleActive(ui) {
		var active = isActive();
		var newActive = !active;
		var type = ui.select.value;

		storageSet(STORAGE_KEY_ACTIVE, newActive ? '1' : '0');

		if (newActive) {
			applyFilter(type);
		} else {
			removeFilter();
		}

		updateUI(ui, newActive, type);
	}

	function changeType(ui, newType) {
		storageSet(STORAGE_KEY_TYPE, newType);

		if (isActive()) {
			applyFilter(newType);
		}

		updateUI(ui, isActive(), newType);
	}

	function init() {
		injectSvgFilters();

		var currentActive = getInitialActive();
		var currentType = getInitialType();

		var ui = createUI(currentType);

		if (currentActive) {
			applyFilter(currentType);
		}

		updateUI(ui, currentActive, currentType);

		ui.toggleBtn.addEventListener('click', function() {
			toggleActive(ui);
		});

		ui.select.addEventListener('change', function() {
			var newType = ui.select.value;
			changeType(ui, newType);
			if (!isActive()) {
				toggleActive(ui);
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
