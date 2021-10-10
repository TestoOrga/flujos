sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "bafar/flujos/flujos/model/models",
    "./utils/SendData",
    "./utils/ErrorFrag",
    "./libs/OneDrive",
    "sap/ui/model/json/JSONModel"
  ],
  function (UIComponent,
    Device,
    models,
    SendData,
    ErrorFrag,
    OneDrive,
    JSONModel) {
    "use strict";

    return UIComponent.extend("bafar.flujos.flujos.Component", {
      metadata: {
        manifest: "json",
      },
      flowData: {
        departamento: "",
        actividad: "",
        proceso: "",
        id: "",
        actTxt: ""
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        // get the path to the JSON file     
        this.activeHeaderForFlow = null;
        this.activeFlow = null;
        this.currentMode = 0;
        this.getModel("flowDescMap").attachRequestCompleted(function () {
          this.flowDescMap = this.getModel("flowDescMap").getData();
        }, this);
        this.flowDescMap = this.getModel("flowDescMap").getData();
        this.noTabFlows = [
          "NOM001001"
        ];

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
        oModel.setUseBatch(false);
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
      },
      getAprovalModel: function () {
        if (!this.oApprovalModel) {
          this.setModel(new JSONModel({}), "approvalView");
          this.oApprovalModel = this.getModel("approvalView");
        }
        return this.oApprovalModel;
      },
      getMode: function (currHash) {
        if (currHash.includes("aprobacion")) {
          return 3;
        } else if (currHash.includes("seguimiento")) {
          return 2;
        } else {
          return 1;
        }
      }
    });
  }
);