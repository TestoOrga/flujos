sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "bafar/flujos/flujos/model/models",
    "./utils/SendData",
    "./utils/ErrorFrag",
    "./libs/OneDrive"
  ],
  function (UIComponent, Device, models, SendData, ErrorFrag, OneDrive) {
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
        this.oOneDrive = new OneDrive(this);
      },
      exit: function () {
        this.oErrorFrag.destroy();
        delete this.oErrorFrag;
        delete this.flowData;
      },
      openErrorFrag: function (config, data, title) {
        this.oErrorFrag.open(config, data, title);
      },
      getCatDataComp: function (oPayload, oModel) {
        return new Promise((resolve, reject) => {
          oModel.create("/BaseSet", oPayload, {
            async: true,
            success: function (req, res) {
              resolve(res.data.to_pesal.results);
            },
            error: function (error) {
              reject(error);
            }
          });
        })
      }
    });
  }
);