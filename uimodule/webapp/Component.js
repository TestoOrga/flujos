sap.ui.define(
    ["sap/ui/core/UIComponent", "sap/ui/Device", "bafar/flujos/flujos/model/models", "./controller/SendData"],
    function (UIComponent, Device, models, SendData) {
        "use strict";

        return UIComponent.extend("bafar.flujos.flujos.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                this.oSendData = new SendData(this);
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);
