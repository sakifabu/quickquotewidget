﻿function loadCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    document.head.appendChild(link);
}

(function (global, $) {
    const quickquote = function (selector, options = {}) {
        loadCSS('/quickquotewidget/widgetstyles.css');
        const settings = $.extend({
            apiUrl: "https://nsm-eus-ccuat-wa-ratingapi.azurewebsites.net/CalculatePremiumWithDefaults/ACI/consumer",  // API URL
            quotePortalUrl: "https://member.americancollectors.com/quote-portal/home?type=collectorauto",
            width: "300px",
            height: "300px",
            position: "fixed",
            bottom: "20px",
            right: "20px",
            borderRadius: "15px",
            border: "none",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            backgroundColor: "#fff",
            minimizedHeight: "40px",
            animationDuration: "0.3s",
        }, options);

        const $element = $(selector);
        const $widget = $('<div>', { class: 'quickquote-widget' });

        // Dynamic Form Inputs
        const $form = $('<form>');
        const $state = $('<input>', { type: 'text', placeholder: 'State (e.g., PA)', name: 'state' });
        const $vehicleYear = $('<input>', { type: 'number', placeholder: 'Vehicle Year', name: 'vehicleYear' });
        const $vehicleMake = $('<input>', { type: 'text', placeholder: 'Vehicle Make', name: 'vehicleMake' });
        const $vehicleModel = $('<input>', { type: 'text', placeholder: 'Vehicle Model', name: 'vehicleModel' });
        const $annualMileage = $('<input>', { type: 'number', placeholder: 'Annual Mileage', name: 'annualMileage' });
        const $submitBtn = $('<button>', { text: 'Get Quote' });

        $form.append($state, $vehicleYear, $vehicleMake, $vehicleModel, $annualMileage, $submitBtn);
        const $quoteInfo = $('<div>', { class: 'quote-info' });

        // Widget Styling
        $widget.css({
            position: settings.position,
            bottom: settings.bottom,
            right: settings.right,
            width: settings.width,
            height: settings.height,
            borderRadius: settings.borderRadius,
            backgroundColor: settings.backgroundColor,
            boxShadow: settings.boxShadow,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            overflow: 'hidden',
            transition: `height ${settings.animationDuration}`,
        });

        // Add the form and quote info to the widget
        $widget.append($form).append($quoteInfo);
        $element.append($widget);

        // Double-click to toggle minimize/expand the widget
        $widget.on('dblclick', function () {
            const isMinimized = $widget.hasClass('minimized');
            if (isMinimized) {
                $widget.removeClass('minimized').css('height', settings.height);
            } else {
                $widget.addClass('minimized').css('height', settings.minimizedHeight);
            }
        });

        // Form submit handler to call API
        $submitBtn.click(async function (e) {
            e.preventDefault();

            // Collect form data
            const formData = {
                state: $state.val(),
                vehicleYear: $vehicleYear.val(),
                vehicleMake: $vehicleMake.val(),
                vehicleModel: $vehicleModel.val(),
                annualMileage: $annualMileage.val(),
            };

            // Prepare the payload for the API request
            const payload = {
                "risk_state": formData.state,
                "department": "ACI",
                "insured": {},
                "lines": [
                    {
                        "line_number": 1,
                        "full_term_premium": 0.0,
                        "line_code": "AUTO",
                        "program_code": "COLLAUTO",
                        "agency": {
                            "invoice_suspend_method": null,
                            "send_statement_ind": null,
                            "agency_identifier": "DDAB728D-26B5-4230-812D-F3359ECA17CC"
                        },
                        "carriers": [
                            {
                                "participation_percentage": 100.0,
                                "principle_carrier": false,
                                "code": "AMIG"
                            }
                        ],
                        vehicles: [
                            {
                                veh_year: formData.vehicleYear,
                                veh_make: formData.vehicleMake,
                                veh_model: formData.vehicleModel,
                                annual_mileage: formData.annualMileage+" Miles",
                            }
                        ]
                    }
                ]
            };

            // API Request using fetch
            try {
                const response = await fetch(settings.apiUrl, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "authentication_key": "c21506140ca2e90e4b947aea364fb2b234d206c4462fa36594365ce5d488da14"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const premium = data.full_term_premium;  // Adjust based on your API response structure
                if (premium) {
                    $quoteInfo.html(`Full Term Premium: $${premium}`);
                    const $quoteButton = $('<button>', {
                        text: 'Get Full Quote',
                        click: function () {
                            window.location.href = settings.quotePortalUrl;
                        }
                    });
                    $quoteInfo.append($quoteButton);
                } else {
                    $quoteInfo.html('Error fetching quote.');
                }
            } catch (error) {
                $quoteInfo.html('There was an error fetching the quote.');
                console.error("Fetch error:", error);
            }
        });
    };

    if (typeof global !== 'undefined') {
        global.quickquote = quickquote;
    } else if (typeof window !== 'undefined') {
        window.quickquote = quickquote;
    }
})(this || window, window.jQuery);
