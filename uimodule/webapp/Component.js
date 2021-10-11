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

        /* ===========================================================
        Control del page en View ACCION, se usa para controlar busy
        Accion carga el control y activa busy
        Header creacion o aprobacion desactiva busy
        ============================================================= */
        this.accionViewPanel = null;

        /* ===========================================================
         Control del header creacion o aprobacion
         Header creacion o aprobacion lo carga en onInit
         Se usa para registrar y des-registrar eventos,
         evita que vistas no visibles respondan a eventos
        ============================================================= */
        this.activeHeaderForFlow = null;

        /* ===========================================================
         Controlador del header creacion o aprobacion
         Header creacion o aprobacion lo carga antes de cargar el
         flujo seleccionado
         Se usa para poder acceder a las funciones del controlador
         principalmente resetFlow()
        ============================================================= */
        this.activeFlow = null;

        /* ===========================================================
          Creacion 1; Seguimiento 2; Aprobacion 3
          Lo fija ACCION
        ============================================================= */
        this.currentMode = 0;

        //JSON en localData con la descripción, texto e iconos
        this.getModel("flowDescMap").attachRequestCompleted(function () {
          this.flowDescMap = this.getModel("flowDescMap").getData();
        }, this);
        //cuando carga FLP, manifest lo precarga
        this.flowDescMap = this.getModel("flowDescMap").getData();
        this.noTabFlows = [
          "NOM001001"
        ];

        //Objeto para mappear y grabar informacion de flujo en creacion y Aprobacion
        this.oSendData = new SendData(this);


        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        //Fragmento de errores de creacion de flujo 
        this.oErrorFrag = new ErrorFrag(this.getRootControl());

        /* ===========================================================
         Objeto para carga, descarga y borrado de archivos,
         Obtiene rutas de back y graba resultados en back
        ============================================================= */
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

      /* ===========================================================
      Obtener datos de catalogo, siempre es la misma llamada 
      con diferente parametro
      Odata1 
      ============================================================= */
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

      //Accede al modelo de creacion oData2
      getAprovalModel: function () {
        if (!this.oApprovalModel) {
          this.setModel(new JSONModel({}), "approvalView");
          this.oApprovalModel = this.getModel("approvalView");
        }
        return this.oApprovalModel;
      },

      /* ===========================================================
        Obtiene el modo actual con base al Hash cuando se accede
        por link desde mail
      ============================================================= */
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