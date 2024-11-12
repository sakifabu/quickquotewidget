// Function to dynamically load CSS
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
            url: "https://americancollectors.com/",
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
            closeButton: true,
            minimizeButton: true,
            minimizedHeight: "40px",
            animationDuration: "0.3s",
        }, options);

        const $element = $(selector);

        const $widget = $('<div>', { class: 'quickquote-widget' });

        const $iframe = $('<iframe>', {
            src: settings.url,
            css: {
                width: '100%',
                height: '100%',
                borderRadius: settings.borderRadius,
                border: settings.border,
                transition: `height ${settings.animationDuration}`,
            },
        });

        const $minimizeBtn = $('<button>', {
            html: '&#8211;', 
            class: 'minimize-btn',
            click: function () {
                const isMinimized = $widget.hasClass('minimized');
                if (isMinimized) {
                    $iframe.slideDown(settings.animationDuration);
                    $widget.css('height', settings.height).removeClass('minimized');
                } else {
                    $iframe.slideUp(settings.animationDuration);
                    $widget.css('height', settings.minimizedHeight).addClass('minimized');
                }
            },
        });

        const $closeBtn = $('<button>', {
            text: '✕', // Elegant close symbol
            class: 'close-btn',
            click: function () {
                $widget.fadeOut(settings.animationDuration);
            },
        });

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

        const $buttonContainer = $('<div>', { class: 'button-container' })
            .append($minimizeBtn)
            .append($closeBtn);

        $widget.append($buttonContainer).append($iframe);
        $element.append($widget);
    };
    if (typeof global !== 'undefined') {
        global.quickquote = quickquote;
    } else if (typeof window !== 'undefined') {
        window.quickquote = quickquote;
    }
})(this || window, window.jQuery);
