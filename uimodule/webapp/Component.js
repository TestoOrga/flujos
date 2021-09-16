sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "bafar/flujos/flujos/model/models",
    "./utils/SendData",
    "./utils/ErrorFrag",
  ],
  function (UIComponent, Device, models, SendData, ErrorFrag) {
    "use strict";

    return UIComponent.extend("bafar.flujos.flujos.Component", {
      metadata: {
        manifest: "json",
      },
      flowData: {
        departamento: "",
        actividad: "",
        proceso: "",
        id: ""
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
        this.oErrorFrag = new ErrorFrag(this.getRootControl());
      },
      exit: function () {
        this.oErrorFrag.destroy();
        delete this.oErrorFrag;
        delete this.flowData;
      },
      openErrorFrag: function (config, data, title) {
        this.oErrorFrag.open(config, data, title);
      }
    });
  }
);