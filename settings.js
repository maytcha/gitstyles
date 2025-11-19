(function () {
    let observer = null;

    function injectMaytchaOption() {
        // Double check we are on the right page to avoid unnecessary DOM queries
        if (!location.pathname.includes('/settings/appearance')) return;

        const appearanceForm = document.querySelector('#appearance-form');
        const themeModeHeading = document.getElementById('theme-mode-heading');

        if (appearanceForm && themeModeHeading) {
            // Check if already injected
            if (document.getElementById('gitstyles-settings-container')) return;

            // Identify native section elements to toggle
            const dropdown = document.getElementById('color_mode_type_select');
            const themeModeDescription = document.getElementById('theme-mode-description');
            const dropdownContainer = dropdown ? dropdown.closest('.d-flex') : null;
            const modePanels = document.querySelectorAll('[data-targets="appearance-form.modePanels"]');
            const contrastSection = document.querySelector('react-partial[partial-name="appearance-settings-page"]');

            const nativeElements = [
                themeModeHeading,
                dropdown,
                themeModeDescription,
                dropdownContainer,
                ...Array.from(modePanels),
                contrastSection
            ].filter(Boolean);

            // 1. Create GitStyles Container
            const gitStylesContainer = document.createElement('div');
            gitStylesContainer.id = 'gitstyles-settings-container';
            gitStylesContainer.className = 'mb-4';
            gitStylesContainer.innerHTML = `
            <h3 class="h5 mb-2">gitstyles</h3>
            <div class="d-flex gutter-condensed flex-wrap" role="radiogroup" aria-label="GitStyles theme picker">
                <!-- Default / Off Card -->
                <div class="position-relative mb-3 flex-shrink-0 col-6 col-md-4">
                    <input class="position-absolute" id="gitstyles-option-default" type="radio" name="gitstyles_theme" value="default" style="position:absolute;z-index:5;margin-top: calc(52.6315789474% + 4px);left:19px;">
                    <label class="radio-label pl-0 pr-0 pt-0 pb-2 overflow-hidden color-theme-toggle-label width-full height-full" for="gitstyles-option-default">
                        <div class="d-block border-bottom mb-2 width-full color-bg-subtle" style="height: 0; padding-bottom: 52.63%;"></div>
                        <div class="ml-5 pr-2">
                            <div class="text-bold">GitHub Default</div>
                            <div class="f6 color-fg-muted">Use standard GitHub themes</div>
                        </div>
                    </label>
                </div>

                <!-- Maytcha Card -->
                <div class="position-relative mb-3 flex-shrink-0 col-6 col-md-4">
                    <input class="position-absolute" id="gitstyles-option-maytcha" type="radio" name="gitstyles_theme" value="maytcha" style="position:absolute;z-index:5;margin-top: calc(52.6315789474% + 4px);left:19px;">
                    <label class="radio-label pl-0 pr-0 pt-0 pb-2 overflow-hidden color-theme-toggle-label width-full height-full" for="gitstyles-option-maytcha">
                        <div class="mb-2 width-full overflow-hidden border-bottom" style="padding-bottom: 52.63%; position: relative;">
                            <img alt="Maytcha Preview" src="https://z.hajspace.com/u/JghUHM.png" style="position: absolute; width: 100%; height: 100%; object-fit: cover; top: 0; left: 0;">
                        </div>
                        <div class="ml-5 pr-2">
                            <div class="text-bold">Maytcha <span class="text-normal f6 color-fg-muted"> &bull; by maytcha</span></div>
                            <div class="f6 color-fg-muted">A relaxing matcha green theme</div>
                        </div>
                    </label>
                </div>
            </div>
        `;

            // 2. Insert GitStyles container before the native heading
            if (themeModeHeading.parentNode) {
                themeModeHeading.parentNode.insertBefore(gitStylesContainer, themeModeHeading);
            }

            // 3. Logic
            const radios = gitStylesContainer.querySelectorAll('input[name="gitstyles_theme"]');

            // Helper to enforce base theme
            function enforceBaseTheme(themeName) {
                if (themeName === 'maytcha') {
                    const lightOption = document.getElementById('option-light');
                    if (lightOption && !lightOption.checked) {
                        lightOption.click(); // Click to trigger GitHub's internal handlers
                    }
                }
            }

            // Helper to toggle native visibility
            function updateNativeVisibility(themeName) {
                const isDefault = themeName !== 'maytcha';
                nativeElements.forEach(el => {
                    if (el) el.style.display = isDefault ? '' : 'none';
                });

                if (isDefault) {
                    themeModeHeading.textContent = 'GitHub Themes';
                }
            }

            // Load saved state
            chrome.storage.local.get(['theme'], (result) => {
                if (result.theme === 'maytcha') {
                    const maytchaRadio = document.getElementById('gitstyles-option-maytcha');
                    if (maytchaRadio) maytchaRadio.checked = true;
                    enforceBaseTheme('maytcha');
                    updateNativeVisibility('maytcha');
                } else {
                    const defaultRadio = document.getElementById('gitstyles-option-default');
                    if (defaultRadio) defaultRadio.checked = true;
                    updateNativeVisibility('default');
                }
            });

            // Save state & Enforce
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        const val = e.target.value;
                        const theme = val === 'default' ? null : val;

                        chrome.storage.local.set({ theme: theme });

                        if (theme) {
                            enforceBaseTheme(theme);
                            updateNativeVisibility(theme);
                        } else {
                            updateNativeVisibility('default');
                        }
                    }
                });
            });
        }
    }

    function startObserver() {
        if (!observer) {
            observer = new MutationObserver(() => {
                injectMaytchaOption();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    function handleNavigation() {
        if (location.pathname.includes('/settings/appearance')) {
            injectMaytchaOption();
            startObserver();
        } else {
            stopObserver();
        }
    }

    // Initial run
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleNavigation);
    } else {
        handleNavigation();
    }

    // Handle Turbo/SPA navigation
    document.addEventListener('turbo:load', handleNavigation);
    document.addEventListener('turbo:frame-load', handleNavigation);

    // Fallback for other navigation types
    window.addEventListener('popstate', handleNavigation);
})();
