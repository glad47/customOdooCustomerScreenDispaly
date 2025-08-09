odoo.define('pos_customer_display_fullscreen.CustomerFacingDisplayButtonPatch', function (require) {
    'use strict';

    const Registries = require('point_of_sale.Registries');
    const CustomerFacingDisplayButton = require('point_of_sale.CustomerFacingDisplayButton');


    const PatchedCustomerFacingDisplayButton = CustomerFacingDisplayButton =>
        class extends CustomerFacingDisplayButton {
            async onClickLocal() {

                if ('getScreenDetails' in window) {
                    try {
                        const details = await window.getScreenDetails();
                        const screens = details.screens;


                        if (screens.length > 1) {
                            const currentX = window.screenX;
                            const currentY = window.screenY;

                            let currentScreenIndex = 0;
                            for (let i = 0; i < screens.length; i++) {
                                const s = screens[i];
                                if (
                                    currentX >= s.left &&
                                    currentX < s.left + s.width &&
                                    currentY >= s.top &&
                                    currentY < s.top + s.height
                                ) {
                                    currentScreenIndex = i;
                                    break;
                                }
                            }

                            const targetScreenIndex = currentScreenIndex === 0 ? 1 : 0;
                            const targetScreen = screens[targetScreenIndex];

                            this.env.pos.customer_display = window.open(
                                '',
                                'CustomerDisplaySecondScreen',
                                `width=${targetScreen.width},height=${targetScreen.height},left=${targetScreen.left},top=${targetScreen.top}`
                            );

                            const renderedHtml = await this.env.pos.render_html_for_customer_facing_display();
                            const $renderedHtml = $('<div>').html(renderedHtml);
                            $(this.env.pos.customer_display.document.body).html($renderedHtml.find('.pos-customer_facing_display'));
                            $(this.env.pos.customer_display.document.head).html($renderedHtml.find('.resources').html());

                            this.env.pos.customer_display.onload = function () {
                                const elem = this.env.pos.customer_display.document.documentElement;
                                if (elem.requestFullscreen) {
                                    elem.requestFullscreen().catch(err => {
                                        console.warn("Fullscreen failed:", err);
                                    });
                                }
                            };

                            return;
                        }
                    } catch (err) {
                        console.warn("getScreenDetails failed:", err);
                    }
                }

                // Fallback
                console.log("Fallback to default display");
                this.env.pos.customer_display = window.open('', 'Customer Display', 'height=600,width=900');
                const renderedHtml = await this.env.pos.render_html_for_customer_facing_display();
                const $renderedHtml = $('<div>').html(renderedHtml);
                $(this.env.pos.customer_display.document.body).html($renderedHtml.find('.pos-customer_facing_display'));
                $(this.env.pos.customer_display.document.head).html($renderedHtml.find('.resources').html());
            }

            _start() {
                this.onClickLocal();
                if (this.local) {
                    return;
                }

                const self = this;

               async function loop() {
                if (self.env.proxy.posbox_supports_display) {
                    try {
                        let ownership = await self.env.proxy.test_ownership_of_customer_screen();
                        if (typeof ownership === 'string') {
                            ownership = JSON.parse(ownership);
                        }
                        if (ownership.status === 'OWNER') {
                            self.state.status = 'success';
                        } else {
                            self.state.status = 'warning';
                        }
                        setTimeout(loop, 3000);
                    } catch (error) {
                        if (error.abort) {
                            // Stop the loop
                            return;
                        }
                        if (typeof error == 'undefined') {
                            self.state.status = 'failure';
                        } else {
                            self.state.status = 'not_found';
                            self.env.proxy.posbox_supports_display = false;
                        }
                        setTimeout(loop, 3000);
                    }
                }
            }
            loop();

              
            }
        
        };

    Registries.Component.extend(CustomerFacingDisplayButton, PatchedCustomerFacingDisplayButton);

    return CustomerFacingDisplayButton;
});
