function loadCSS(url) {
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
            minimizedHeight: "40px", // Height when minimized
            animationDuration: "0.3s",
        }, options);

        const $element = $(selector);

        const $widget = $('<div>', { class: 'quickquote-widget' });

        // Dynamic Form Inputs
        const $form = $('<form>');
        const $firstName = $('<input>', { type: 'text', placeholder: 'First Name', name: 'firstName' });
        const $lastName = $('<input>', { type: 'text', placeholder: 'Last Name', name: 'lastName' });
        const $vehicleMake = $('<input>', { type: 'text', placeholder: 'Vehicle Make', name: 'vehicleMake' });
        const $vehicleModel = $('<input>', { type: 'text', placeholder: 'Vehicle Model', name: 'vehicleModel' });
        const $statedAmount = $('<input>', { type: 'number', placeholder: 'Stated Amount', name: 'statedAmount' });
        const $annualMileage = $('<input>', { type: 'number', placeholder: 'Annual Mileage', name: 'annualMileage' });
        const $submitBtn = $('<button>', { text: 'Get Quote' });

        $form.append($firstName, $lastName, $vehicleMake, $vehicleModel, $statedAmount, $annualMileage, $submitBtn);

        const $quoteInfo = $('<div>', { class: 'quote-info' });

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

        // Double-click event to toggle minimize/expand the widget
        $widget.on('dblclick', function () {
            const isMinimized = $widget.hasClass('minimized');
            if (isMinimized) {
                $widget.removeClass('minimized').css('height', settings.height);
            } else {
                $widget.addClass('minimized').css('height', settings.minimizedHeight);
            }
        });

        // Form submit handler to call API
        $submitBtn.click(function (e) {
            e.preventDefault();

            const formData = {
                individual_first_name: $firstName.val(),
                individual_last_name: $lastName.val(),
                vehicleMake: $vehicleMake.val(),
                vehicleModel: $vehicleModel.val(),
                statedAmount: $statedAmount.val(),
                annualMileage: $annualMileage.val(),
            };

            // Prepare the payload for the API request
            const payload = {
                policy_number: null,
                policy_status: null,
                is_quote: true,
                incept_date: "0001-01-01T00:00:00",
                minimum_earned_premium: 0.0,
                full_term_premium: 0.0,
                written_premium: 0.0,
                net_change_premium: 0.0,
                full_term_pol_premium: 0.0,
                written_pol_premium: 0.0,
                net_change_pol_premium: 0.0,
                full_term_pol_tax: 0.0,
                written_pol_tax: 0.0,
                net_change_pol_tax: 0.0,
                full_term_pol_fee: 0.0,
                written_pol_fee: 0.0,
                net_change_pol_fee: 0.0,
                full_term_pol_total: 0.0,
                written_pol_total: 0.0,
                net_change_pol_total: 0.0,
                billing_party: "",
                risk_state: "PA",
                marketing_code: "GA",
                origination_source: "IPAD-GG Southwest Na",
                department: "ACI",
                territory_code: null,
                settlement_type: null,
                effective_date: "2021-11-17T10:34:06.900194",
                expiration_date: "2022-11-17T10:34:06.900194",
                existing_renewal: false,
                insured: {
                    full_name: `${formData.individual_first_name} ${formData.individual_last_name}`,
                    individual_first_name: formData.individual_first_name,
                    individual_last_name: formData.individual_last_name,
                    phone_number: "8888888888",
                    email_address: "None@nsminc.com",
                    mailing_address: {
                        city: "KING OF PRUSSIA",
                        state: "PA",
                        zip: "19406",
                    },
                },
                lines: [
                    {
                        line_number: 1,
                        line_code: "AUTO",
                        vehicles: [
                            {
                                veh_make: formData.vehicleMake,
                                veh_model: formData.vehicleModel,
                                stated_amount: formData.statedAmount,
                                annual_mileage: formData.annualMileage,
                            }
                        ]
                    }
                ]
            };

            // Send the API request
            $.ajax({
                url: settings.apiUrl,
                method: 'PUT',
                headers: {
                    "authentication_key": "c21506140ca2e90e4b947aea364fb2b234d206c4462fa36594365ce5d488da14"
                },
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (response) {
                    const premium = response.full_term_premium;  // Adjust based on your API response structure
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
                },
                error: function () {
                    $quoteInfo.html('There was an error fetching the quote.');
                }
            });
        });
    };

    if (typeof global !== 'undefined') {
        global.quickquote = quickquote;
    } else if (typeof window !== 'undefined') {
        window.quickquote = quickquote;
    }
})(this || window, window.jQuery);
